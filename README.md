<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 -->

# BNB Good Vibes Only — DeFi Agent (BSC) — Dual Track 10+10

**Judge TL;DR (why this is different):**
- **Safety-by-default:** DRY_RUN is the default; LIVE requires explicit confirmations.
- **Proof-first artifacts:** JSON report per run + `manifest.json` pinned to a commit (see `docs/sample_report_rebalance_dry.json`).
- **Verifiable execution:** real BscScan tx links included (see “Latest Onchain Proof”).
- **60s demo video:** https://youtu.be/pRaU3KDAxxM

**One-sentence hook:** A safety-bounded OpenClaw DeFi agent SkillKit that executes deterministic WBNB/USDT portfolio rebalancing on BSC with reproducible proof artifacts and verified onchain transactions.

This repo is a **reproducible** hackathon build: baseline is fully open-source; secret A/B run via **local plugins** (not committed).

## What you can do with it (2 real use cases)
- **Personal/treasury ops:** keep a 2-token portfolio near a target ratio (e.g., 50/50 WBNB/USDT) with strict safety caps.
- **Agent infra:** reuse the ‘safe onchain action’ skeleton (quotes → minOut → gated approve/swap → report/manifest proof artifacts).

## Safety-by-default
- Default mode is **DRY_RUN** (no tx).
- LIVE requires explicit opt-in: **CONFIRM_LIVE=YES**.
- Risk caps: `MAX_SLIPPAGE_BPS`, `MAX_TRADE_USD`, and thresholding.
- Secrets are local-only (`.env` is gitignored).

## Proof Standard (S-DNA MVP)
- Every run writes a JSON report: `reports/run_<mode>_<ts>.json` (includes `sdna`)
- Repo root has `manifest.json` that links commit + artifacts

## Latest Onchain Proof (BSC mainnet)
### Baseline (single wallet)
- Baseline report: `reports/run_20260214_192247_baseline_live.json`
- Approve tx: https://bscscan.com/tx/0x10641f82e759d6a618a34d0b54a0dd6efc75657d43e0ef5148ba5825449f951c
- Swap tx: https://bscscan.com/tx/0x31743560c941d7becb05b221c442c06da68bedf486704f12141806b6e7c57d86

### Rebalance (dual wallet: Stable + Aggro)
- Stable report: `reports/run_20260216_181513_stable_rebalance_live.json`
  - tx1: https://bscscan.com/tx/0x2c19ca8fc0878bc927625fadd5f3a7b024b88f2ee0486ea8b3d1ab7ac60c8a48
  - tx2: https://bscscan.com/tx/0x7ff1054e4f2f6e365fb752374d0d10794ba44dd140577e0828617e9dc3e72970
- Aggro report: `reports/run_20260216_181521_aggro_rebalance_live.json`
  - tx1: https://bscscan.com/tx/0x2344a12e9c9baf3b4b662954b488571fd84af970d279ead0741608d6d24ce406
  - tx2: https://bscscan.com/tx/0x6ca5cc7bb3c2b26c4c3bd710cac76f310d07b419aa3df6ca12123617d5d52035

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

## Quick Start (rebalance: WBNB/USDT)
DRY (no tx):
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance UPDATE_MANIFEST=1 npm run rebalance:dry
```

LIVE (onchain, requires explicit confirm):
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance UPDATE_MANIFEST=1 CONFIRM_LIVE=YES npm run rebalance:live
```

Tip: after any run, `reports/` contains the JSON proof artifact and `manifest.json` points to the latest report when `UPDATE_MANIFEST=1` is set.


## Dual-wallet ops (Stable + Aggro)
If you want to validate **risk segmentation** (stable wallet vs aggro wallet) in one go, use the multi-wallet runner.

### Recommended: key files (local-only)
Create two local key files with strict perms (NEVER commit):
```bash
# example paths (pick your own)
mkdir -p ~/aoi-vault
chmod 700 ~/aoi-vault

# put raw hex private key inside each file
nano ~/aoi-vault/bnb_stable_private_key.txt
nano ~/aoi-vault/bnb_aggro_private_key.txt
chmod 600 ~/aoi-vault/bnb_*_private_key.txt
```

### Multi-wallet DRY (no tx)
```bash
RPC_URL=... STABLE_KEY_FILE=~/aoi-vault/bnb_stable_private_key.txt AGGRO_KEY_FILE=~/aoi-vault/bnb_aggro_private_key.txt MULTI_MODE=rebalance UPDATE_MANIFEST=1 TARGET_WBNB_BPS=5000 MAX_SLIPPAGE_BPS=50 THRESHOLD_USD=0.5 WALLET_STABLE_MAX_TRADE_USD=1 WALLET_AGGRO_MAX_TRADE_USD=2 npm run multi:dry
```

### Multi-wallet LIVE (onchain) — disabled by default
Requires **double confirmation**:
```bash
RPC_URL=... STABLE_KEY_FILE=~/aoi-vault/bnb_stable_private_key.txt AGGRO_KEY_FILE=~/aoi-vault/bnb_aggro_private_key.txt MULTI_MODE=rebalance UPDATE_MANIFEST=1 CONFIRM_LIVE=YES CONFIRM_MULTI_LIVE=YES npm run multi:live
```

Notes:
- LIVE is intentionally hard to trigger to prevent accidents.
- Reports include `wallet_label` so proofs are attributable.


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

## Artifact policy
- `reports/*.json` are **generated outputs** and are gitignored by default to prevent noisy diffs / accidental leakage.
- If a hackathon requires shipping a proof file, copy one report into `docs/` (or link the tx hash in README) and keep it redacted.
- See: `docs/sample_report_rebalance_dry.json` and `docs/sample_manifest.json`.

## OpenClaw Edition notes
- How to run this from an OpenClaw workflow: `docs/openclaw_run.md`
- Naming note: `baseline:stub` is **not** an onchain baseline. It only generates a sample report JSON to validate the S-DNA artifact plumbing.

## Notes
- No private keys or secret strategy params are committed.
- Baseline should remain enough to reproduce and verify on-chain proof.

## Transparency
- Build log: `AUTONOMOUS_LOG.md`
- Security & ethics stance: `SECURITY_ETHICS.md`

---

## AOI Guard Cheat Sheet (When commits are blocked)

This repo uses **AOI Guard** (default-deny). If a commit/push is blocked:

1) See what you staged:
```bash
git status
```

2) If you added a new file/folder intentionally, allow it (with Edmond approval):
```bash
# edit allowlist
nano .aoi-allowlist

# then
git add .aoi-allowlist
```

3) Re-stage only what you want, then commit:
```bash
git add <files>
git commit -m "..."
```

Rule of thumb: **new paths must be added to `.aoi-allowlist` first**, otherwise commits will be blocked.
