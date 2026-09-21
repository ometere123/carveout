# Verification status

## Candidate local results (2026-09-21)

- Starting point: current `origin/main` `a5e73d2d1e7f82c529ca2d1f5acf7fa91893b723`; no existing work was overwritten.
- Direct Mode: **52 passed** with Python 3.12 via `run_direct_windows.py`, the repository helper for the `genlayer-test 0.29.2` Windows temp-file lock.
- Frontend tests: **38 passed**; TypeScript typecheck: **PASS**; Next.js production build: **PASS**.
- `scripts/check_contract_patterns.py`, `scripts/check_release.py`, `scripts/check_frontend_surface.py`, candidate manifest hash verifier: **PASS**.
- WAT tests confirm `2026-09-21T03:45:50Z` displays as `21 Sep 2026, 04:45:50 WAT`, and the Unix seconds/UTC input remain unchanged.
- No wallet connection, contract transaction, alternative signer or other application write was used.

## Gates awaiting candidate CI or user action

- GenVM lint and validate: **PASS** (21 methods; 6 views, 15 writes). Schema generation: **PASS**, SHA-256 matches the recorded schema. `genvm-lint typecheck`: **PASS** using the local venv pyright wrapper.
- Candidate deployment: **PASS** at `0xA9C86FF6113187915C1Bd8e958fC718719337531`, tx `0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726`; FINALIZED / SUCCESS; deployed source SHA-256 and schema match local artifacts.
- Candidate read-only integration: **PASS**; `get_stats()` confirms chain/RPC/version, no initial accounting activity and `accounting_balanced=true`.
- Full GitHub CI: **PASS**, [run `35563691627`](https://github.com/ometere123/carveout/actions/runs/35563691627), testing candidate main commit `7efce487c84b75d3b757036e2e8c3cd94dd98bcb`.
- The old deployment (`0x75f2e473E6f010B510F1d281C8E4679fD2043054`) remains historical and is not a valid target for candidate frontend configuration.
- Candidate frontend is deployed as Vercel `dpl_7LsZDctCsRoxfLPj99kaJaKtLsDz` (READY); `https://carve-out.vercel.app` returns HTTP 200 and the served client bundle contains the candidate contract address, chain ID 61999 and canonical RPC.
- Real browser-wallet lifecycle and meaningful fail-closed transaction: **PENDING USER**. No fabricated/live evidence is recorded.

See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for the ledger and [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md) for the manual-only runbook. All displayed UI timestamps use `Africa/Lagos`; protocol timestamps remain UTC Unix seconds.
