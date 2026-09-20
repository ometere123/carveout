# CARVEOUT

**A provider-backed SLA exception protocol: independently prove the miss first, then let GenLayer decide whether a frozen carve-out actually excuses it.**

CARVEOUT is hard-locked to **GenLayer Studionet only**:

- chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- wallet: generic injected **EIP-1193** through `window.ethereum` only

There is no 61997/Studio-dev release path, Snaps path, WalletConnect path, embedded wallet, backend signer or browser private key in the application.

## Stable Studionet toolchain

The release toolchain is pinned to stable Studionet 61999: Python 3.12, local GenLayer CLI 0.39.1, `genlayer-js==1.1.8`, `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, `genvm-linter==0.11.0`, Node 22 in CI and Vercel, and the stable `py-genlayer` runtime hash in the contract.

Use the repository-local CLI binary for CARVEOUT; do not use or change a global CLI:

```powershell
.\.genlayer-stable\node_modules\.bin\genlayer.cmd network set studionet
.\.genlayer-stable\node_modules\.bin\genlayer.cmd network info
```

The CLI tool directory and its cache are local-only and must not be committed.

## Product boundary

CARVEOUT deliberately keeps SLA arithmetic deterministic. A customer cannot expose provider collateral merely by typing a poor availability number, and a provider cannot invent an exception after failure. Independent measurement consensus opens the incident; only then can a frozen exception be adjudicated and challenged.

Changing web evidence and semantic questions use custom leader/validator consensus. Validators independently re-fetch/reason and compare consequential structured fields rather than accepting JSON shape or free-form prose. Threshold arithmetic, escrow, credits, time windows and final settlement remain deterministic.

## Main lifecycle

`create_agreement → accept_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`

## Repository

```text
contracts/carveout.py       one substantial Intelligent Contract
46 Direct Mode tests        authored behavioural/adversarial coverage
tests/integration/              opt-in live Studionet smoke against a deployed address
frontend/                       multipage Next.js application
deploy/deployScript.ts          61999-locked deployment script
docs/                           architecture, security, live-demo and reviewer evidence
AGENT_HANDOFF.md                detailed execution handoff
GOAL_PROMPT.txt                 compact finishing-agent goal
STATIC_VERIFICATION.md          checks actually run while packaging
```

Current contract surface: **21 public methods**. Direct Mode, genvm-lint and frontend release gate results are recorded in [docs/REVIEW_EVIDENCE.md](docs/REVIEW_EVIDENCE.md).

## Frontend

The UI is intentionally product-specific rather than a reusable crypto/AI dashboard. Visual direction: **forensic SLA dossier: ivory ruled sheets, red examiner marks, evidence tabs and incident timelines**.

Routes: `/`, `/agreements`, `/agreements/[id]`, `/open`, `/account`, and `/protocol`. Primary navigation is limited to Agreements, New Agreement, Account, and Protocol; incident-specific actions stay within the agreement workflow. The New Agreement form starts blank. **Load Sample Agreement** is an explicit opt-in and its illustrative terms must be checked and replaced before a real proposal. The dynamic detail route reads on-chain state and keeps signing, finality, readback, and error feedback beside the relevant workflow.

## Static checks included in the handoff

```bash
python -m py_compile contracts/carveout.py tests/direct/*.py tests/integration/*.py
python scripts/check_contract_patterns.py
python scripts/check_release.py
```

Current results, the compatible Python pins, and live-release blockers are recorded in `VERIFICATION_STATUS.md` and `docs/REVIEW_EVIDENCE.md`. `STATIC_VERIFICATION.md` describes the static release guards.

## Real release gates for the finishing environment

```bash
py -3.12 -m pip install -r requirements.txt
genvm-lint check contracts/carveout.py --json
pytest tests/direct/ -v
npm ci
cd frontend && npm ci && npm test && npm run typecheck && npm run build
```

The canonical contract deployment, source/schema comparison, `get_stats()` read, and public frontend deployment are recorded in `deployments/studionet.json`. The canonical website is [https://carveout-sla.vercel.app](https://carveout-sla.vercel.app). Run `docs/LIVE_DEMO.md` only with a genuine SLA and actual public measurement evidence; record finalized transaction hashes and state reads. A complete adjudication/challenge/settlement/withdrawal lifecycle is not yet demonstrated.

## Live release

The current canonical contract is deployed on Studionet 61999 at [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054). Its finalized deployment transaction is [`0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf`](https://explorer-studio.genlayer.com/tx/0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf). The public frontend is [carveout-sla.vercel.app](https://carveout-sla.vercel.app). Deployment source, schema, initial `get_stats()` result, hosted routes and verification limits are recorded in [deployments/studionet.json](deployments/studionet.json) and [docs/REVIEW_EVIDENCE.md](docs/REVIEW_EVIDENCE.md).

The live contract is fresh and currently has no agreements or incidents. The full economic lifecycle—including evidence measurement, exception adjudication, challenge, settlement, credits and withdrawals—has not yet been demonstrated on-chain; see [docs/LIVE_DEMO.md](docs/LIVE_DEMO.md). A deployment and a green CI run are not evidence that those lifecycle transactions occurred.
