// config.js — รวมทุกอย่างในไฟล์เดียว

// ---- NETWORK & ADDRESSES ----
const CONFIG = {
  chainIdHex: '0x38', // BSC mainnet
  rpcUrl: 'https://bsc-dataseed.binance.org',
  usdt:  '0x55d398326f99059fF775485246999027B3197955',
  kjc:   '0xd479ae350dc24168e8db863c5413c35fb2044ecd',
  lp:    '0xdF0d76046E72C183142c5208Ea0247450475A0DF',
  router:'0x10ED43C718714eb63d5aA57B78B54704E256024E',
  autoStaker: '0xDF6b772A64117dd29688B7B53E89F81EF1091627',
  // decimals
  usdtDecimals: 18,
  kjcDecimals: 18,
  lpDecimals: 18
};

// ---- ABI: AutoStaker (Positions + Multi-Ref 10/3/2) ----
const AUTO_STAKER_ABI = [/* …วาง ABI ที่คุณส่งมา… */ 
{"inputs":[{"internalType":"address","name":"_usdt","type":"address"},{"internalType":"address","name":"_kjc","type":"address"},{"internalType":"address","name":"_lpToken","type":"address"},{"internalType":"address","name":"_router","type":"address"},{"internalType":"uint256","name":"_apyBps","type":"uint256"},{"internalType":"uint256","name":"_claimInterval","type":"uint256"},{"internalType":"uint256","name":"_lockDuration","type":"uint256"},{"internalType":"uint256","name":"_ref1_bps","type":"uint256"},{"internalType":"uint256","name":"_ref2_bps","type":"uint256"},{"internalType":"uint256","name":"_ref3_bps","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"lpAmount","type":"uint256"}],"name":"LPWithdrawn","type":"event"},
{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"OwnerKJCWithdrawal","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"rewardAmount","type":"uint256"}],"name":"ReferralRewardClaimed","type":"event"},
{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RescueBNB","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RescueTokens","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"liquidityAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"index","type":"uint256"}],"name":"Staked","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"rewardAmount","type":"uint256"}],"name":"StakingRewardClaimed","type":"event"},
{"inputs":[],"name":"APY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"CLAIM_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"REF_BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"usdtAmount","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"buyAndStake","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"canWithdrawIndex","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"claimReferralReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"claimStakingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"claimableReferralReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"claimableStakingReward","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"kjc","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"lpToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"nextClaimTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueBNB","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[],"name":"router","outputs":[{"internalType":"contract IPancakeRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"setReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"stakeInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"stakesLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakesOf","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"n","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"unlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"usdt","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"referralRewards","type":"uint256"}],"stateMutability":"view","type":"function"},
{"inputs":[],"name":"withdrawAllUnlocked","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"withdrawByIndex","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawRemainingKJC","outputs":[],"stateMutability":"nonpayable","type":"function"},
{"stateMutability":"payable","type":"receive"}];

// ---- Minimal ERC20 ABI ----
const ERC20_MINI_ABI = [
  {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}
];

function fmt(amountBN, decimals = 18, precision = 6) {
  try {
    const v = ethers.utils.formatUnits(amountBN, decimals);
    const [i, d=''] = v.split('.');
    return d ? `${i}.${d.slice(0, precision)}` : i;
  } catch { return amountBN?.toString?.() ?? String(amountBN); }
}

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.AUTO_STAKER_ABI = AUTO_STAKER_ABI;
  window.ERC20_MINI_ABI = ERC20_MINI_ABI;
  window.fmt = fmt;

  window.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('contractAddr');
    if (el) el.textContent = CONFIG.autoStaker;
  });
}
