<!-- 🧬 S-DNA: AOI-2026-0214-BNB-DEX-01 -->

# Security & Ethics (Hackathon Stance)

This project is an **on-chain research & proof-first execution demo**.

## What we do
- Produce **reproducible run artifacts** (S‑DNA report + manifest)
- Provide conservative execution defaults and explicit user confirmation gating

## What we do NOT do
- No default unattended auto-trading
- No MEV/sandwich/front-run functionality or marketing
- No deanonymization of wallets / no identity linkage
- No “guaranteed profit” claims

## Mandatory risk gates
- LIVE requires `CONFIRM_LIVE=YES`
- Slippage cap via `MAX_SLIPPAGE_BPS` (default 50 bps)
- Allowlist tokens (default USDT/WBNB)
- Approval minimization (approve only required amount)

## Key safety practices
- Secrets never committed (`.env` gitignored)
- Tx preview (quote + minOut) recorded to report JSON
- Public proof via explorer links

_Not financial advice._
