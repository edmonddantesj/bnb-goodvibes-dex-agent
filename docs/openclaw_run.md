<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 | doc: openclaw_run -->

# OpenClaw Run Guide (Good Vibes Only — OpenClaw Edition)

This repo is designed to be runnable **from a terminal** and easy to wrap into an OpenClaw job/runner.

## Quick run (DRY)

```bash
cd bnb-goodvibes-dex-agent
cp .env.example .env
# Fill RPC_URL + PRIVATE_KEY locally (never commit)

SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance UPDATE_MANIFEST=1 npm run rebalance:dry
```

## LIVE run (requires explicit confirmation)

```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance UPDATE_MANIFEST=1 CONFIRM_LIVE=YES npm run rebalance:live
```

## Dual-wallet run (risk segmentation)

- Stable wallet and Aggro wallet keys are stored in local files (not committed).

```bash
RPC_URL=... \
STABLE_KEY_FILE=~/aoi-vault/bnb_stable_private_key.txt \
AGGRO_KEY_FILE=~/aoi-vault/bnb_aggro_private_key.txt \
MULTI_MODE=rebalance UPDATE_MANIFEST=1 TARGET_WBNB_BPS=5000 \
MAX_SLIPPAGE_BPS=50 THRESHOLD_USD=0.5 \
WALLET_STABLE_MAX_TRADE_USD=1 WALLET_AGGRO_MAX_TRADE_USD=2 \
npm run multi:dry
```

## DRY/LIVE rules
- Default scripts are **DRY**.
- LIVE requires `CONFIRM_LIVE=YES`.
- Multi-wallet LIVE requires **double confirmation**: `CONFIRM_LIVE=YES` and `CONFIRM_MULTI_LIVE=YES`.

## Artifacts
- Every run writes a JSON report to `reports/`.
- Set `UPDATE_MANIFEST=1` to update `manifest.json` to point at the latest report.

## OpenClaw wrapper idea (optional)
If you are running via OpenClaw cron/jobs, call the same commands above and persist:
- `reports/*.json`
- `manifest.json`
- tx hashes in `docs/proofs/` or README
