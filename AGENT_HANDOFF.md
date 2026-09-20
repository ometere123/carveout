# CARVEOUT final execution handoff

## Goal

Take this extracted repository from its current source-complete state to a **live, tested, deployed, reviewer-verifiable Studionet release**. This is an execution task, not a review or planning task. Preserve the protocol thesis and the existing visual identity. Do not stop at recommendations.

## Hard release constraints

- **Studionet only: chain 61999.**
- RPC exactly `https://studio.genlayer.com/api`.
- Generic injected EIP-1193 `window.ethereum` browser wallet only.
- No 61997, Studio-dev, Snaps, WalletConnect, embedded wallet, browser private key or backend signer.
- Keep one substantive Intelligent Contract unless a verified current GenLayer limitation requires a change.
- Missing, unavailable, contradictory or unproven evidence must never be silently promoted into a favourable economic verdict.
- Do not replace semantic validator replay with shape-only JSON validation.

## Product that must survive finishing

A provider-backed SLA exception protocol: independently prove the miss first, then let GenLayer decide whether a frozen carve-out actually excuses it.

CARVEOUT deliberately keeps SLA arithmetic deterministic. A customer cannot expose provider collateral merely by typing a poor availability number, and a provider cannot invent an exception after failure. Independent measurement consensus opens the incident; only then can a frozen exception be adjudicated and challenged.

Current lifecycle: `create_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`.

## Start here

1. Read `README.md`, `STATIC_VERIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/LIVE_DEMO.md`, the entire contract and all tests.
2. Install/use the current official GenLayer skills and Docs MCP when available; verify any GenLayer-specific API before changing it.
3. Run `python scripts/check_release.py` and `python scripts/check_contract_patterns.py`. Any alternate network or prohibited wallet path is a release blocker.

## Contract gates

```bash
pip install -r requirements.txt
genvm-lint check contracts/carveout.py --json
pytest tests/direct/ -v
```

Fix genuine GenVM/storage/closure/type/toolchain failures without weakening the economic or semantic rules. Keep or expand tests for exact payable checks, access control, state transitions, evidence unavailable/inconclusive states, malformed model output, substantive validator agreement/disagreement, replay/duplicate protection, bounded liveness, challenge outcomes, pull-credit withdrawal and accounting conservation.

Then run the integration/real-network checks that are appropriate to current tooling. The included `tests/integration/test_studionet_smoke.py` is opt-in and must point to the final deployed address; do not mistake it for full semantic consensus proof.

## Frontend gates

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

Preserve the current design system: **forensic SLA dossier: ivory ruled sheets, red examiner marks, evidence tabs and incident timelines**. Do not replace it with a template dashboard, glass/gradient AI aesthetic, chatbot, or one-scroll site. Keep the hero landing page and the separate product routes `/`, `/agreements`, `/agreements/[id]`, `/open`, `/account`, `/protocol`. Verify every visible write reaches the real contract and presents signing, submitted/finalizing, finalized and readable error states.

## Deployment

Use the built-in Studionet network. Before deploying, explicitly verify chain ID `61999` and RPC `https://studio.genlayer.com/api`. Deploy only the exact final lint/test-passing source. Wait for FINALIZED **and** successful execution. Then inspect deployed code/schema and `get_stats()` and compare them with this repository. Record the final address, deployment transaction and source commit in `deployments/studionet.json` and `docs/REVIEW_EVIDENCE.md`.

## Live proof

Execute `docs/LIVE_DEMO.md` with real, stable public evidence. The positive path must reach the actual semantic decision and the native-GEN economic consequence; also prove at least one meaningful negative/fail-closed path. If the evidence cannot truthfully satisfy the positive case, change the demo case, not the protocol.

## Publish and freeze

Wire the exact final address into the frontend environment, build again, publish it, and retest in a clean browser with a generic injected wallet on 61999. Confirm finalized reads, writes, wrong-network recovery, explorer links and understandable failures. Remove stale addresses, stale screenshots, test-only claims and unverified language. Make CI green and leave the working tree clean.

## Definition of done

- linter clean;
- all Direct Mode tests green;
- required real-network/integration checks green;
- production frontend typecheck/build green;
- exact final source deployed on 61999;
- deployed source/schema match repository;
- public frontend points only to the canonical address;
- live semantic consensus proven with real external evidence;
- live native GEN economic path proven;
- `get_stats().accounting_balanced` remains true after the demo;
- docs contain real evidence and no stale/aspirational deployment claims;
- CI/main/working tree green and clean.
