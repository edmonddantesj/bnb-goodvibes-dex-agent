#!/usr/bin/env bash
set -euo pipefail

# Slow terminal demo runner (no secrets). DRY run only.
# Uses env from vault file; key files must exist locally.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="/Users/silkroadcat/.openclaw/workspace/the-alpha-oracle/vault/bnb_goodvibes.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE"; exit 1
fi

set -a
source "$ENV_FILE"
set +a

export MULTI_MODE=rebalance
export UPDATE_MANIFEST=0
export TARGET_WBNB_BPS=5000
export MAX_SLIPPAGE_BPS=50
export THRESHOLD_USD=0.5
export WALLET_STABLE_MAX_TRADE_USD=1
export WALLET_AGGRO_MAX_TRADE_USD=2

echo "[1/2] multi:dry (Stable + Aggro)"
npm run multi:dry 2>&1 | python3 demo_assets/slowpipe.py --delay 0.03

echo
echo "[2/2] Done. Proof is in README + docs/proofs (LIVE already executed earlier)."
