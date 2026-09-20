# CARVEOUT static verification

The CI static guards are executable checks, not deployment evidence:

- `scripts/check_release.py` scans authored contract/frontend/deploy/config files for forbidden networks and wallet paths, and pins Studionet chain `61999` and `https://studio.genlayer.com/api`. It excludes installed `node_modules` and generated `.next` output.
- `scripts/check_contract_patterns.py` requires consensus calls to stay inside their intended closures and keeps the GenVM transaction clock isolated in `_now()`.
- `scripts/check_frontend_surface.py` checks all required routes, lifecycle actions, injected EIP-1193 methods, finality/success handling, and network locks. It scans authored TypeScript only.

These checks do not prove live RPC availability, deployed source, semantic consensus, native GEN transfers, public hosting or CI service status. See `docs/REVIEW_EVIDENCE.md` for commands actually run and remaining release blockers.
