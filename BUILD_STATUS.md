# Build status — CARVEOUT 0.3.0 release

## Active work — 0.4.0 candidate (2026-09-21)

The 0.3.0 live measurement on `cv-i-2` finalized `UNDETERMINED` in transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba`; canonical incident state remains `MEASUREMENT_PENDING`. It is preserved and must not be retried. Contract candidate 0.4.0 normalizes event intervals against the frozen window and has no public ABI change. Source SHA-256: `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`; generated schema: `deployments/studionet-0.4.0.schema.json`, file SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.

Current local result: Direct Mode 60/60; GenVM lint/validate/schema/typecheck PASS; guards PASS; frontend tests 42/42; frontend typecheck/build PASS. Read-only integration was skipped by its environment gate. GitHub CI passed: [run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013), exact candidate source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`. 0.3.0 remains deployed canonical while 0.4.0 awaits green CI and user-approved deployment.

- Base checkout: `main` at `5ccc4ee` before these changes; work preserves the stable Studionet toolchain and existing single-contract design.
- Candidate source: `contracts/carveout.py`, SHA-256 `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; source commit: `b70d49659b569ec7941a7607735ca5f096d10ebc`.
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
- GitHub CI: **PASS**, [run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282), testing the exact source commit.
- New-address read-only integration: PASS against 0.3.0; see `get_stats()` evidence in the deployment manifest.

## Deployment status

Canonical deployment: [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), transaction [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323), finalized with successful execution. Read-only RPC confirms deployed source SHA-256 exactly matches local `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; deployed schema matches the local canonicalized schema. `get_stats()` reports release 0.3.0, chain 61999, and `accounting_balanced=true` with zero initial balances. Production frontend deployment [`dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk) is READY; public `/open` returns HTTP 200 and the compiled client uses the canonical address. The user signs all application lifecycle transactions. The real 0.2.0 UNDETERMINED measurement remains preserved as historical failure evidence and must not be retried.

Latest green `main` CI: [run 35584496491](https://github.com/ometere123/carveout/actions/runs/35584496491), commit `1048b7def2c71233695713c2633ab2e59215cd55`. Live 0.3.0 lifecycle remains pending user wallet actions.
