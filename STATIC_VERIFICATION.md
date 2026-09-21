# CARVEOUT static and release verification

Static checks support but do not replace GenVM validation, Direct Mode, deployed source/schema reads, or user-operated browser evidence.

## Current 0.3.0 release

- Network/toolchain unchanged: Studionet chain `61999`, RPC `https://studio.genlayer.com/api`, CLI `0.39.1`, `genlayer-js 1.1.8`, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, `genvm-linter 0.11.0`, Python 3.12, stable `py-genlayer` hash.
- Direct Mode: 59 passed.
- GenVM lint and semantic validation: PASS (`GENVM_VERSION=v0.2.16`).
- Schema generation: PASS; 21 methods (6 views, 15 writes); recorded schema hash matches.
- Contract typecheck: PASS.
- Contract pattern, release, frontend surface, deploy TypeScript and Python compilation checks: PASS.
- Frontend tests: 41 passed; TypeScript typecheck and optimized production build: PASS.
- GitHub CI: PASS, [run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282), exact source commit `b70d49659b569ec7941a7607735ca5f096d10ebc`.
- Read-only integration against canonical 0.3.0: PASS; `get_stats()` reports Studionet 61999, version 0.3.0, and balanced initial accounting.

## Evidence model and known limit

Validators independently fetch and extract stable structured fields; consensus commits to normalized consequential manifest fields, not raw body hashes, timestamps, page chrome or free-form reasoning. A separate leader observation digest supports audit. Every measurement source, including the independent probe and corroborating family, must be attributable and materially support the completed interval. Processing is bounded at 24,000 characters/source; persistence is separately bounded at 3,600 characters/source. The stable GenVM web API does not expose reliable redirect-chain/final-URL provenance, so the contract binds submitted URL/origin and content attribution but does not claim final URL verification.

## Deployment

Release 0.3.0 is deployed at [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), tx [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323). Deployed source/schema readback passed. The production frontend was deployed and its compiled address was verified; fresh user-signed lifecycle remains pending.
