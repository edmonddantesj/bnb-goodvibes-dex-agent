<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 -->

# AUTONOMOUS_LOG — Build & Proof Ledger (OpenClaw)

This file exists to provide a **human-auditable** record that the project was built via an agentic workflow using **OpenClaw** with a multi-agent squad (strategy/build/security/record).

## What this project is
- BNB Good Vibes Only: OpenClaw Edition — BSC DeFi Agent (baseline proof runner)
- Proof-first: runs produce deterministic artifacts (S‑DNA) + onchain tx hashes.

## S‑DNA Standard
- S‑DNA ID: `AOI-2026-0214-BNB-DEX-01`
- Every run writes a report JSON under `reports/` containing `sdna`, `risk_gate`, `actions[]`, and tx hashes.
- Repo root `manifest.json` binds commit + latest report + proof URLs.

## Agent roles (squad)
- **Aoineco (청묘)** — Orchestrator: scope, workflow, review, integration
- **청령** — Strategy/PM: product concept, roadmap, scoring patterns
- **청검** — Security/Compliance: risk gates, anti-abuse positioning, red flags
- **청섬** — Builder: onchain runner implementation (approve + swap), CLI, artifacts
- **청비** — Record: proof packaging, README/manifest/report standards

## Key safety constraints (non-negotiable)
- No private keys committed. `.env` is gitignored.
- LIVE execution requires explicit `CONFIRM_LIVE=YES`.
- Baseline uses conservative defaults (slippage cap, allowlist tokens).
- No MEV / no sniping / no “guaranteed profit” positioning.

## Onchain proof (baseline)
- Baseline live report: `reports/run_20260214_192247_baseline_live.json`
- Approve tx: https://bscscan.com/tx/0x10641f82e759d6a618a34d0b54a0dd6efc75657d43e0ef5148ba5825449f951c
- Swap tx: https://bscscan.com/tx/0x31743560c941d7becb05b221c442c06da68bedf486704f12141806b6e7c57d86

## How to verify
1) Re-run in DRY_RUN (no tx):
```bash
npm i
cp .env.example .env
# fill RPC_URL + PRIVATE_KEY locally
npm run baseline:dry
```
2) Check generated report JSON under `reports/`.
3) For LIVE proof, run `npm run baseline:live` and verify tx hashes on BscScan.

## Notes
- This log is for transparency of the build process and safety posture. It does not claim financial advice.
