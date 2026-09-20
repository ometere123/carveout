# CARVEOUT review evidence

This file is intentionally blank of invented deployment claims. Fill it only after the final source is linted, tested and deployed.

## Canonical release

- network: Studionet / `61999`
- RPC: `https://studio.genlayer.com/api`
- contract: **TBD**
- deployment tx: **TBD**
- source commit: **TBD**
- hosted frontend: **TBD**

## Quality gates

- `genvm-lint`: **TBD**
- Direct Mode: **TBD**
- integration / real consensus: **TBD**
- frontend typecheck: **TBD**
- production build: **TBD**
- deployed source/schema match: **TBD**
- full economic lifecycle: **TBD**

## Reviewer thesis

CARVEOUT is not a generic SLA court. The numerical SLA miss is already established before consensus starts. The only contested object is one exact exception clause frozen before the incident.

## Static package evidence

Before deployment, the packaged source passed Python compilation, the contract-pattern trust-boundary check, the forbidden-network/wallet release scan and a TypeScript/TSX parser pass. Contract surface: **19 public methods**. Authored Direct Mode tests: **21**. These are static package checks only; they do not replace the `TBD` live gates above. See `STATIC_VERIFICATION.md`.
