# Verification status — CARVEOUT 0.3.0 release

## Current candidate 0.4.0 — 2026-09-21

The active 0.3.0 measurement attempt for `cv-i-2`, tx `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba`, ended `UNDETERMINED`; canonical status remains `MEASUREMENT_PENDING`. Do not retry. Candidate 0.4.0 changes provider-neutral event interval normalization only; source SHA-256 `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`, schema file `deployments/studionet-0.4.0.schema.json`. Direct Mode 60/60, GenVM lint/validate/schema/typecheck, static guards, frontend tests 42/42, frontend typecheck and production build pass locally. Read-only integration skipped by its environment gate; GitHub CI pending. Candidate is not deployed; a fresh agreement on its verified deployment is required before restarting live lifecycle.

## Completed locally

- Direct Mode: **59 passed** via `python run_direct_windows.py`.
- `genvm-lint check contracts/carveout.py --json`: **PASS** (3 lint checks; semantic validation passes; 21 methods, 6 views, 15 writes).
- Schema generation: **PASS**, generated SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.
- `genvm-lint typecheck contracts/carveout.py`: **PASS**.
- Contract pattern guard, release guard, frontend surface check, Python compilation and deploy-script typecheck: **PASS**.
- Frontend tests: **41 passed**, TypeScript typecheck **PASS**, Next.js production build **PASS**.
- WAT tests confirm valid Unix/UTC inputs render in `Africa/Lagos`; zero, `"0"`, null, undefined and empty values render as unset; original input values remain unchanged.

Use `GENVM_VERSION=v0.2.16` with local genvm-lint commands. This avoids selecting a different pre-cached RC bundle on this machine. The contract header still uses the pre-existing stable `py-genlayer` hash; no runner or toolchain migration occurred.

## Release and live status

- GitHub source commit `b70d49659b569ec7941a7607735ca5f096d10ebc`: **PASS**, [CI run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282).
- Deployment finalized successfully at [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), tx [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323); execution SUCCESS, consensus MAJORITY_AGREE.
- Read-only deployed source matches local release SHA-256 byte-for-byte; deployed schema matches the local canonicalized schema. `get_stats()` confirms version 0.3.0, Studionet 61999, and `accounting_balanced=true` (initial accounting values all zero).
- Production frontend [`dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk) is READY at `https://carve-out.vercel.app`; `/open` returns HTTP 200 and its compiled JavaScript includes the canonical 0.3.0 address, not the old 0.2.0 address.
- Fresh user-operated browser lifecycle and fail-closed evidence remain pending user wallet actions.

Latest green `main` CI is [run 35584496491](https://github.com/ometere123/carveout/actions/runs/35584496491) for commit `1048b7def2c71233695713c2633ab2e59215cd55`.

The 0.2.0 deployment at `0xA9C86FF6113187915C1Bd8e958fC718719337531` remains deployed but does not contain this consensus fix. Its measurement transaction `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` is finalized UNDETERMINED after validator rotations and its incident remains MEASUREMENT_PENDING. Preserve it; do not retry it or continue its economic lifecycle.
