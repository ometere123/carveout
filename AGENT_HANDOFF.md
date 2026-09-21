# CARVEOUT release handoff

## Current candidate

This branch began at the latest `origin/main` commit `a5e73d2d1e7f82c529ca2d1f5acf7fa91893b723`. It preserves the existing agreement contract and browser adapter, adds bounded durable evidence representations/digests and WAT-only display formatting, and is intended to remain on stable Studionet 61999 (`https://studio.genlayer.com/api`) with `genlayer-js@1.1.8` and the current stable contract runtime.

Local Direct Mode is 52/52 on Python 3.12.10 using `run_direct_windows.py`. Frontend tests (38), TypeScript typecheck and production build pass. Static release guards, GenVM lint/validate/schema/typecheck pass; the generated schema matches the recorded schema hash. The opt-in live smoke test passes against the historical baseline only, not the undeployed candidate. Candidate CI must pass before deployment.

## Human-controlled deployment boundary

The contract source changed. The old deployed instance at `0x75f2e473E6f010B510F1d281C8E4679fD2043054` is incompatible with the candidate frontend fields. Do not repoint the frontend to that address and do not deploy the frontend until a new contract address is finalized and its source/schema/read-only state are verified.

After the candidate source is pushed and CI is green, the user performs the deployment signing step:

1. From repository root, run `.\.genlayer-stable\node_modules\.bin\genlayer.cmd network set studionet`, then `network info`. Confirm alias `studionet`, chain `61999`, RPC `https://studio.genlayer.com/api`.
2. Confirm the active signer is the user's intended release wallet. The prior deployment was signed by `party_b` address `0xA7EeAE0E93793e3146Cb14b0700251B8b0EBADFB`; use it only if the user controls and intentionally selects that same account. No one should reveal or transmit a key.
3. Run `.\.genlayer-stable\node_modules\.bin\genlayer.cmd deploy --contract contracts/carveout.py`. This contract has no constructor arguments and requires `0 GEN` value on gasless Studionet. Confirm the displayed source is candidate SHA-256 from `deployments/studionet.json` and approve the deployment from the intended signer.
4. Return the finalized deployment transaction hash and new contract address. Also capture the finalized receipt/execution result. Do not run browser lifecycle writes at this deployment step.

Once the user returns that deployment evidence, verify the address on Studionet, compare deployed source and generated schema with the candidate, read `get_stats()` and accounting, update `deployments/studionet.json`, wire the frontend address, rerun CI, deploy the frontend, and stop before any browser application transaction.

## User-run application lifecycle

The user personally signs provider proposal/funding, customer acceptance, incident and evidence writes, exception adjudication, challenges or challenge-window completion, finalization and withdrawal. No agent may submit those writes or use any alternate/private-key signer. Use the precise manual sequence in [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md). Real transaction hashes, public evidence results and balance reads remain blank until returned by the user.

## Current artifacts

- `deployments/studionet.json` keeps the previous deployed baseline separate from the undeployed candidate.
- `docs/REVIEW_EVIDENCE.md` contains explicitly pending live-evidence rows.
- `scripts/verify_release_manifest.py` checks source/schema hashes and prevents premature candidate address wiring.
- `scripts/verify_accounting.py` checks a saved `get_stats()` response.
- All user-facing timestamps display `Africa/Lagos`; contract, Unix and evidence timestamps remain unchanged.
