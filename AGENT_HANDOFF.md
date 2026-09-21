# CARVEOUT agent handoff — 0.3.0 consensus release

## Current release continuation — 2026-09-21

Do not continue or retry the 0.3.0 live `cv-i-2` measurement: transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba` finalized `UNDETERMINED`, canonical state remains `MEASUREMENT_PENDING`. Candidate 0.4.0 clips, sorts and merges generic event intervals against the frozen window, and marks a source with no overlapping events as non-contributing. Source SHA-256 is `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`; schema is `deployments/studionet-0.4.0.schema.json`. Local checks pass (60 Direct Mode tests, 42 frontend tests, GenVM checks, typecheck/build and guards). Integration was environment-skipped; GitHub CI pending. The candidate is not deployed. Preserve the 61999 stable runner/toolchain; deployment needs the user's signing action, then verify source/schema and point production frontend only after readback. Start over with a fresh agreement on the new address.

## Current state

Release 0.3.0 is deployed and canonical on Studionet 61999 at [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), deployment tx [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323). Receipt finalized successfully (MAJORITY_AGREE); read-only source and schema verification passed. Source SHA-256 `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; schema SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; public signatures are unchanged. Stable toolchain, injected-wallet architecture, chain and RPC remain unchanged.

## Local verification

Direct Mode 59/59; GenVM lint + validate PASS; schema generation PASS; contract typecheck PASS; contract-pattern/release/frontend-surface checks PASS; frontend tests 41/41; frontend TypeScript and production build PASS. For GenVM validation on this machine, set `GENVM_VERSION=v0.2.16`: without it an unrelated cached RC bundle can be selected. Do not change the contract header runner pin.

Source commit `b70d49659b569ec7941a7607735ca5f096d10ebc` is pushed to main and passed [GitHub CI run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282).

## Release status and outstanding work

1. Production frontend [`dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_G6u9nyjfcTX7yXWoGRo5XVCMqrwk) is READY at `https://carve-out.vercel.app`, configured for the verified address; public route and compiled address readback passed.
2. User executes a fresh lifecycle and returns actual hashes/readbacks/screenshots. Never retry the 0.2.0 UNDETERMINED transaction.

Latest green main CI: [run 35584496491](https://github.com/ometere123/carveout/actions/runs/35584496491), commit `1048b7def2c71233695713c2633ab2e59215cd55`.

## Preserved failure evidence

0.2.0 contract `0xA9C86FF6113187915C1Bd8e958fC718719337531`: proposal tx `0x7676d22bbc7a411ded3565077208355a3b7c0fdd915e0560b811206d9c636b3c` (`cv-a-1`), acceptance `0x7e14534c17c68e43cd288931ec7a9084b370f3346d219a50f06c2a51f344294c`, incident tx `0x7185530b04ea679a54fadadfa256d72b8a7c58ca02553b2f1eeb4e766392e2d0` (`cv-i-1`), measurement tx `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` UNDETERMINED after validator rotations. Canonical incident remains MEASUREMENT_PENDING. Full ledger is `docs/REVIEW_EVIDENCE.md`.

## Safety boundary

Do not inspect/use local secret keys; do not sign or submit user application writes. Read-only public RPCs are allowed. Do not use 0.2.0 address with 0.3.0 client code. Do not label the previous agreement as new-release evidence. No live outcome is proven until user returns finalized transaction evidence and canonical state reads.
