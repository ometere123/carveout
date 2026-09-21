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
- Read-only Studionet smoke: **PASS against the prior 0.1.0 deployment only**. Candidate read-only integration awaits candidate deployment.
- Full GitHub CI: **PENDING candidate push**.
- Candidate source changes the contract. The old deployment (`0x75f2e473E6f010B510F1d281C8E4679fD2043054`) is not a valid target for candidate frontend configuration.
- Candidate Studionet deployment/source/schema readback: **PENDING the user's signing action**. Candidate frontend address wiring and Vercel production deployment follow only after that returned address is verified.
- Real browser-wallet lifecycle and meaningful fail-closed transaction: **PENDING USER**. No fabricated/live evidence is recorded.

See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for the ledger and [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md) for the manual-only runbook. All displayed UI timestamps use `Africa/Lagos`; protocol timestamps remain UTC Unix seconds.
