# BNB-ADR-001 — Demo Video Pipeline (60s, narration-only)

- **Status:** Accepted
- **Date:** 2026-02-17 (KST)
- **Scope:** BNB Good Vibes Only hackathon submission demo
- **Participants (role-based):** Governance, Security, Ops, Builder

## Context
We needed a **reproducible 60-second demo video** suitable for hackathon judging, with minimal risk of last-minute recording failures.

## Options Considered
1) **Direct screen recording with live system audio** (single-take capture)
2) **Screen recording without system audio + post-produced TTS narration** (mux in post)
3) **Re-record until perfect** (manual iteration)

## Decision
Choose **Option 2**:
- Record the terminal/demo visuals reliably.
- Add **TTS narration only** in post-production (mux).

## Reasons (judge-friendly)
- **Reproducibility:** deterministic pipeline reduces “works on my machine” capture issues.
- **Clarity:** narration can be scripted to hit key points in 60 seconds.
- **Failure isolation:** audio and video problems are separated; easier recovery.

## Risks & Mitigations
- Risk: narration might drift from on-screen steps
  - Mitigation: script aligned to the exact demo flow + timeboxed to 60s.
- Risk: encoding/mux issues near deadline
  - Mitigation: keep a minimal ffmpeg mux step and verify output length.

## Proof / Artifacts
- Demo video: https://youtu.be/Qljm0_aKX70
- Local final MP4 (internal): `bnb-goodvibes-demo-final-60s.mp4`
- Repo: https://github.com/edmonddantesj/bnb-goodvibes-dex-agent

## Sensitive info policy
This ADR intentionally omits business plans, internal strategy, secrets, wallets, and private operational details.
