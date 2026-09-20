# Verification status

## Passed in this checkout (2026-09-20)

- Stable pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, `pyright==1.1.414`, `pytest==9.0.2`; Python 3.12.
- Stable GenVM lint, validate, schema, and typecheck: PASS against runner `v0.2.16` matching the contract dependency.
- Complete Direct Mode suite: PASS, 46 tests using `py -3.12 run_direct_windows.py`. Python 3.14 without that workaround fails before contract execution due to a Windows temporary-file lock; the project-pinned Python 3.12 path passes.
- Python compile, static release guards, and deployment-helper TypeScript check: PASS.
- Stable frontend/client pins: `genlayer-js==1.1.8`, Node 22 in CI and Vercel, local CLI `0.39.1`; the global CLI was not changed.
- Root/frontend `npm ci`, frontend tests (6 passed), typecheck and production build: PASS for the current UI changes.
- Release/static gates and local HTTP checks for all six routes: PASS. Screenshot-based viewport verification is unavailable because the Windows computer-use helper exits with an ACL error.

## Not verified

The canonical Studionet deployment and public frontend are recorded in `deployments/studionet.json` and `docs/REVIEW_EVIDENCE.md`; direct stable-CLI reads confirm source/schema and balanced zero accounting. The latest prior GitHub Actions run passed before these UI-only edits; CI for the current revision is pending. The full live SLA lifecycle and native GEN movement remain unproven. The current UI revision also still needs its production redeploy and browser viewport screenshot checks.
