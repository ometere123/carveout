# CARVEOUT static and release verification

Static checks support, but do not replace, GenVM validation, Direct Mode, canonical RPC reads, deployment/source verification or browser evidence.

## Automated guards

- `scripts/check_release.py` scans authored contract/frontend/deploy/network configuration for forbidden chains and wallet flows, and pins Studionet chain `61999` and RPC `https://studio.genlayer.com/api`.
- `scripts/check_contract_patterns.py` enforces consensus closures and transaction clock boundaries.
- `scripts/check_frontend_surface.py` checks six routes, lifecycle action coverage, injected EIP-1193 write path, chain lock and transaction verification.
- `scripts/verify_release_manifest.py` verifies the candidate source/schema hashes and ensures the candidate is not marked deployed or assigned an address prematurely.
- `scripts/verify_accounting.py <stats.json>` verifies a saved canonical `get_stats()` response against the Studionet identity and `deposited == agreement escrow + challenge escrow + claimable + withdrawn`.
- `deploy/deployScript.ts` rejects other chains/RPCs, waits for finalized successful deployment, reads `get_stats()` and captures deployment source hash/address. A human must authorize/sign deployment.

## Current candidate run

- Contract pattern/release/frontend-surface guards: PASS.
- Manifest source/schema check: PASS.
- Direct Mode on Python 3.12: 52 passed with `run_direct_windows.py` (Windows temp-file lock workaround).
- Frontend: 38 tests passed, typecheck PASS, production build PASS.
- `genvm-lint check contracts/carveout.py --json`: static checks and validate PASS (21 methods, 6 views, 15 writes); `genvm-lint schema` PASS and output matches the recorded schema SHA-256; `genvm-lint typecheck` PASS with the local pyright wrapper on PATH.
- Opt-in read-only Studionet smoke test: PASS against verified candidate `0xA9C86FF6113187915C1Bd8e958fC718719337531`; it reports the expected version/network/RPC and balanced accounting.
- Full GitHub Actions suite: PASS, run `35561427861`, tested commit `344446ab0f1790af6700d972ad22d7892373c7ce`.

## Known evidence limit

GenVM's current text renderer does not expose a reliable redirect chain/final URL. The contract binds/checks submitted source URLs/origins and persists the actual bounded text excerpt it evaluated; reviewers must not infer final redirect provenance. A source whose service/window attribution or bounded representation is incomplete produces a non-decision.
