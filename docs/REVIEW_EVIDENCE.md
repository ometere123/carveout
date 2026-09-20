# CARVEOUT review evidence

## Canonical release

- Required network: GenLayer Studionet, chain `61999`
- Required RPC: `https://studio.genlayer.com/api`
- Configured contract address: **not deployed yet**
- Deployment transaction / explorer: **not run**
- Source commit: **pending validated release commit**
- Hosted frontend: **not configured or published**

No deployment or live transaction claims are made. A prior direct read-only JSON-RPC attempt returned HTTP 403, so live RPC reachability remains unverified. The local CLI network configuration reports alias `studionet`, chain `61999`, and RPC `https://studio.genlayer.com/api`; this confirms configuration, not RPC availability. The opt-in smoke test skipped because no canonical deployment address is configured.

## Local quality gates

- Compatible Python pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, `pyright==1.1.414`, `pytest==9.0.2`.
- `python -m py_compile contracts/carveout.py`: PASS.
- `genvm-lint check contracts/carveout.py --json`: PASS, `ok=true`, 3 checks.
- `genvm-lint validate contracts/carveout.py`: PASS; 21 methods (6 views, 15 writes), zero constructor arguments.
- `genvm-lint schema contracts/carveout.py`: PASS.
- `genvm-lint typecheck contracts/carveout.py`: PASS with `GENVM_VERSION=v0.2.16`, matching the contract stable runtime pin.
- Direct Mode: `py -3.12 run_direct_windows.py`: **46 passed**. The helper works around a Windows temp-file locking issue in `genlayer-test 0.29.2`; the assertions are the repository’s full `tests/direct/` suite. Linux CI should run the workflow command `pytest tests/direct/ -v` directly.
- `scripts/check_release.py`: PASS, Studionet 61999 and required RPC only.
- `scripts/check_contract_patterns.py`: PASS.
- `npm run check:static`: PASS, Python compilation, all static release guards and deploy-helper TypeScript check.
- `scripts/check_frontend_surface.py`: PASS, six routes and required protocol actions including bilateral acceptance and proposal expiry.
- Root and frontend `npm ci`: PASS. Direct frontend dependencies are exact-version pinned and lockfiles are committed.
- Frontend `npm test`: PASS, 4 tests; `npm run typecheck`: PASS; `npm run build`: PASS.
- Deploy helper `npm run check:deploy`: PASS; it locks both chain ID and RPC and waits for `FINALIZED` plus successful execution.
- Stable release pins: local GenLayer CLI `0.39.1`; `genlayer-js@1.1.8`; Node 20 in CI; Studionet alias `studionet`, chain `61999`, RPC `https://studio.genlayer.com/api`; the contract runtime is pinned in `contracts/carveout.py`. The global CLI was not changed.
- `pytest tests/integration/ -v`: 1 skipped because there is no finalized canonical address; no real network read was reached.
- GitHub Actions for this exact worktree commit: **pending**; local checks are not CI evidence.

## Live semantic/economic gates (not demonstrated)

- Deployed source/schema comparison and `get_stats()`: **not run**.
- Independent measurement consensus with stable public evidence: **not run**.
- Exception adjudication, full-case challenge or finalization on Studionet: **not run**.
- Customer/provider native GEN credits and withdrawal: **not run**.
- Meaningful live negative/fail-closed transaction path and final accounting: **not run**.

These entries require a reachable Studionet RPC, a deployment through the approved wallet flow, and a public hosting destination. They must be replaced only with actual finalized transaction hashes, receipts, states and explorer links.

## Reviewer thesis

CARVEOUT remains a provider-backed SLA exception protocol: public multi-origin measurement must first independently prove the miss; GenLayer then decides whether a clause frozen and customer-accepted before exposure excuses the verified miss. The model cannot choose GEN or partial percentages.
