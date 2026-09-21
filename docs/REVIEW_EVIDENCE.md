# CARVEOUT reviewer evidence ledger

## Release identity

- Network: GenLayer Studionet `studionet`, chain `61999`; RPC `https://studio.genlayer.com/api`; explorer `https://explorer-studio.genlayer.com`.
- **Currently deployed:** release `0.2.0-studionet`, contract [`0xA9C86FF6113187915C1Bd8e958fC718719337531`](https://explorer-studio.genlayer.com/address/0xA9C86FF6113187915C1Bd8e958fC718719337531), deployment [`0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726`](https://explorer-studio.genlayer.com/tx/0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726). It does **not** include the 0.3.0 evidence-consensus changes.
- **Prepared candidate:** `0.3.0-studionet`; source `contracts/carveout.py`, SHA-256 `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; generated schema SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd` (same public ABI, 21 methods). Source commit [`b70d49659b569ec7941a7607735ca5f096d10ebc`](https://github.com/ometere123/carveout/commit/b70d49659b569ec7941a7607735ca5f096d10ebc) passed [GitHub CI run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282). Deployment is pending the user's signature. Do not use an old agreement as evidence for this release.
- Production `https://carve-out.vercel.app` still targets deployed 0.2.0. Do not point it at 0.3.0 until 0.3.0 is deployed and the deployed source/schema are verified.
- Historical 0.1 deployment [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054) is provenance only.

## Preserved live failure evidence (0.2.0)

The following real writes formed agreement `cv-a-1` and incident `cv-i-1` on the 0.2.0 address. They are evidence for the failure case only; do not retry the measurement transaction or continue this incident's economic lifecycle.

| Action | Transaction | Explorer | Observed state |
|---|---|---|---|
| Provider proposal and bond | `0x7676d22bbc7a411ded3565077208355a3b7c0fdd915e0560b811206d9c636b3c` | [transaction](https://explorer-studio.genlayer.com/tx/0x7676d22bbc7a411ded3565077208355a3b7c0fdd915e0560b811206d9c636b3c) | Finalized; created `cv-a-1` as PROPOSED |
| Named customer acceptance | `0x7e14534c17c68e43cd288931ec7a9084b370f3346d219a50f06c2a51f344294c` | [transaction](https://explorer-studio.genlayer.com/tx/0x7e14534c17c68e43cd288931ec7a9084b370f3346d219a50f06c2a51f344294c) | Finalized; agreement ACTIVE |
| Incident creation | `0x7185530b04ea679a54fadadfa256d72b8a7c58ca02553b2f1eeb4e766392e2d0` | [transaction](https://explorer-studio.genlayer.com/tx/0x7185530b04ea679a54fadadfa256d72b8a7c58ca02553b2f1eeb4e766392e2d0) | Finalized; created `cv-i-1`, MEASUREMENT_PENDING |
| Measurement attempt | `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` | [transaction](https://explorer-studio.genlayer.com/tx/0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645) | UNDETERMINED after validator rotations; leader output alone is not consensus. Canonical incident remains MEASUREMENT_PENDING. Not retried. |

This result motivated extracting and comparing stable structured source facts rather than raw fetched-page excerpts/hashes. It is not a successful measurement or economic settlement.

## 0.3.0 code-level release gates

| Gate | Result |
|---|---|
| Direct Mode | PASS — 59 tests, Python helper `python run_direct_windows.py` |
| GenVM lint + semantic validate | PASS — stable GenVM v0.2.16 artifact, pinned `py-genlayer` unchanged |
| Schema generation | PASS — 21 methods; generated hash above |
| Contract typecheck | PASS |
| Contract pattern / release / frontend surface | PASS locally |
| Frontend tests | PASS — 41 |
| Frontend TypeScript typecheck | PASS |
| Next.js production build | PASS |
| GitHub CI | PASS — [run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282) tested source commit `b70d49659b569ec7941a7607735ca5f096d10ebc` |
| Read-only integration against 0.3 deployment | Pending user deployment |
| 0.3 source/schema deployment verification | Pending user deployment |
| 0.3 production frontend deployment | Pending deployment verification |

The current machine needed `GENVM_VERSION=v0.2.16` explicitly because another cached RC bundle otherwise took precedence. No runner, runtime pin, network, SDK family, or contract dependency was changed.

## New-release deployment: user signature required

After reviewing the pushed source commit and green main CI, deploy `contracts/carveout.py` through GenLayer Studio on `studionet` / chain `61999`, canonical RPC `https://studio.genlayer.com/api`, no constructor arguments, value `0`. Expected deployer wallet: `0xA7EeAE0E93793e3146Cb14b0700251B8b0EBADFB`. Confirm the uploaded source hash is `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`. Return the finalized deployment transaction hash and new contract address. Do not submit lifecycle transactions to the old address.

## New-release lifecycle evidence slots

Only fill these with actual finalized public explorer evidence and canonical readbacks. Blank/pending entries are intentionally not claims.

| Action | Transaction / explorer | Readback / evidence |
|---|---|---|
| Provider proposal + bond | PENDING | PENDING |
| Customer acceptance | PENDING | PENDING |
| Incident creation | PENDING | PENDING |
| Measurement verification | PENDING | PENDING |
| Exception claim | PENDING | PENDING |
| Exception adjudication | PENDING | PENDING |
| Challenge or expired challenge window | PENDING | PENDING |
| Finalization | PENDING | PENDING |
| Withdrawal | PENDING | PENDING |
| Meaningful fail-closed path | PENDING | PENDING |
| Before/after party balances | PENDING | PENDING |
| Final `get_stats()` | PENDING | PENDING |
| Accounting balanced proof | PENDING | `deposited == agreement_escrow + challenge_escrow + claimable + withdrawn` |
