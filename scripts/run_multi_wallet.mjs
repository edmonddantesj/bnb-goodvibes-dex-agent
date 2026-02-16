/* Multi-wallet runner: Stable + Aggro sequential test harness
   - Reads private keys from files (recommended) or env
   - Executes baseline/rebalance runners with wallet labels
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function must(x, name) {
  if (!x) throw new Error(`Missing required env: ${name}`);
  return x;
}

function readKeyFile(fp) {
  const raw = fs.readFileSync(fp, 'utf8').trim();
  if (!raw) throw new Error(`Empty key file: ${fp}`);
  return raw;
}

function runOne({ label, privateKey, mode, live }) {
  const env = { ...process.env };
  env.WALLET_LABEL = label;
  env.RUN_TAG = label;
  env.MODE = mode;
  env.PRIVATE_KEY = privateKey;

  // Keep safety caps per-wallet if user provided WALLET_<LABEL>_MAX_TRADE_USD
  const capKey = `WALLET_${label.toUpperCase()}_MAX_TRADE_USD`;
  if (process.env[capKey]) env.MAX_TRADE_USD = process.env[capKey];

  const script = mode === 'baseline' ? 'baseline:dry' : 'rebalance:dry';
  const scriptLive = mode === 'baseline' ? 'baseline:live' : 'rebalance:live';

  const cmd = live ? ['run', scriptLive] : ['run', script];

  const res = spawnSync('npm', cmd, { stdio: 'inherit', env });
  if ((res.status ?? 1) !== 0) {
    throw new Error(`[multi] ${label} ${mode} ${live ? 'LIVE' : 'DRY'} failed`);
  }
}

function main() {
  const RPC_URL = must(process.env.RPC_URL, 'RPC_URL');
  void RPC_URL; // ensure present

  const TARGET = process.env.MULTI_MODE || 'rebalance'; // rebalance|baseline|both
  const LIVE = process.env.CONFIRM_LIVE === 'YES' && (process.env.CONFIRM_MULTI_LIVE === 'YES');

  // key sources
  const stableFile = process.env.STABLE_KEY_FILE;
  const aggroFile = process.env.AGGRO_KEY_FILE;

  const stableKey = stableFile ? readKeyFile(stableFile) : must(process.env.PRIVATE_KEY_STABLE, 'PRIVATE_KEY_STABLE (or STABLE_KEY_FILE)');
  const aggroKey = aggroFile ? readKeyFile(aggroFile) : must(process.env.PRIVATE_KEY_AGGRO, 'PRIVATE_KEY_AGGRO (or AGGRO_KEY_FILE)');

  console.log('=== Multi-wallet run ===');
  console.log('Wallets: stable + aggro');
  console.log('Target:', TARGET);
  console.log('Execution:', LIVE ? 'LIVE (double-confirmed)' : 'DRY_RUN');
  console.log('========================');

  const modes = TARGET === 'both' ? ['baseline', 'rebalance'] : [TARGET];

  for (const mode of modes) {
    runOne({ label: 'stable', privateKey: stableKey, mode, live: LIVE });
    runOne({ label: 'aggro', privateKey: aggroKey, mode, live: LIVE });
  }

  // optional manifest refresh
  if (process.env.UPDATE_MANIFEST === '1' || process.env.UPDATE_MANIFEST === 'YES') {
    console.log('[manifest] UPDATE_MANIFEST=1 → updating manifest.json with latest report...');
    spawnSync('npm', ['run', 'manifest:latest'], { stdio: 'inherit', env: process.env });
  }
}

main();
