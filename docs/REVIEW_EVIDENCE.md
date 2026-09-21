# CARVEOUT reviewer evidence ledger

## Release identity

- Network: GenLayer Studionet `studionet`, chain `61999`; RPC `https://studio.genlayer.com/api`; explorer `https://explorer-studio.genlayer.com`.
- **Canonical deployed contract:** release `0.3.0-studionet`, [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), deployment [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323), FINALIZED / SUCCESS / MAJORITY_AGREE. Read-only RPC verified deployed source byte-for-byte against SHA-256 `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; canonicalized deployed schema matches local schema (SHA-256 `4801e0ceeb22866c94f40cac36e48ee3b0606d1500272927e92ede67d9991a70`). Network is Studionet 61999; deployment value 0, constructor args empty.
- Prior 0.2.0 contract [`0xA9C86FF6113187915C1Bd8e958fC718719337531`](https://explorer-studio.genlayer.com/address/0xA9C86FF6113187915C1Bd8e958fC718719337531), deployment [`0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726`](https://explorer-studio.genlayer.com/tx/0x518742b1e07f6c24c821a6e5fc9fb9acd24a2c944a31cf312121079693ae5726), is historical and does not contain the 0.3.0 changes.
- `get_stats()` on 0.3.0 returned `version=0.3.0-studionet`, `chain_id=61999`, `accounting_balanced=true`, all counts/balances zero, and no admin outcome controls. Initial accounting: `0 deposited = 0 agreement escrow + 0 challenge escrow + 0 claimable + 0 withdrawn`.
- Production frontend [`dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk) is READY at [https://carve-out.vercel.app](https://carve-out.vercel.app). `/open` returned HTTP 200; fetched compiled JavaScript contains the 0.3.0 address and not the old 0.2.0 address. The lifecycle below must use a fresh 0.3.0 agreement. Do not use an old agreement as evidence for this release.
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
| Read-only integration against 0.3 deployment | PASS — `get_stats()` read from canonical address, balanced initial state |
| 0.3 source/schema deployment verification | PASS — source byte-for-byte; schema canonical comparison |
| 0.3 production frontend deployment | PASS — Vercel deployment READY; production alias and compiled address verified |

The current machine needed `GENVM_VERSION=v0.2.16` explicitly because another cached RC bundle otherwise took precedence. No runner, runtime pin, network, SDK family, or contract dependency was changed.

## Release CI

Latest green main CI: [run 35584496491](https://github.com/ometere123/carveout/actions/runs/35584496491), tested commit `1048b7def2c71233695713c2633ab2e59215cd55`. The release source itself was also tested in [run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282) at `b70d49659b569ec7941a7607735ca5f096d10ebc`.

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
