# CARVEOUT release handoff

## Current candidate

This branch began at the latest `origin/main` commit `a5e73d2d1e7f82c529ca2d1f5acf7fa91893b723`. It preserves the existing agreement contract and browser adapter, adds bounded durable evidence representations/digests and WAT-only display formatting, and is intended to remain on stable Studionet 61999 (`https://studio.genlayer.com/api`) with `genlayer-js@1.1.8` and the current stable contract runtime.

Local Direct Mode is 52/52 on Python 3.12.10 using `run_direct_windows.py`. Frontend tests (38), TypeScript typecheck and production build pass. Static release guards and GenVM lint/validate/schema/typecheck pass. GitHub CI run `35563691627` is green on release commit `7efce487c84b75d3b757036e2e8c3cd94dd98bcb`. Read-only candidate integration passes.

The candidate contract source is commit `afb6a28de0a9f22aa8ac73fe72073a66822f5e13`, SHA-256 `d8a0c3eb5ae2f7f164bb5526c42ec24557dbfa06f8a2cf540e30215210978a99`; the schema SHA-256 is `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.

## Deployment and release state

The user deployed candidate `0.2.0-studionet` at `0xA9C86FF6113187915C1Bd8e958fC718719337531` in transaction `0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726`. The transaction is FINALIZED / MAJORITY_AGREE with GenVM SUCCESS and five agreeing validators. Read-only `gen_getContractCode` returned source whose SHA-256 exactly matches the candidate; the live schema matches the local 21-method schema. Candidate `get_stats()` reports version `0.2.0-studionet`, Studionet 61999, zero totals and `accounting_balanced=true`; the opt-in integration test passes against this address. The previous instance `0x75f2e473E6f010B510F1d281C8E4679fD2043054` is historical only.

The candidate frontend is deployed to production as Vercel `dpl_7LsZDctCsRoxfLPj99kaJaKtLsDz` from source commit `7efce487c84b75d3b757036e2e8c3cd94dd98bcb`. It is READY and aliased to `https://carve-out.vercel.app`; canonical URL returned HTTP 200 and the served client bundle contains the candidate address, chain ID 61999 and canonical RPC. Do not redeploy the contract. Stop before any browser application transaction; the user performs all lifecycle writes.

## User-run application lifecycle

The user personally signs provider proposal/funding, customer acceptance, incident and evidence writes, exception adjudication, challenges or challenge-window completion, finalization and withdrawal. No agent may submit those writes or use any alternate/private-key signer. Use the precise manual sequence in [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md). Real transaction hashes, public evidence results and balance reads remain blank until returned by the user.

## Current artifacts

- `deployments/studionet.json` keeps the previous deployment as historical baseline and records the verified candidate separately.
- `docs/REVIEW_EVIDENCE.md` contains explicitly pending live-evidence rows.
- `scripts/verify_release_manifest.py` checks source/schema hashes, the candidate deployment address and the recorded on-chain source/schema verification.
- `scripts/verify_accounting.py` checks a saved `get_stats()` response.
- All user-facing timestamps display `Africa/Lagos`; contract, Unix and evidence timestamps remain unchanged.
