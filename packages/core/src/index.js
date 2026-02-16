// BSC AI SkillKit Core (OSS)
// Minimal v0.1: token registry + quoting + safe swap planner

import { ethers } from 'ethers';

export const TOKENS = {
  WBNB: {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  },
  USDT: {
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955'
  }
};

export const PANCAKE_V2_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

export const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)'
];

export const ROUTER_ABI = [
  'function getAmountsOut(uint256 amountIn, address[] memory path) view returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)'
];

export function getProvider(rpcUrl) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function toAddr(x) {
  // Be tolerant of non-checksummed / oddly-cased addresses coming from env.
  // ethers.getAddress() will checksum a lowercase address.
  return ethers.getAddress(String(x).trim().toLowerCase());
}

export function bscscanTx(txHash) {
  return `https://bscscan.com/tx/${txHash}`;
}

export function slippageMinOut(quotedOut, slippageBps) {
  return (quotedOut * BigInt(10_000 - slippageBps)) / 10_000n;
}

export async function quoteOut({ router, amountIn, path }) {
  const amounts = await router.getAmountsOut(amountIn, path);
  return amounts?.[amounts.length - 1] ?? 0n;
}
