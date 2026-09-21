# Verification status — CARVEOUT 0.3.0 candidate

## Completed locally

- Direct Mode: **59 passed** via `python run_direct_windows.py`.
- `genvm-lint check contracts/carveout.py --json`: **PASS** (3 lint checks; semantic validation passes; 21 methods, 6 views, 15 writes).
- Schema generation: **PASS**, generated SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.
- `genvm-lint typecheck contracts/carveout.py`: **PASS**.
- Contract pattern guard, release guard, frontend surface check, Python compilation and deploy-script typecheck: **PASS**.
- Frontend tests: **41 passed**, TypeScript typecheck **PASS**, Next.js production build **PASS**.
- WAT tests confirm valid Unix/UTC inputs render in `Africa/Lagos`; zero, `"0"`, null, undefined and empty values render as unset; original input values remain unchanged.

Use `GENVM_VERSION=v0.2.16` with local genvm-lint commands. This avoids selecting a different pre-cached RC bundle on this machine. The contract header still uses the pre-existing stable `py-genlayer` hash; no runner or toolchain migration occurred.

## Pending release actions

- GitHub push and green CI for the exact release commit.
- User-signed deployment of this source to Studionet 61999.
- Read-only deployed source and schema verification plus `get_stats()` against the new address.
- Production frontend configuration/deployment after the new contract is verified.
- Fresh user-operated browser lifecycle and fail-closed evidence.

The 0.2.0 deployment at `0xA9C86FF6113187915C1Bd8e958fC718719337531` remains deployed but does not contain this consensus fix. Its measurement transaction `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` is finalized UNDETERMINED after validator rotations and its incident remains MEASUREMENT_PENDING. Preserve it; do not retry it or continue its economic lifecycle.
