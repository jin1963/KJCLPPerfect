// staking.js — ใช้ร่วมกับ config.js (ที่รวม ABI/ที่อยู่ไว้แล้ว)
const MAX_UINT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

function ctrAuto() {
  return new web3.eth.Contract(AUTO_STAKER_ABI, CONFIG.autoStaker);
}
function ctrERC20(addr) {
  return new web3.eth.Contract(ERC20_MINI_ABI, addr);
}
function ctrRouter() {
  // ใช้แค่ getAmountsOut สำหรับประเมินราคา (อยู่ในสัญญา Router V2)
  const ABI = [
    {
      "constant": true,
      "inputs": [
        {"name":"amountIn","type":"uint256"},
        {"name":"path","type":"address[]"}
      ],
      "name":"getAmountsOut",
      "outputs":[{"name":"","type":"uint256[]"}],
      "payable":false,"stateMutability":"view","type":"function"
    }
  ];
  return new web3.eth.Contract(ABI, CONFIG.router);
}

// ===== Helpers =====
// แปลงทศนิยม 18
function toUnit18(numStr) { return web3.utils.toWei(numStr, 'ether'); }
function fromUnit18(bnStr, precision = 6) {
  const s = web3.utils.fromWei(bnStr, 'ether');
  const [i, d=''] = s.split('.');
  return d ? `${i}.${d.slice(0, precision)}` : i;
}

// Toast (fallback เป็น alert ถ้าไม่มี)
function _notify(msg, type='success') {
  if (typeof notify === 'function') return notify(msg, type);
  alert(msg);
}

// ตัวช่วยส่งธุรกรรม พร้อมแจ้งสถานะ
async function sendWithNotify(method, from, pendingMsg='กำลังส่งธุรกรรม...', successMsg='ทำรายการสำเร็จ') {
  _notify(pendingMsg, 'info');
  return new Promise((resolve, reject) => {
    method.send({ from })
      .on('transactionHash', (hash) => {
        _notify(`ส่งธุรกรรมแล้ว: ${hash.slice(0,10)}…`, 'info');
      })
      .on('receipt', (rcpt) => {
        _notify(successMsg, 'success');
        resolve(rcpt);
      })
      .on('error', (e) => {
        const msg = (e && e.message) ? e.message : String(e);
        if (/denied|reject/i.test(msg)) _notify('ยกเลิกธุรกรรม', 'error');
        else _notify('ทำรายการไม่สำเร็จ: ' + msg, 'error');
        reject(e);
      });
  });
}

// ===== Core actions =====
async function setReferrer() {
  try {
    if (!account) return _notify('กรุณาเชื่อมต่อกระเป๋าก่อน', 'error');

    // 0) กันสมัครซ้ำ: ถ้ามี referrer อยู่แล้ว แจ้งและจบ
    const auto = ctrAuto();
    try {
      const u = await auto.methods.users(account).call();
      if (u && u.referrer && /^0x0{40}$/i.test(u.referrer) === false) {
        return _notify(
          `คุณตั้งผู้แนะนำแล้ว: ${u.referrer.slice(0,6)}…${u.referrer.slice(-4)}`,
          'info'
        );
      }
    } catch (_) {}

    // 1) รับจากช่อง
    let ref = (document.getElementById('refAddress')?.value || '').trim();

    // 2) ถ้าไม่มี/ไม่ถูกต้อง → ใช้ค่าจาก URL หรือ localStorage
    if (!ref || !web3.utils.isAddress(ref)) {
      const url = new URL(location.href);
      const p = url.searchParams.get('ref');
      const saved = localStorage.getItem('kjc_ref');
      ref = web3.utils.isAddress(p) ? p : (web3.utils.isAddress(saved) ? saved : '');
    }

    if (!ref || !web3.utils.isAddress(ref)) {
      return _notify('ไม่พบที่อยู่ผู้แนะนำที่ถูกต้อง', 'error');
    }

    // บันทึกและอัปเดตแสดงผล
    localStorage.setItem('kjc_ref', ref);
    const r = document.getElementById('refResolved'); if (r) r.textContent = ref;
    const input = document.getElementById('refAddress'); if (input && !input.value) input.value = ref;

    // ส่งธุรกรรม
    await sendWithNotify(
      auto.methods.setReferrer(ref),
      account,
      'กำลังสมัคร Referrer...',
      `สมัครสำเร็จ ✅ ผู้แนะนำ: ${ref.slice(0,6)}…${ref.slice(-4)}`
    );
    fetchAndRenderUser?.();
  } catch (e) {
    console.error(e);
  }
}

async function quoteKJC() {
  try {
    if (!account) return _notify('เชื่อมกระเป๋าก่อน', 'error');
    const amtStr = document.getElementById('usdtAmount').value.trim();
    if (!amtStr || Number(amtStr) <= 0) return _notify('กรอกจำนวน USDT', 'error');

    const half = toUnit18((Number(amtStr) / 2).toString());
    const router = ctrRouter();
    const out = await router.methods.getAmountsOut(half, [CONFIG.usdt, CONFIG.kjc]).call();
    const kjcOut = out[1];
    document.getElementById('quoteBox').textContent =
      `ประมาณการ KJC ~ ${fromUnit18(kjcOut)} (จาก USDT ${Number(amtStr)/2})`;
    _notify('ประเมินราคาสำเร็จ', 'success');
  } catch (e) {
    console.error(e);
    document.getElementById('quoteBox').textContent = '-';
    _notify('ประเมินราคาไม่สำเร็จ (อาจเพราะ path/สภาพคล่อง)', 'error');
  }
}

async function buyAndStake() {
  try {
    if (!account) return _notify('เชื่อมกระเป๋าก่อน', 'error');
    const amtStr = document.getElementById('usdtAmount').value.trim();
    if (!amtStr || Number(amtStr) <= 0) return _notify('กรอกจำนวน USDT', 'error');

    const amount = toUnit18(amtStr);
    const usdt = ctrERC20(CONFIG.usdt);
    const auto = ctrAuto();

    // อนุมัติให้สัญญาดึง USDT ถ้ายังไม่พอ
    const allowance = await usdt.methods.allowance(account, CONFIG.autoStaker).call();
    if (web3.utils.toBN(allowance).lt(web3.utils.toBN(amount))) {
      await sendWithNotify(
        usdt.methods.approve(CONFIG.autoStaker, MAX_UINT),
        account,
        'กำลังอนุมัติ USDT ให้สัญญา...',
        'อนุมัติ USDT สำเร็จ'
      );
    }

    // ซื้อ → Add LP → Stake
    await sendWithNotify(
      auto.methods.buyAndStake(amount, 0),
      account,
      'กำลังทำรายการ Buy & Stake...',
      'สำเร็จ: ซื้อ → Add LP → Stake'
    );
    fetchAndRenderUser();
  } catch (e) {
    console.error(e);
  }
}

async function fetchAndRenderUser() {
  try {
    if (!account) return;
    const auto = ctrAuto();

    // อ่านจำนวนโพสิชัน
    const len = Number(await auto.methods.stakesLength(account).call());
    let totalLP = web3.utils.toBN('0');
    let earliestNext = null;
    let earliestUnlock = null;
    let canWithdrawAny = false;

    for (let i = 0; i < len; i++) {
      const s = await auto.methods.stakeInfo(account, i).call();
      totalLP = totalLP.add(web3.utils.toBN(s.amount));

      const next = await auto.methods.nextClaimTime(account, i).call();
      const unl  = await auto.methods.unlockTime(account, i).call();
      const canW = await auto.methods.canWithdrawIndex(account, i).call();

      if (next > 0 && (earliestNext === null || Number(next) < earliestNext)) earliestNext = Number(next);
      if (unl  > 0 && (earliestUnlock === null || Number(unl) < earliestUnlock)) earliestUnlock = Number(unl);
      if (canW) canWithdrawAny = true;
    }

    // อัปเดต UI แบบรวม
    document.getElementById('uiStakedLP').textContent = len ? fromUnit18(totalLP.toString()) : '-';
    document.getElementById('uiLastClaim').textContent = '(อ้างอิงรายโพสิชัน)';
    document.getElementById('uiNextClaim').textContent   = earliestNext   ? new Date(earliestNext*1000).toLocaleString()   : '-';
    document.getElementById('uiUnlockAt').textContent    = earliestUnlock ? new Date(earliestUnlock*1000).toLocaleString() : '-';
    document.getElementById('uiCanWithdraw').textContent = canWithdrawAny ? 'พร้อมถอนบางโพสิชัน' : 'ยังไม่ครบกำหนด';

    const ref = await auto.methods.claimableReferralReward(account).call();
    document.getElementById('uiRefRewards').textContent = fromUnit18(ref) + ' KJC';
  } catch (e) {
    console.error(e);
  }
}

async function withdrawLP() {
  try {
    if (!account) return _notify('เชื่อมกระเป๋าก่อน', 'error');
    const auto = ctrAuto();
    await sendWithNotify(
      auto.methods.withdrawAllUnlocked(),
      account,
      'กำลังถอน LP ที่ปลดล็อกแล้ว...',
      'ถอน LP สำเร็จ'
    );
    fetchAndRenderUser();
  } catch (e) {
    console.error(e);
  }
}

async function claimStakingReward() {
  try {
    if (!account) return _notify('เชื่อมกระเป๋าก่อน', 'error');
    const auto = ctrAuto();
    await sendWithNotify(
      auto.methods.claimStakingReward(),
      account,
      'กำลังเคลมรางวัล Staking...',
      'เคลมรางวัล Staking สำเร็จ'
    );
    fetchAndRenderUser();
  } catch (e) {
    console.error(e);
  }
}

async function claimReferralReward() {
  try {
    if (!account) return _notify('เชื่อมกระเป๋าก่อน', 'error');
    const auto = ctrAuto();
    await sendWithNotify(
      auto.methods.claimReferralReward(),
      account,
      'กำลังเคลมรางวัล Referral...',
      'เคลม Referral สำเร็จ'
    );
    fetchAndRenderUser();
  } catch (e) {
    console.error(e);
  }
}
