# Verification status

## Passed in this checkout (2026-09-20)

- Stable pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, `pyright==1.1.414`, `pytest==9.0.2`; Python 3.12.
- Stable GenVM lint, validate, schema, and typecheck: PASS against runner `v0.2.16` matching the contract dependency.
- Complete Direct Mode suite: PASS, 46 tests using `py -3.12 run_direct_windows.py`. Python 3.14 without that workaround fails before contract execution due to a Windows temporary-file lock; the project-pinned Python 3.12 path passes.
- Python compile, static release guards, and deployment-helper TypeScript check: PASS.
- Stable frontend/client pins: `genlayer-js==1.1.8`, Node 22 in CI and Vercel, local CLI `0.39.1`; the global CLI was not changed.
- Root/frontend `npm ci`, frontend tests (6 passed), typecheck and production build: PASS for the current UI changes.
- Release/static gates and local HTTP checks for all six routes: PASS. At 100% browser zoom, screenshots were visually reviewed for the home page and agreement form at 1366×768; desktop widths 1366/1440/1536/1600/1920, tablet 820 and mobile 390 showed no horizontal overflow. Automated WCAG 2.1 AA scans reported zero violations on all six routes.

## Not verified

The canonical Studionet contract and public frontend are recorded in `deployments/studionet.json` and `docs/REVIEW_EVIDENCE.md`; stable-CLI reads confirm the deployed schema/source and balanced zero accounting. GitHub Actions run [35519567715](https://github.com/ometere123/carveout/actions/runs/35519567715) passed for main commit `351d283`. Production deployment `dpl_DvNdou86SF8oGDqF3Ya1kidSVEco` is READY at `https://carve-out.vercel.app`; all six routes return HTTP 200, the favicon route returns the CARVEOUT icon, and the public client bundle contains the canonical address, chain `61999`, and Studionet RPC. Desktop/mobile screenshots, overflow checks, and six-route WCAG scans passed locally. The full live SLA lifecycle/native GEN movement remains unverified.
