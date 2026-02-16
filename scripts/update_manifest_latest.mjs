/* Update manifest.json using the most recent report in reports/ */

import fs from 'node:fs';
import path from 'node:path';

function latestReport() {
  const dir = path.join(process.cwd(), 'reports');
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join('reports', f));
  if (!files.length) throw new Error('No report JSON files found under reports/');
  files.sort((a,b) => fs.statSync(path.join(process.cwd(), b)).mtimeMs - fs.statSync(path.join(process.cwd(), a)).mtimeMs);
  return files[0];
}

const report = latestReport();
console.error('[manifest] latest report:', report);

const { spawnSync } = await import('node:child_process');
const res = spawnSync('node', ['scripts/gen_manifest.mjs', '--latest-report', report], { stdio: 'inherit' });
process.exit(res.status ?? 1);
