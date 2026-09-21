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

Deterministic systems can establish the measured SLA result. They cannot reliably decide whether a frozen semantic clause such as “an upstream infrastructure failure materially caused this service impact” is established by conflicting public evidence, whether causation matches the observation interval, or whether that exact frozen exception applies. CARVEOUT uses deterministic code for timing, thresholds, interval arithmetic and money, while GenLayer consensus is restricted to the contested semantic interpretation.

Deterministic responsibilities are agreement formation, authorization, timing, source-policy enforcement, measurement threshold comparison, interval validation, partial-liability arithmetic, GEN allocation, settlement and accounting. GenLayer consensus handles semantic interpretation of public evidence, whether facts establish the exact frozen exception, causal relation to the measured impact, and challenge re-evaluation. GenLayer is not used for arithmetic or ordinary deterministic oracle facts.

At each measurement/adjudication/challenge decision, the contract stores a bounded canonical evidence representation: normalized rendered-text excerpts (maximum 800 characters per source) plus submitted URL, normalized origin, source family, service identity, observation interval and decision timestamp. A full SHA-256 decision digest binds the timestamp and content; a companion content digest omits only the decision timestamp, so reviewers can distinguish a changed evidence representation from the same representation evaluated later. Both supplement the existing case hash. Validators independently re-fetch and compare the structured decision and digests. GenVM's text renderer does not expose a reliable redirect chain or final URL; CARVEOUT records and enforces the submitted URL/origin but does not claim to prove a final redirect destination. Decisions fail closed when the returned evidence is malformed, empty, unattributable or unavailable.

## Main lifecycle

`create_agreement → accept_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`

## Repository

```text
contracts/carveout.py       one substantial Intelligent Contract
52 Direct Mode tests        authored behavioural/adversarial coverage (candidate checkout)
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

User-facing timestamps are presented in West Africa Time using the IANA zone `Africa/Lagos`. UTC ISO values and Unix seconds remain canonical and are available on timestamp hover; no contract values or calculations are shifted.

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

The canonical contract deployment, source/schema comparison, `get_stats()` read, and public frontend deployment are recorded in `deployments/studionet.json`. The canonical website is [https://carve-out.vercel.app](https://carve-out.vercel.app). Run `docs/LIVE_DEMO.md` only with a genuine SLA and actual public measurement evidence; record finalized transaction hashes and state reads. A complete adjudication/challenge/settlement/withdrawal lifecycle is not yet demonstrated.

**Release boundary:** candidate contract `0xA9C86FF6113187915C1Bd8e958fC718719337531` is finalized on Studionet and its deployed source/schema and initial `get_stats()` read have been verified. The production frontend still needs a new frontend-only deployment configured to that address. Lifecycle transactions are reserved for the user and remain pending.

## Previously deployed baseline

The prior contract deployment is recorded at [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054), with deployment transaction [`0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf`](https://explorer-studio.genlayer.com/tx/0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf). The currently hosted frontend at [carve-out.vercel.app](https://carve-out.vercel.app) is also the previous release. Both are retained for provenance and do not implement the candidate evidence record fields.

The previous address must not be used with candidate UI code. The candidate live economic lifecycle—including evidence measurement, exception adjudication, challenge, settlement, credits and withdrawals—has not yet been demonstrated; see [docs/LIVE_DEMO.md](docs/LIVE_DEMO.md). A deployment and a green CI run are not evidence that those lifecycle transactions occurred.
