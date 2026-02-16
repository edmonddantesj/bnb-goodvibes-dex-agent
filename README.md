<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 (extend: SKILLKIT-REB01) -->

# BSC AI SkillKit — Safe Onchain Actions for Agents
**Demo:** 2-token Portfolio Rebalance (**WBNB/USDT**)  
**Chain:** BSC Mainnet  

## Why this is different (5 points)
1) **Infra-first:** a reusable SkillKit foundation (not a one-off agent demo).
2) **Safety-by-default:** allowlists, slippage caps, max trade limits, and explicit `CONFIRM_LIVE=YES`.
3) **Reproducible:** DRY_RUN works for anyone; LIVE is optional and gated.
4) **Proof artifacts:** every run outputs `reports/run_*.json` + `manifest.json` binding commit → run → tx hashes.
5) **Hackathon-safe:** no token launches, fundraising, liquidity opening, or airdrop mechanics.

## Onchain Proof (baseline, BSC mainnet)
- Approve tx: https://bscscan.com/tx/0x10641f82e759d6a618a34d0b54a0dd6efc75657d43e0ef5148ba5825449f951c
- Swap tx: https://bscscan.com/tx/0x31743560c941d7becb05b221c442c06da68bedf486704f12141806b6e7c57d86

## Quick Start
1) Copy env template:
```bash
cp .env.example .env
# fill RPC_URL + PRIVATE_KEY locally (never commit)
```

2) Install deps:
```bash
npm i
```

## Demo: Rebalance (WBNB/USDT)
### DRY (no tx)
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance npm run rebalance:dry
```

### LIVE (onchain, requires explicit confirm)
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=rebalance npm run rebalance:live
```

## Baseline (approve + swap proof runner)
### DRY
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=baseline npm run baseline:dry
```

### LIVE
```bash
SDNA_ID=AOI-2026-0214-BNB-DEX-01 MODE=baseline npm run baseline:live
```

## Build / Proof Log
- `AUTONOMOUS_LOG.md`
- `SECURITY_ETHICS.md`

---

## AOI Guard Cheat Sheet (When commits are blocked)
This repo uses **AOI Guard** (default-deny). If a commit/push is blocked:

1) See what you staged:
```bash
git status
```

2) If you added a new file/folder intentionally, allow it:
```bash
nano .aoi-allowlist
# then
git add .aoi-allowlist
```
