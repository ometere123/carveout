# Verification status — CARVEOUT 0.4.0 release

## Current release 0.4.0 — 2026-09-21

Release 0.4.0 is deployed at [`0x08Dc200120385474c40F1a48A640d987A94aB1BB`](https://explorer-studio.genlayer.com/address/0x08Dc200120385474c40F1a48A640d987A94aB1BB), deployment transaction [`0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd`](https://explorer-studio.genlayer.com/tx/0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd), FINALIZED / SUCCESS / MAJORITY_AGREE. Source SHA-256 `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`; generated schema file `deployments/studionet-0.4.0.schema.json` SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; deployed and local canonical schema SHA-256 `4801e0ceeb22866c94f40cac36e48ee3b0606d1500272927e92ede67d9991a70`, exact readback verified. Direct Mode 60/60, GenVM lint/validate/schema/typecheck, static guards, frontend tests 42/42, frontend typecheck and production build pass locally. Read-only integration was skipped by its environment gate. Source CI [run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013) passed for `ba037c4148f8f79b45b781fe3200def9a817fb54`; latest green main CI is [run 35606688234](https://github.com/ometere123/carveout/actions/runs/35606688234) at `f87f7465506f1c3f017f0d3a04a791c5d5cc8ad2`. Production frontend is deployed as [`dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2), READY; `/open` returns HTTP 200 and bundle includes canonical 0.4.0 address only. Start any future live lifecycle from a fresh agreement on this release.

## Completed locally

- Direct Mode: **59 passed** via `python run_direct_windows.py`.
- `genvm-lint check contracts/carveout.py --json`: **PASS** (3 lint checks; semantic validation passes; 21 methods, 6 views, 15 writes).
- Schema generation: **PASS**, generated SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.
- `genvm-lint typecheck contracts/carveout.py`: **PASS**.
- Contract pattern guard, release guard, frontend surface check, Python compilation and deploy-script typecheck: **PASS**.
- Frontend tests: **41 passed**, TypeScript typecheck **PASS**, Next.js production build **PASS**.
- WAT tests confirm valid Unix/UTC inputs render in `Africa/Lagos`; zero, `"0"`, null, undefined and empty values render as unset; original input values remain unchanged.

Use `GENVM_VERSION=v0.2.16` with local genvm-lint commands. This avoids selecting a different pre-cached RC bundle on this machine. The contract header still uses the pre-existing stable `py-genlayer` hash; no runner or toolchain migration occurred.

## Current release and live status

- Contract-source CI: **PASS**, [run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013), source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`. Latest green main CI: [run 35606688234](https://github.com/ometere123/carveout/actions/runs/35606688234), commit `f87f7465506f1c3f017f0d3a04a791c5d5cc8ad2`.
- New deployment finalized successfully at [`0x08Dc200120385474c40F1a48A640d987A94aB1BB`](https://explorer-studio.genlayer.com/address/0x08Dc200120385474c40F1a48A640d987A94aB1BB), tx [`0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd`](https://explorer-studio.genlayer.com/tx/0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd); execution SUCCESS, consensus MAJORITY_AGREE. Read-only RPC confirms deployed source byte-for-byte and canonical schema equality.
- `get_stats()` returns version 0.4.0, Studionet 61999, `accounting_balanced=true`, and all counts/balances zero. Initial accounting proof: `0 deposited = 0 agreement escrow + 0 challenge escrow + 0 claimable + 0 withdrawn`.
- Production frontend [`dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2) is READY at `https://carve-out.vercel.app`; `/open` returns HTTP 200 and its compiled JavaScript references the canonical 0.4.0 address and not the superseded 0.3.0 address.
- Fresh user-operated browser lifecycle and fail-closed evidence remain pending wallet actions. No application transaction was signed or submitted for this release.

The prior 0.3.0-era main CI run was [35584496491](https://github.com/ometere123/carveout/actions/runs/35584496491), commit `1048b7def2c71233695713c2633ab2e59215cd55`; it is superseded by the current CI noted above.

The 0.2.0 deployment at `0xA9C86FF6113187915C1Bd8e958fC718719337531` remains deployed but does not contain this consensus fix. Its measurement transaction `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` is finalized UNDETERMINED after validator rotations and its incident remains MEASUREMENT_PENDING. Preserve it; do not retry it or continue its economic lifecycle.
