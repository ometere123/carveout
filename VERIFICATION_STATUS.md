# Verification status

## Passed in this checkout (2026-09-20)

- Official compatible pins install: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.1rc2`, `pytest==9.0.2`.
- `genvm-lint check contracts/carveout.py --json`: PASS (3 checks; informational newer runner available notice).
- Complete Direct Mode suite: PASS, 46 tests. On Windows the installed test runner has a temporary-file lock incompatibility; `run_direct_windows.py` applies a process-local unlink retry shim and invokes the unchanged pytest suite.
- `npm run check:static` (Python compilation, release guards and deployment-helper TypeScript): PASS.
- Stable GenLayerJS `1.2.0` compatibility: PASS; package `studionet` chain definition is 61999. The latest stable CLI tag is 0.39.2; CLI built-in Studionet reports the required RPC. No 2.x RC was installed or committed.
- Frontend `npm install`: PASS; `npm run typecheck`: PASS; `npm run build`: PASS.

## Not verified

There is not yet a canonical deployment address/transaction or hosted frontend URL in this checkout. The opt-in Studionet smoke test skipped because no canonical address is configured. Therefore this verification does not claim deployed-source/schema comparison, real validator consensus, native GEN movement, public frontend hosting, live positive/negative economic demo, green CI, or repository cleanliness. The live release gates are explicitly marked not run in `docs/REVIEW_EVIDENCE.md`.
