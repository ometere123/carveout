# CARVEOUT

**A provider-backed SLA exception protocol: independently prove the miss first, then let GenLayer decide whether a frozen carve-out actually excuses it.**

CARVEOUT is hard-locked to **GenLayer Studionet only**:

- chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- wallet: generic injected **EIP-1193** through `window.ethereum` only

There is no 61997/Studio-dev release path, Snaps path, WalletConnect path, embedded wallet, backend signer or browser private key in the application.

## Product boundary

CARVEOUT deliberately keeps SLA arithmetic deterministic. A customer cannot expose provider collateral merely by typing a poor availability number, and a provider cannot invent an exception after failure. Independent measurement consensus opens the incident; only then can a frozen exception be adjudicated and challenged.

Changing web evidence and semantic questions use custom leader/validator consensus. Validators independently re-fetch/reason and compare consequential structured fields rather than accepting JSON shape or free-form prose. Threshold arithmetic, escrow, credits, time windows and final settlement remain deterministic.

## Main lifecycle

`create_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`

## Repository

```text
contracts/carveout.py       one substantial Intelligent Contract
21 Direct Mode tests        authored behavioural/adversarial coverage
tests/integration/              opt-in live Studionet smoke against a deployed address
frontend/                       multipage Next.js application
deploy/deployScript.ts          61999-locked deployment script
docs/                           architecture, security, live-demo and reviewer evidence
AGENT_HANDOFF.md                detailed execution handoff
GOAL_PROMPT.txt                 compact finishing-agent goal
STATIC_VERIFICATION.md          checks actually run while packaging
```

Current contract surface: **19 public methods**, **490 source lines**.

## Frontend

The UI is intentionally product-specific rather than a reusable crypto/AI dashboard. Visual direction: **forensic SLA dossier: ivory ruled sheets, red examiner marks, evidence tabs and incident timelines**.

Routes: `/`, `/agreements`, `/agreements/[id]`, `/open`, `/account`, `/protocol`. The dynamic detail route reads finalized on-chain state and exposes the complete protocol write path with signing/finalizing/finalized/error feedback.

## Static checks included in the handoff

```bash
python -m py_compile contracts/carveout.py tests/direct/*.py tests/integration/*.py
python scripts/check_contract_patterns.py
python scripts/check_release.py
```

The packaging pass also parses every current frontend `.ts`/`.tsx` file with the TypeScript compiler API. See `STATIC_VERIFICATION.md`.

## Real release gates for the finishing environment

```bash
pip install -r requirements.txt
genvm-lint check contracts/carveout.py --json
pytest tests/direct/ -v
cd frontend && npm install && npm run typecheck && npm run build
```

Then confirm the built-in network resolves to **61999** / `https://studio.genlayer.com/api`, deploy the exact final source, wait for FINALIZED plus successful execution, compare deployed schema/source with this repository, wire the finalized address into the frontend, publish it, and run `docs/LIVE_DEMO.md` with real evidence and real transaction hashes.

## Release honesty

This ZIP is a source-complete implementation handoff, not a fabricated deployment report. The packaging environment did not have the GenLayer Python toolchain or frontend dependency tree available, so it does **not** claim `genvm-lint`, executed Direct Mode, Next production build, deployment, live validator consensus, native GEN settlement or public hosting. `VERIFICATION_STATUS.md` and `STATIC_VERIFICATION.md` separate what was actually checked from what the finishing agent must prove.
