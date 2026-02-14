<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 -->

# BNB Good Vibes Only — DeFi Agent (BSC) — Dual Track 10+10

This repo is a **reproducible** hackathon build: baseline is fully open-source; secret A/B run via **local plugins** (not committed).

## Proof Standard (S-DNA MVP)
- Every run writes a JSON report: `reports/run_<mode>_<ts>.json` (includes `sdna`)
- Repo root has `manifest.json` that links commit + artifacts

## Latest Onchain Proof (BSC mainnet)
- Baseline report: `reports/run_20260214_192247_baseline_live.json`
- Approve tx: https://bscscan.com/tx/0x10641f82e759d6a618a34d0b54a0dd6efc75657d43e0ef5148ba5825449f951c
- Swap tx: https://bscscan.com/tx/0x31743560c941d7becb05b221c442c06da68bedf486704f12141806b6e7c57d86

## Quick Start (baseline)
1) Copy env template:
```bash
cp .env.example .env
# fill RPC + PRIVATE KEY locally (never commit)
```

2) Install deps:
```bash
npm i
```

3) Run baseline (dry-run, no tx):
```bash
cp .env.example .env
# fill RPC_URL + PRIVATE_KEY locally
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=baseline npm run baseline:dry
```

4) Run baseline (LIVE onchain, requires explicit confirm):
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=baseline npm run baseline:live
```

5) Generate/update manifest:
```bash
node scripts/gen_manifest.mjs --latest-report reports/<your-report>.json
```

## Secret modes
- Put local plugins here (gitignored):
  - `strategies/secret_a.local.mjs`
  - `strategies/secret_b.local.mjs`

## Optional wallet risk gate (Cybercentry)
This repo includes a **disabled-by-default** wallet risk gate hook.

Enable it by setting these in your local `.env` (never commit secrets):
```bash
ENABLE_WALLET_RISK_GATE=1
CYBERCENTRY_ENDPOINT=<official endpoint>
CYBERCENTRY_API_KEY=<your key>
CYBERCENTRY_FAIL_CLOSED=1
```
- If the gate returns a non-benign verdict (or errors when fail-closed), LIVE execution will abort.

## Notes
- No private keys or secret strategy params are committed.
- Baseline should remain enough to reproduce and verify on-chain proof.

## Transparency
- Build log: `AUTONOMOUS_LOG.md`
- Security & ethics stance: `SECURITY_ETHICS.md`
