# CARVEOUT agent handoff — canonical 0.4.0

## Current release

- Network: GenLayer Studionet, chain `61999`; RPC `https://studio.genlayer.com/api`.
- Canonical contract: [`0x08Dc200120385474c40F1a48A640d987A94aB1BB`](https://explorer-studio.genlayer.com/address/0x08Dc200120385474c40F1a48A640d987A94aB1BB).
- Deployment: [`0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd`](https://explorer-studio.genlayer.com/tx/0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd), FINALIZED / SUCCESS / MAJORITY_AGREE.
- Contract source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`; SHA-256 `0af5222346cf2d0537f85ca0f2981f5368f2bb28548525110df9364ece2e7d2f`.
- Generated schema file `deployments/studionet-0.4.0.schema.json`, SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`; deployed canonical schema hash matches local at `4801e0ceeb22866c94f40cac36e48ee3b0606d1500272927e92ede67d9991a70`.
- Read-only deployed `get_stats()` reports 0.4.0, chain 61999, `accounting_balanced=true`, all counts and balances zero. Accounting: `0 deposited = 0 agreement escrow + 0 challenge escrow + 0 claimable + 0 withdrawn`.
- Production frontend: [`dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2`](https://vercel.com/delealufejoel-4184s-projects/carveout/dpl_2KJyYYm1gyqhUZ36ATT2N5Mrk7N2), READY at `https://carve-out.vercel.app`; HTTP `/open` 200 and deployed JS contains the canonical address, not the superseded 0.3 address. Vercel Production `NEXT_PUBLIC_CARVEOUT_CONTRACT` is set to the same address.
- Latest green main CI at handoff: [run 35608857030](https://github.com/ometere123/carveout/actions/runs/35608857030), commit `96f1d1bb67707a7f3c61ef7bf20077f65906498d`. Release source CI: [run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013), source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`.
- Local verification: Direct Mode 60/60; GenVM lint, validate, schema and typecheck PASS; contract/release/frontend-surface guards PASS; frontend tests 42/42; frontend typecheck and production build PASS. Read-only integration was environment-gated and skipped.

## Continue safely

The user operates every application wallet write and wallet switch. Never sign or submit lifecycle transactions, inspect/use private keys, or introduce an alternate signer. Continue only from a fresh agreement on canonical 0.4.0 after the user starts that lifecycle. The previous 0.3.0 `cv-i-2` measurement transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba` finalized `UNDETERMINED`; its canonical incident remains `MEASUREMENT_PENDING`. Preserve it as failure evidence; never retry it or continue its lifecycle. No economic lifecycle on 0.4.0 is yet demonstrated.

The Vercel upload initially failed because only `frontend/` was uploaded while the project Root Directory is also `frontend`. The successful production upload used the repository root so Vercel could resolve its configured root. Current successful deployment is recorded above.

## Preserved earlier failure evidence

On 0.2.0 at `0xA9C86FF6113187915C1Bd8e958fC718719337531`: proposal tx `0x7676d22bbc7a411ded3565077208355a3b7c0fdd915e0560b811206d9c636b3c` (`cv-a-1`), acceptance `0x7e14534c17c68e43cd288931ec7a9084b370f3346d219a50f06c2a51f344294c`, incident `0x7185530b04ea679a54fadadfa256d72b8a7c58ca02553b2f1eeb4e766392e2d0` (`cv-i-1`), and measurement `0x4efe7a6a73577360f2dff97fdbaabd9080842172a29534d58ada108547ba6645` ended UNDETERMINED. On 0.3.0, `cv-i-2` verification tx above also ended UNDETERMINED after validator rotations. Full transaction history is in `docs/REVIEW_EVIDENCE.md`.

## Safety boundary

Read-only public RPC and source/schema verification are allowed. No user application transaction is to be submitted without the user's explicit browser-wallet action. Do not present earlier-release activity as proof of the 0.4.0 evidence-consensus fix. Keep network, SDK, runtime and CLI pinned to the stable Studionet toolchain in `deployments/studionet.json`.
