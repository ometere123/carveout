# Build status — CARVEOUT 0.4.0 release

## Current release — 0.4.0 (2026-09-21)

The 0.3.0 live measurement on `cv-i-2` finalized `UNDETERMINED` in transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba`; canonical incident state remains `MEASUREMENT_PENDING`. It is preserved and must not be retried. Contract candidate 0.4.0 normalizes event intervals against the frozen window and has no public ABI change. Source SHA-256: `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`; generated schema: `deployments/studionet-0.4.0.schema.json`, file SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.

Local result: Direct Mode 60/60; GenVM lint/validate/schema/typecheck PASS; guards PASS; frontend tests 42/42; frontend typecheck/build PASS. Read-only integration was skipped by its environment gate. Contract source commit `ba037c4148f8f79b45b781fe3200def9a817fb54` passed [CI run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013). Latest green release wiring commit is `96f1d1bb67707a7f3c61ef7bf20077f65906498d`, [CI run 35608857030](https://github.com/ometere123/carveout/actions/runs/35608857030).

- Base checkout: `main` at `5ccc4ee` before these changes; work preserves the stable Studionet toolchain and existing single-contract design.
- Release source: `contracts/carveout.py`, SHA-256 `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`; source commit: `ba037c4148f8f79b45b781fe3200def9a817fb54`.
- Schema: `deployments/studionet-0.4.0.schema.json`, file SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; public interface remains 21 methods.
- Evidence consensus: independently fetch each frozen source, extract/normalize provider-neutral stable source manifests, bind them with a consensus digest; persist the accepted leader's fetched-body digest separately. Bodies are processed up to 24,000 chars/source and 48,000 per decision; persisted per-source canonical manifest is bounded to 3,600 chars. The former 800-character excerpt is not an analysis cutoff.
- WAT timestamp formatting: unset zero/null/empty values render as unset; valid timestamps use `Africa/Lagos`, while protocol Unix timestamps remain unchanged.

## Local gates

- Direct Mode: **60/60 PASS** (`python run_direct_windows.py`).
- GenVM lint/validate: **PASS** using `GENVM_VERSION=v0.2.16`; unchanged stable `py-genlayer` dependency.
- Schema generation: **PASS**; hash matches manifest.
- Contract typecheck: **PASS**.
- Pattern/release/frontend-surface guards: **PASS**.
- Frontend tests: **42/42 PASS**; typecheck **PASS**; production build **PASS**.
- GitHub CI on release source: **PASS**, [run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013), testing exact source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`.
- Read-only integration on 0.4.0: directly verified deployed source/schema and `get_stats()`; the automated integration suite was skipped by its environment gate.

## Deployment status

Canonical 0.4.0 deployment: [`0x08Dc200120385474c40F1a48A640d987A94aB1BB`](https://explorer-studio.genlayer.com/address/0x08Dc200120385474c40F1a48A640d987A94aB1BB), transaction [`0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd`](https://explorer-studio.genlayer.com/tx/0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd), FINALIZED / SUCCESS / MAJORITY_AGREE. Read-only RPC confirmed deployed source SHA-256 `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f` and canonical schema SHA-256 `4801e0ceeb22866c94f40cac36e48ee3b0606d1500272927e92ede67d9991a70` match local artifacts. `get_stats()` reports `version=0.4.0-studionet`, chain 61999, and `accounting_balanced=true`; initial accounting is `0 deposited = 0 agreement escrow + 0 challenge escrow + 0 claimable + 0 withdrawn`. Production deployment [`dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2`](https://vercel.com/delealufejoel-4184s-projects/carveout/2KJyYYm1gyqhUZ36ATT2N5Mrk7N2) is READY at `https://carve-out.vercel.app`; `/open` returns HTTP 200 and the compiled bundle includes 0.4.0's address and not 0.3.0's. New 0.4.0 lifecycle writes await user operation. The 0.3.0 UNDETERMINED result remains preserved historical failure evidence and must not be retried.

Latest green release wiring CI: [run 35608857030](https://github.com/ometere123/carveout/actions/runs/35608857030), commit `96f1d1bb67707a7f3c61ef7bf20077f65906498d`. Live 0.4.0 lifecycle remains pending user wallet actions.
