/* 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | module: run_baseline_live | owner: Aoineco */

// PancakeSwap V2 baseline proof runner (BSC mainnet)
// - DRY_RUN by default
// - LIVE requires: CONFIRM_LIVE=YES
// - Writes S-DNA report to reports/run_<id>_<mode>.json

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { ethers } from 'ethers';
import { checkWalletRisk } from './cybercentry_wallet_gate.mjs';

const SDNA_ID = process.env.SDNA_ID || 'AOI-2026-0214-BNB-DEX-01';
const MODE = process.env.MODE || 'baseline';
const WALLET_LABEL = process.env.WALLET_LABEL || '';
const RUN_TAG = process.env.RUN_TAG || WALLET_LABEL || '';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONFIRM_LIVE = process.env.CONFIRM_LIVE || 'NO';
const LIVE = CONFIRM_LIVE === 'YES';

const MAX_SLIPPAGE_BPS = Number(process.env.MAX_SLIPPAGE_BPS || 50);

// Defaults: keep tiny for proof
const AMOUNT_IN_USDT = Number(process.env.AMOUNT_IN_USDT || 3); // $3

// BSC mainnet addresses
const PANCAKE_V2_ROUTER = ethers.getAddress((process.env.PANCAKE_V2_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E').toLowerCase());
const USDT = ethers.getAddress((process.env.USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955').toLowerCase());
const WBNB = ethers.getAddress((process.env.WBNB_ADDRESS || '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c').toLowerCase());

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)'
];

const ROUTER_ABI = [
  'function getAmountsOut(uint256 amountIn, address[] memory path) view returns (uint256[] memory amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)'
];

function isoNow() {
  return new Date().toISOString();
}

function mkRunId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `run_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function bscscanTx(txHash) {
  return `https://bscscan.com/tx/${txHash}`;
}

function must(x, name) {
  if (!x) throw new Error(`Missing required env: ${name}`);
  return x;
}

async function main() {
  must(RPC_URL, 'RPC_URL');
  must(PRIVATE_KEY, 'PRIVATE_KEY');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Optional wallet risk gate (Cybercentry)
  const walletRisk = await checkWalletRisk({ wallet: wallet.address, chain: 'bsc' });
  if (walletRisk?.enabled && walletRisk?.status === 'fail') {
    throw new Error(`Wallet risk gate FAILED: ${walletRisk.reason || walletRisk.risk || 'unknown'}`);
  }

  const usdt = new ethers.Contract(USDT, ERC20_ABI, wallet);
  const wbnb = new ethers.Contract(WBNB, ERC20_ABI, wallet);
  const router = new ethers.Contract(PANCAKE_V2_ROUTER, ROUTER_ABI, wallet);

  const [usdtDec, wbnbDec, usdtSym, wbnbSym] = await Promise.all([
    usdt.decimals(),
    wbnb.decimals(),
    usdt.symbol().catch(() => 'USDT'),
    wbnb.symbol().catch(() => 'WBNB')
  ]);

  const runId = mkRunId() + (RUN_TAG ? `_${RUN_TAG}` : '');

  const amountIn = ethers.parseUnits(String(AMOUNT_IN_USDT), usdtDec);
  const pathAddr = [USDT, WBNB];

  const before = {
    usdt: (await usdt.balanceOf(wallet.address)).toString(),
    wbnb: (await wbnb.balanceOf(wallet.address)).toString(),
    wallet: wallet.address
  };

  // Quote
  const amounts = await router.getAmountsOut(amountIn, pathAddr);
  const quotedOut = amounts?.[1] ?? 0n;
  const minOut = (quotedOut * BigInt(10_000 - MAX_SLIPPAGE_BPS)) / 10_000n;

  const actions = [];

  // Allowance + approve if needed
  const allowance = await usdt.allowance(wallet.address, PANCAKE_V2_ROUTER);
  if (allowance < amountIn) {
    if (!LIVE) {
      actions.push({
        type: 'approve',
        txHash: null,
        explorerUrl: null,
        status: 'dry_run',
        details: { needed: amountIn.toString(), allowance: allowance.toString() }
      });
    } else {
      const tx = await usdt.approve(PANCAKE_V2_ROUTER, amountIn);
      actions.push({ type: 'approve', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
      const receipt = await tx.wait();
      actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
    }
  }

  // Swap
  if (!LIVE) {
    actions.push({
      type: 'swap',
      txHash: null,
      explorerUrl: null,
      status: 'dry_run',
      details: {
        from: usdtSym,
        to: wbnbSym,
        amountIn: amountIn.toString(),
        quotedOut: quotedOut.toString(),
        minOut: minOut.toString(),
        slippageBps: MAX_SLIPPAGE_BPS
      }
    });
  } else {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    const tx = await router.swapExactTokensForTokens(amountIn, minOut, pathAddr, wallet.address, deadline);
    actions.push({ type: 'swap', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
    const receipt = await tx.wait();
    actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
  }

  const after = {
    usdt: (await usdt.balanceOf(wallet.address)).toString(),
    wbnb: (await wbnb.balanceOf(wallet.address)).toString()
  };

  const report = {
  wallet_label: WALLET_LABEL || undefined,
    sdna: SDNA_ID,
    run_id: runId,
    timestamp: isoNow(),
    chain: 'bsc',
    wallet: wallet.address,
    mode: MODE,
    execution: LIVE ? 'LIVE' : 'DRY_RUN',
    risk_gate: {
      max_slippage_bps: MAX_SLIPPAGE_BPS,
      max_tx_count: Number(process.env.MAX_TX_COUNT || 4),
      allow_tokens: (process.env.ALLOW_TOKENS || 'USDT,WBNB').split(',').filter(Boolean),
      deny_tokens: (process.env.DENY_TOKENS || '').split(',').filter(Boolean),
      user_confirmed_execution: LIVE
    },
    quote: {
      from: usdtSym,
      to: wbnbSym,
      amount_in: amountIn.toString(),
      quoted_out: quotedOut.toString(),
      min_out: minOut.toString(),
      slippage_bps: MAX_SLIPPAGE_BPS
    },
    wallet_risk_gate: walletRisk,
    actions,
    snapshots: { before, after },
    notes: LIVE
      ? 'LIVE run executed onchain. Verify tx hashes on BscScan.'
      : 'DRY_RUN only. Set CONFIRM_LIVE=YES to execute onchain.'
  };

  const outPath = path.join(process.cwd(), 'reports', `${runId}_${MODE}_${LIVE ? 'live' : 'dry'}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Wrote report:', outPath);

  const proofUrls = actions.filter(a => a?.txHash).map(a => a.explorerUrl);
  if (proofUrls.length) {
    console.log('Proof URLs:');
    for (const u of proofUrls) console.log('-', u);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
