/* 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | module: run_baseline_stub | owner: Aoineco */

import fs from 'node:fs';
import path from 'node:path';

function nowKST() {
  const d = new Date();
  return d.toISOString();
}

function mkRunId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `run_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const SDNA_ID = process.env.SDNA_ID || 'AOI-2026-0214-BNB-DEX-01';
const MODE = process.env.MODE || 'baseline';

// Sample report only (NO TX): use this to validate S-DNA report plumbing and demo parsing.
// For real baseline onchain proof, use: npm run baseline:live
const runId = mkRunId();
const report = {
  sdna: SDNA_ID,
  run_id: runId,
  timestamp: nowKST(),
  chain: process.env.CHAIN || 'bsc',
  wallet: process.env.WALLET || '0x__FILL_WALLET__',
  mode: MODE,
  risk_gate: {
    max_slippage_bps: Number(process.env.MAX_SLIPPAGE_BPS || 50),
    max_tx_count: Number(process.env.MAX_TX_COUNT || 4),
    allow_tokens: (process.env.ALLOW_TOKENS || 'USDT,WBNB').split(',').filter(Boolean),
    deny_tokens: (process.env.DENY_TOKENS || '').split(',').filter(Boolean),
  },
  actions: [],
  snapshots: { before: {}, after: {} },
  notes: 'STUB: no onchain tx executed yet. Use this to validate S-DNA report plumbing.'
};

const outPath = path.join(process.cwd(), 'reports', `${runId}_${MODE}.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log('Wrote report:', outPath);
