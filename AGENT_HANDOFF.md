# CARVEOUT agent handoff — 0.3.0 consensus release

## Current state

Work is based on `main` commit `5ccc4ee` and leaves the existing stable toolchain, contract address, chain, RPC, SDK family and injected-wallet architecture unchanged. Contract source changes to `0.3.0-studionet` because the evidence-equivalence behavior changed. The contract source hash is `93d8c7cbd0329e8b07ccc6806b32476cda206a6a88acb36367602d018bb41ae6`; schema hash is `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; public signatures did not change.

## Local verification

Direct Mode 59/59; GenVM lint + validate PASS; schema generation PASS; contract typecheck PASS; contract-pattern/release/frontend-surface checks PASS; frontend tests 41/41; frontend TypeScript and production build PASS. For GenVM validation on this machine, set `GENVM_VERSION=v0.2.16`: without it an unrelated cached RC bundle can be selected. Do not change the contract header runner pin.

## Exact release gates still outstanding

1. Check/push the prepared source and docs to GitHub `main`; wait for CI green and record the exact source commit/run.
2. User deploys `contracts/carveout.py` via GenLayer Studio on Studionet 61999, canonical RPC; no constructor args and 0 value. Expected wallet `0xA7EeAE0E93793e3146Cb14b0700251B8b0EBADFB`. Expected source SHA-256 above. Collect finalized deployment tx + new address.
3. Read deployed code/schema/stats; compare exact source/schema. Update `deployments/studionet.json` and only then configure and deploy frontend to the new address.
4. User executes a fresh lifecycle and returns actual hashes/readbacks/screenshots. Never retry the 0.2.0 UNDETERMINED transaction.

## Preserved failure evidence

0.2.0 contract `0xA9C86FF6113187915C1Bd8e958fC718719337531`: proposal tx `0x7676d22bbc7a411ded3565077208355a3b7c0fdd915e0560b811206d9c636b3c` (`cv-a-1`), acceptance `0x7e14534c17c68e43cd288931ec7a9084b370f3346d219a50f06c2a51f344294c`, incident tx `0x7185530b04ea679a54fadadfa256d72b8a7c58ca02553b2f1eeb4e766392e2d0` (`cv-i-1`), measurement tx `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` UNDETERMINED after validator rotations. Canonical incident remains MEASUREMENT_PENDING. Full ledger is `docs/REVIEW_EVIDENCE.md`.

## Safety boundary

Do not inspect/use local secret keys; do not sign or submit user application writes. Read-only public RPCs are allowed. Do not use 0.2.0 address with 0.3.0 client code. Do not label the previous agreement as new-release evidence. No live outcome is proven until user returns finalized transaction evidence and canonical state reads.
