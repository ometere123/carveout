# CARVEOUT review evidence

## Canonical release

- Network: GenLayer Studionet, alias `studionet`, chain `61999`; RPC `https://studio.genlayer.com/api`.
- Canonical contract: [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054).
- Deployment transaction: [`0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf`](https://explorer-studio.genlayer.com/tx/0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf), FINALIZED / MAJORITY_AGREE / SUCCESS at 2026-09-20 10:19:20 UTC.
- Deployed source SHA-256: `144caccbd8b6daa8cbebc72ae9a4a5737c44147cbc100e8f7f1cb23cadf35f98`, matching `contracts/carveout.py` at source commit `8f1302f10e0fee65f79187241e7da853225240d4`.
- Constructor arguments: none. Deployer: local stable CLI account `party_b`, `0xA7EeAE0E93793e3146Cb14b0700251B8b0EBADFB`.
- Schema SHA-256: `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; deployed schema matched the local generated schema (21 methods: 6 views, 15 writes).
- Production frontend: [https://carveout-sla.vercel.app](https://carveout-sla.vercel.app), Vercel deployment `dpl_CTNSiqy8pNGLtH8E9xQhiqnF4zo2`, READY, Node 22, `npm ci`; verified public route responses for `/`, `/agreements`, `/open`, `/account`, `/protocol`, and `/agreements/1` all returned HTTP 200 and CARVEOUT branding. Downloaded client bundles include the canonical contract address, chain `61999`, and Studionet RPC.
- Initial `get_stats()`: version `0.1.0-studionet`; network `Studionet`; chain `61999`; agreements `0`; incidents `0`; finalized breaches `0`; proven exceptions `0`; total deposited, agreement escrow, challenge escrow, claimable, and withdrawn all `0`; `accountingBalanced=true`; `adminControls=false`.

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
- Stable release pins: local GenLayer CLI `0.39.1`; `genlayer-js@1.1.8`; Node 22 in CI and Vercel; Studionet alias `studionet`, chain `61999`, RPC `https://studio.genlayer.com/api`; the contract runtime is pinned in `contracts/carveout.py`. The global CLI was not changed.
- GitHub Actions for deployed source commit `8f1302f10e0fee65f79187241e7da853225240d4`: [run 35504469286](https://github.com/ometere123/carveout/actions/runs/35504469286), PASS for direct tests, GenVM checks and web build. Integration test was skipped because no lifecycle deployment address was configured at that commit. CI for later evidence/Node changes must be checked separately.
- The read-only integration test now targets the public canonical address in CI and passed locally against Studionet: `get_stats()` returned the expected 61999 network identity, balanced accounting and disabled admin controls. It uses an ephemeral in-memory reader address only; it does not sign or submit a transaction.
- `pytest tests/integration/ -v` without `CARVEOUT_CONTRACT`: intentionally skips. With the canonical address set, 1 live Studionet read test passed on 2026-09-20.

## Live semantic/economic gates (not demonstrated)

- Deployed source/schema comparison and `get_stats()`: **PASS**; exact source and schema hashes are recorded above and `get_stats()` returned zero activity with balanced accounting and no admin controls.
- Independent measurement consensus with stable public evidence: **not run**.
- Exception adjudication, full-case challenge or finalization on Studionet: **not run**.
- Customer/provider native GEN credits and withdrawal: **not run**.
- Meaningful live negative/fail-closed transaction path and final accounting: **not run**.

These lifecycle entries require a genuine provider/customer agreement, real public evidence, and finalized transactions. Record only observed receipts, states and explorer links; do not treat deployment or an empty initial `get_stats()` response as lifecycle proof.

## Reviewer thesis

CARVEOUT remains a provider-backed SLA exception protocol: public multi-origin measurement must first independently prove the miss; GenLayer then decides whether a clause frozen and customer-accepted before exposure excuses the verified miss. The model cannot choose GEN or partial percentages.
