# CARVEOUT review evidence

## Canonical release

- Required network: GenLayer Studionet, chain `61999`
- Required RPC: `https://studio.genlayer.com/api`
- Configured contract address: **not deployed yet**
- Deployment transaction / explorer: **not run**
- Source commit: **pending validated release commit**
- Hosted frontend: **not configured or published**

No deployment or live transaction claims are made. A direct read-only JSON-RPC preflight to the required URL returned HTTP 403 in this environment, so live RPC operation remains unverified here. The SDK package’s `studionet` definition and the selected CLI’s built-in Studionet configuration both resolve to chain `61999` and `https://studio.genlayer.com/api`. The opt-in smoke test correctly skipped because no canonical deployment address is configured.

## Local quality gates

- Compatible Python pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.1rc2`, `pytest==9.0.2`; `py -3.12 -m pip install -r requirements.txt`: PASS.
- `genvm-lint check contracts/carveout.py --json`: PASS, `ok=true`, 3 checks; linter emitted only informational `I200` that a newer runner exists.
- Direct Mode: `py -3.12 run_direct_windows.py`: **46 passed**. The helper works around a Windows temp-file locking issue in `genlayer-test 0.29.2`; the assertions are the repository’s full `tests/direct/` suite. Linux CI should run the workflow command `pytest tests/direct/ -v` directly.
- `scripts/check_release.py`: PASS, Studionet 61999 and required RPC only.
- `scripts/check_contract_patterns.py`: PASS.
- `npm run check:static`: PASS, Python compilation, all static release guards and deploy-helper TypeScript check.
- `scripts/check_frontend_surface.py`: PASS, six routes and required protocol actions including bilateral acceptance and proposal expiry.
- Frontend `npm install`: PASS, 0 reported vulnerabilities.
- Frontend `npm run typecheck`: PASS.
- Deploy helper `npm run check:deploy`: PASS; it locks both chain ID and RPC and waits for `FINALIZED` plus successful execution.
- Frontend `npm run build`: PASS; all six application routes generated.
- Stable SDK review: `genlayer-js@1.2.0` is a non-prerelease release and its `studionet` object binds chain `61999`; npm tags stable GenLayer CLI `0.39.2` as latest. No `genlayer-js@2.0.0-rc.1` migration remains in package manifests or lockfiles.
- `pytest tests/integration/ -v`: 1 skipped because there is no finalized canonical address; no real network read was reached.

## Live semantic/economic gates (not demonstrated)

- Deployed source/schema comparison and `get_stats()`: **not run**.
- Independent measurement consensus with stable public evidence: **not run**.
- Exception adjudication, full-case challenge or finalization on Studionet: **not run**.
- Customer/provider native GEN credits and withdrawal: **not run**.
- Meaningful live negative/fail-closed transaction path and final accounting: **not run**.

These entries require a reachable Studionet RPC, a deployment through the approved wallet flow, and a public hosting destination. They must be replaced only with actual finalized transaction hashes, receipts, states and explorer links.

## Reviewer thesis

CARVEOUT remains a provider-backed SLA exception protocol: public multi-origin measurement must first independently prove the miss; GenLayer then decides whether a clause frozen and customer-accepted before exposure excuses the verified miss. The model cannot choose GEN or partial percentages.
