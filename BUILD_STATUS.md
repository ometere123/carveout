# Build status — CARVEOUT 0.3.0 candidate

- Base checkout: `main` at `5ccc4ee` before these changes; work preserves the stable Studionet toolchain and existing single-contract design.
- Candidate source: `contracts/carveout.py`, SHA-256 `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; source commit: PENDING source commit.
- Schema: `deployments/studionet.schema.json`, SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; public interface remains 21 methods.
- Evidence consensus: independently fetch each frozen source, extract/normalize provider-neutral stable source manifests, bind them with a consensus digest; persist the accepted leader's fetched-body digest separately. Bodies are processed up to 24,000 chars/source and 48,000 per decision; persisted per-source canonical manifest is bounded to 3,600 chars. The former 800-character excerpt is not an analysis cutoff.
- WAT timestamp formatting: unset zero/null/empty values render as unset; valid timestamps use `Africa/Lagos`, while protocol Unix timestamps remain unchanged.

## Local gates

- Direct Mode: **59/59 PASS** (`python run_direct_windows.py`).
- GenVM lint/validate: **PASS** using `GENVM_VERSION=v0.2.16`; unchanged stable `py-genlayer` dependency.
- Schema generation: **PASS**; hash matches manifest.
- Contract typecheck: **PASS**.
- Pattern/release/frontend-surface guards: **PASS**.
- Frontend tests: **41/41 PASS**; typecheck **PASS**; production build **PASS**.
- GitHub CI: PENDING push.
- New-address read-only integration: PENDING user-signed deployment.

## Deployment boundary

Current deployed address `0xA9C86FF6113187915C1Bd8e958fC718719337531` and production UI correspond to 0.2.0 and must not be treated as 0.3.0. Contract deployment, source/schema verification, and subsequent frontend deployment are pending. The user signs deployment and all application lifecycle transactions. The real 0.2.0 UNDETERMINED measurement remains preserved as failure evidence and must not be retried.
