// wallet.js — สำหรับ Web3.js
let web3, account;

function hasWeb3() {
  return typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined';
}

// === Toast helper (ใช้ร่วมกับ staking.js ได้) ===
window.notify = (msg, type='success') => {
  const el = document.getElementById('toast');
  if (!el) return alert(msg);
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
};

// ช่วยสลับ chain เป็น BSC
async function ensureBSC() {
  const cur = await window.ethereum.request({ method: 'eth_chainId' });
  if (cur !== CONFIG.chainIdHex) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.chainIdHex }]
      });
    } catch (e) {
      if (e.code === 4902) {
        // chain ไม่ได้ถูกเพิ่ม → ขอเพิ่มเข้า wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CONFIG.chainIdHex,
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: [CONFIG.rpcUrl],
            blockExplorerUrls: ['https://bscscan.com/']
          }]
        });
      } else {
        throw e;
      }
    }
  }
}

async function connectWallet() {
  try {
    if (!hasWeb3()) {
      notify('กรุณาติดตั้ง MetaMask หรือใช้ Bitget/OKX Wallet ก่อน', 'error');
      return;
    }

    notify('กำลังเชื่อมต่อกระเป๋า...', 'info');

    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await ensureBSC();
    } else {
      web3 = new Web3(window.web3.currentProvider);
    }

    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById('status').textContent = `✅ เชื่อมต่อแล้ว: ${account}`;
    notify('เชื่อมต่อสำเร็จ', 'success');

    // ลิงก์แนะนำของฉัน
    const myLink = `${location.origin}${location.pathname}?ref=${account}`;
    const refBox = document.getElementById('myRefLink');
    if (refBox) {
      refBox.value = myLink;
      const hint = document.getElementById('refHint');
      if (hint) hint.textContent = 'คัดลอกลิงก์แล้วนำไปแชร์ได้เลย';
    }

    // resolve ref จาก URL หรือ localStorage
    const url = new URL(location.href);
    let refParam = url.searchParams.get('ref');
    if (!refParam) {
      const saved = localStorage.getItem('kjc_ref');
      if (saved) refParam = saved;
    }
    if (refParam && web3.utils.isAddress(refParam)) {
      const input = document.getElementById('refAddress');
      if (input && !input.value) input.value = refParam;
      localStorage.setItem('kjc_ref', refParam);
      const r = document.getElementById('refResolved');
      if (r) r.textContent = refParam;
    }

    // รีเฟรชข้อมูล
    if (typeof fetchAndRenderUser === 'function') fetchAndRenderUser();

    // ฟัง event เปลี่ยนบัญชี/เครือข่าย
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', () => location.reload());
      window.ethereum.on('chainChanged', () => location.reload());
    }
  } catch (err) {
    console.error(err);
    notify('เชื่อมต่อกระเป๋าไม่สำเร็จ: ' + (err?.message || err), 'error');
  }
}

async function copyRefLink() {
  const el = document.getElementById('myRefLink');
  if (!el || !el.value) return;
  try {
    await navigator.clipboard.writeText(el.value);
    notify('คัดลอกลิงก์แล้ว ✅', 'success');
  } catch {
    el.select(); el.setSelectionRange(0, 99999);
    const ok = document.execCommand && document.execCommand('copy');
    notify(ok ? 'คัดลอกลิงก์แล้ว ✅' : 'คัดลอกลิงก์ไม่สำเร็จ', ok ? 'success' : 'error');
  }
}
