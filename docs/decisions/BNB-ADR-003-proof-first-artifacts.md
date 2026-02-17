# BNB-ADR-003 — Proof-first Artifacts Standard

- **Status:** Accepted
- **Date:** 2026-02-17 (KST)
- **Scope:** How we structure evidence for claims
- **Participants (role-based):** Governance, Security, Ops

## Context
Hackathon submissions benefit from **verifiable completion**: judges should be able to click links and confirm.

## Options Considered
1) Narrative-only README (claims without strong evidence)
2) Proof-first: README + artifacts/manifest + stable links

## Decision
Adopt **Option 2**: a proof-first standard.

## Reasons (judge-friendly)
- **Trust:** reduces ambiguity; evidence is inspectable.
- **Speed:** judges can validate quickly.
- **Repeatability:** creates a reusable standard for future builds.

## What counts as proof
- Demo video link
- Repo commit history
- Manifest / artifact links referenced from README

## Risks & Mitigations
- Risk: broken links
  - Mitigation: link verification before final push; keep artifacts in repo or stable hosts.

## Proof / Artifacts
- Repo: https://github.com/edmonddantesj/bnb-goodvibes-dex-agent
- Demo: https://youtu.be/Qljm0_aKX70

## Sensitive info policy
No secrets, no business plans, no internal strategy details.
