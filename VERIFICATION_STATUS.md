# Verification status

## Passed in this checkout (2026-09-20)

- Stable pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, `pyright==1.1.414`, `pytest==9.0.2`; Python 3.12.
- Stable GenVM lint, validate, schema, and typecheck: PASS against runner `v0.2.16` matching the contract dependency.
- Complete Direct Mode suite: PASS, 46 tests. On Windows the installed test runner has a temporary-file lock incompatibility; `run_direct_windows.py` applies a process-local unlink retry shim and invokes the unchanged pytest suite.
- Python compile, static release guards, and deployment-helper TypeScript check: PASS.
- Stable frontend/client pins: `genlayer-js==1.1.8`, Node 20 in CI, local CLI `0.39.1`; the global CLI was not changed.
- Root/frontend `npm ci`, frontend tests (4 passed), typecheck and production build: PASS.

## Not verified

There is not yet a canonical deployment address/transaction or hosted frontend URL in this checkout. The opt-in Studionet smoke test skipped because no canonical address is configured. Therefore this verification does not claim deployed-source/schema comparison, real validator consensus, native GEN movement, public frontend hosting, live positive/negative economic demo, green CI, or repository cleanliness. The live release gates are explicitly marked not run in `docs/REVIEW_EVIDENCE.md`.
