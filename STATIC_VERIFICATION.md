# CARVEOUT static and release verification

Static checks support but do not replace GenVM validation, Direct Mode, deployed source/schema reads, or user-operated browser evidence.

## Current 0.3.0 candidate

- Network/toolchain unchanged: Studionet chain `61999`, RPC `https://studio.genlayer.com/api`, CLI `0.39.1`, `genlayer-js 1.1.8`, `genlayer-test 0.29.2`, `genlayer-py 0.16.3`, `genvm-linter 0.11.0`, Python 3.12, stable `py-genlayer` hash.
- Direct Mode: 59 passed.
- GenVM lint and semantic validation: PASS (`GENVM_VERSION=v0.2.16`).
- Schema generation: PASS; 21 methods (6 views, 15 writes); recorded schema hash matches.
- Contract typecheck: PASS.
- Contract pattern, release, frontend surface, deploy TypeScript and Python compilation checks: PASS.
- Frontend tests: 41 passed; TypeScript typecheck and optimized production build: PASS.
- GitHub CI: pending exact release push.
- Read-only integration: pending user-signed 0.3 deployment; CI integration test is intentionally not pointed at an older deployment.

## Evidence model and known limit

Validators independently fetch and extract stable structured fields; consensus commits to normalized consequential manifest fields, not raw body hashes, timestamps, page chrome or free-form reasoning. A separate leader observation digest supports audit. Every measurement source, including the independent probe and corroborating family, must be attributable and materially support the completed interval. Processing is bounded at 24,000 characters/source; persistence is separately bounded at 3,600 characters/source. The stable GenVM web API does not expose reliable redirect-chain/final-URL provenance, so the contract binds submitted URL/origin and content attribution but does not claim final URL verification.

## Deployment

Release 0.3.0 changes contract consensus behavior and therefore requires a new contract deployment. Existing production deployment and frontend target 0.2.0 and must not be used as proof of the new behavior. Deployment source/schema readback, frontend production switch and a fresh user-signed lifecycle remain pending.
