/* 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | module: run_rebalance_live | owner: Aoineco */

// 2-token portfolio rebalance demo (WBNB/USDT) on BSC mainnet via PancakeSwap V2
// - DRY_RUN by default
// - LIVE requires: CONFIRM_LIVE=YES
// - Writes S-DNA report to reports/run_<ts>_rebalance_<dry|live>.json

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { ethers } from 'ethers';
import {
  TOKENS,
  PANCAKE_V2_ROUTER,
  ERC20_ABI,
  ROUTER_ABI,
  bscscanTx,
  slippageMinOut,
  quoteOut,
  toAddr
} from '../packages/core/src/index.js';

const SDNA_ID = process.env.SDNA_ID || 'AOI-2026-0214-BNB-DEX-01';
const MODE = process.env.MODE || 'rebalance';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONFIRM_LIVE = process.env.CONFIRM_LIVE || 'NO';
const LIVE = CONFIRM_LIVE === 'YES';

const TARGET = Number(process.env.TARGET_WBNB_RATIO || 0.5); // 0..1
const MAX_SLIPPAGE_BPS = Number(process.env.MAX_SLIPPAGE_BPS || 50);
const MAX_TRADE_USD = Number(process.env.MAX_TRADE_USD || 20); // cap risk
const THRESHOLD_USD = Number(process.env.THRESHOLD_USD || 1);  // ignore tiny deltas

function must(x, name) {
  if (!x) throw new Error(`Missing required env: ${name}`);
  return x;
}

function isoNow() {
  return new Date().toISOString();
}

function mkRunId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `run_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

async function main() {
  must(RPC_URL, 'RPC_URL');
  must(PRIVATE_KEY, 'PRIVATE_KEY');

  const target = clamp(TARGET, 0, 1);
  if (!Number.isFinite(target)) throw new Error('TARGET_WBNB_RATIO invalid');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const WBNB = toAddr(process.env.WBNB_ADDRESS || TOKENS.WBNB.address);
  const USDT = toAddr(process.env.USDT_ADDRESS || TOKENS.USDT.address);
  const ROUTER = toAddr(process.env.PANCAKE_V2_ROUTER || PANCAKE_V2_ROUTER);

  const wbnb = new ethers.Contract(WBNB, ERC20_ABI, wallet);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, wallet);
  const router = new ethers.Contract(ROUTER, ROUTER_ABI, wallet);

  const [wbnbDec, usdtDec] = await Promise.all([wbnb.decimals(), usdt.decimals()]);

  const runId = mkRunId();

  // balances
  const [balWBNB, balUSDT] = await Promise.all([
    wbnb.balanceOf(wallet.address),
    usdt.balanceOf(wallet.address)
  ]);

  // price: 1 WBNB -> USDT (quote)
  const oneWBNB = ethers.parseUnits('1', wbnbDec);
  const wbnbToUsdt = await quoteOut({ router, amountIn: oneWBNB, path: [WBNB, USDT] });

  // portfolio value in USDT (approx)
  // valueWBNB = balWBNB * price / 10^wbnbDec
  const valueWBNB = (balWBNB * wbnbToUsdt) / (10n ** BigInt(wbnbDec));
  const valueUSDT = balUSDT;
  const total = valueWBNB + valueUSDT;

  const targetWBNBValue = BigInt(Math.floor(Number(total) * target));
  // NOTE: using Number(total) is safe only for small demo balances; keep small caps in demo.

  // delta in USDT units (positive => too much WBNB)
  const delta = valueWBNB - targetWBNBValue;

  const actions = [];

  const reportBase = {
    sdna: SDNA_ID,
    run_id: runId,
    timestamp: isoNow(),
    chain: 'bsc',
    wallet: wallet.address,
    mode: MODE,
    execution: LIVE ? 'LIVE' : 'DRY_RUN',
    params: {
      target_wbnb_ratio: target,
      max_slippage_bps: MAX_SLIPPAGE_BPS,
      max_trade_usd: MAX_TRADE_USD,
      threshold_usd: THRESHOLD_USD
    },
    snapshot: {
      balances: {
        wbnb: balWBNB.toString(),
        usdt: balUSDT.toString()
      },
      price: {
        wbnb_to_usdt_for_1_wbnb: wbnbToUsdt.toString()
      },
      value_usdt: {
        wbnb: valueWBNB.toString(),
        usdt: valueUSDT.toString(),
        total: total.toString()
      }
    },
    actions
  };

  // If delta is small, do nothing
  const threshold = ethers.parseUnits(String(THRESHOLD_USD), usdtDec);
  if (delta >= -threshold && delta <= threshold) {
    actions.push({ type: 'noop', status: 'ok', reason: 'within threshold' });
  } else {
    // Cap trade size
    const maxTrade = ethers.parseUnits(String(MAX_TRADE_USD), usdtDec);

    if (delta > 0n) {
      // sell WBNB -> USDT by roughly delta USDT value
      const tradeUsdtValue = delta > maxTrade ? maxTrade : delta;
      // amountWBNBIn = tradeUsdtValue / price
      const amountInWBNB = (tradeUsdtValue * (10n ** BigInt(wbnbDec))) / wbnbToUsdt;

      const quotedOut = await quoteOut({ router, amountIn: amountInWBNB, path: [WBNB, USDT] });
      const minOut = slippageMinOut(quotedOut, MAX_SLIPPAGE_BPS);

      // approve WBNB if needed
      const allowance = await wbnb.allowance(wallet.address, ROUTER);
      if (allowance < amountInWBNB) {
        if (!LIVE) {
          actions.push({ type: 'approve', token: 'WBNB', status: 'dry_run' });
        } else {
          const tx = await wbnb.approve(ROUTER, amountInWBNB);
          actions.push({ type: 'approve', token: 'WBNB', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
          const receipt = await tx.wait();
          actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
        }
      }

      if (!LIVE) {
        actions.push({
          type: 'swap',
          direction: 'WBNB->USDT',
          status: 'dry_run',
          details: { amountIn: amountInWBNB.toString(), quotedOut: quotedOut.toString(), minOut: minOut.toString() }
        });
      } else {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
        const tx = await router.swapExactTokensForTokens(amountInWBNB, minOut, [WBNB, USDT], wallet.address, deadline);
        actions.push({ type: 'swap', direction: 'WBNB->USDT', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
        const receipt = await tx.wait();
        actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
      }
    } else {
      // buy WBNB using USDT -> WBNB
      const tradeUsdtIn = (-delta) > maxTrade ? maxTrade : (-delta);
      const quotedOut = await quoteOut({ router, amountIn: tradeUsdtIn, path: [USDT, WBNB] });
      const minOut = slippageMinOut(quotedOut, MAX_SLIPPAGE_BPS);

      // approve USDT if needed
      const allowance = await usdt.allowance(wallet.address, ROUTER);
      if (allowance < tradeUsdtIn) {
        if (!LIVE) {
          actions.push({ type: 'approve', token: 'USDT', status: 'dry_run' });
        } else {
          const tx = await usdt.approve(ROUTER, tradeUsdtIn);
          actions.push({ type: 'approve', token: 'USDT', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
          const receipt = await tx.wait();
          actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
        }
      }

      if (!LIVE) {
        actions.push({
          type: 'swap',
          direction: 'USDT->WBNB',
          status: 'dry_run',
          details: { amountIn: tradeUsdtIn.toString(), quotedOut: quotedOut.toString(), minOut: minOut.toString() }
        });
      } else {
        const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
        const tx = await router.swapExactTokensForTokens(tradeUsdtIn, minOut, [USDT, WBNB], wallet.address, deadline);
        actions.push({ type: 'swap', direction: 'USDT->WBNB', txHash: tx.hash, explorerUrl: bscscanTx(tx.hash), status: 'submitted' });
        const receipt = await tx.wait();
        actions[actions.length - 1].status = receipt?.status === 1 ? 'success' : 'failed';
      }
    }
  }

  // write report
  const outPath = path.join(process.cwd(), 'reports', `${runId}_${MODE}_${LIVE ? 'live' : 'dry'}.json`);
  fs.writeFileSync(outPath, JSON.stringify({
    ...reportBase,
    notes: LIVE ? 'LIVE run executed onchain.' : 'DRY_RUN only. Set CONFIRM_LIVE=YES to execute onchain.'
  }, null, 2));

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
