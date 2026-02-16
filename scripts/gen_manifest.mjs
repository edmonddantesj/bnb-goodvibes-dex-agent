/* 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | module: gen_manifest | owner: Aoineco */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

const latestReport = arg('--latest-report');
if (!latestReport) {
  console.error('Usage: node scripts/gen_manifest.mjs --latest-report reports/<file>.json');
  process.exit(1);
}

const sdna = process.env.SDNA_ID || 'AOI-2026-0214-BNB-DEX-01';

// Prefer explicit env, otherwise use a stable default for hackathon reproducibility.
// Accept either full URL or owner/repo.
let repo = process.env.REPO_URL || process.env.REPO || '';
if (!repo) repo = 'edmonddantesj/bnb-goodvibes-dex-agent';

let commit = '';
try {
  commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
} catch {
  commit = '';
}

const manifest = {
  sdna,
  repo,
  commit,
  version: '0.1.0',
  created_at: new Date().toISOString(),
  artifacts: {
    latest_report: latestReport,
    demo_video: process.env.DEMO_URL || '',
    proof_urls: process.env.PROOF_URLS ? process.env.PROOF_URLS.split(',').map(s => s.trim()).filter(Boolean) : [],
    notes: ''
  },
  attribution: {
    sources: [
      { name: 'PancakeSwap docs', url: 'https://developer.pancakeswap.finance/contracts/infinity/overview', license: 'unknown' },
      { name: 'BNB hackathon repo', url: 'https://github.com/bnb-chain/good-vibes-only-openclaw-edition', license: 'unknown' }
    ],
    royalty_plan_ref: 'context/ROYALTY_AND_ATTRIBUTION_POLICY.md'
  }
};

fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
console.log('Wrote manifest.json');
