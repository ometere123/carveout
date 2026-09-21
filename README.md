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

Evidence uses a provider-neutral pipeline: fetch each frozen source, independently extract a bounded structured manifest, normalize it, then compare consequential fields. Volatile request timestamps, rolling metadata, counters, response ordering, unrelated current records, and page chrome do not enter the consensus digest. The `measurement_evidence_digest`, `exception_evidence_digest`, and `challenge_evidence_digest` commit to normalized source identity, service/window attribution, source contribution, measured availability and event intervals. Validators do not compare narrative reasoning. Separate `*_observation_digest` values commit to the accepted leader's fetched body hashes for audit; they are not required to match validators' observations. Each source is processed up to 24,000 characters (48,000 total per decision), while only bounded structured manifests are persisted (3,600 characters per source). Larger-than-800-character evidence remains analyzable; the processing/storage limits are separate.

Each source policy freezes a retrieval mode: `REQUEST_JSON`, `REQUEST_TEXT`, or `RENDER_TEXT` (omitted mode defaults to `RENDER_TEXT`). GenVM's stable HTTP request API is suitable for JSON/text endpoints, and page rendering is available where needed. A decisive measurement requires every submitted source to contribute evidence for the named service and completed observation interval, including an independent probe and a corroborating family. GenVM does not expose a reliable redirect chain/final URL for these reads; CARVEOUT records the submitted URL and requires content-based service/window attribution, but does not claim final-destination provenance. Prefer stable, non-redirecting source URLs where origin provenance is material. Malformed, empty, unattributable, stale or unavailable evidence remains non-decisive.

## Main lifecycle

`create_agreement → accept_agreement → open_incident → verify_measurement → claim_exception → adjudicate_exception → optional challenge_exception/resolve_challenge → finalize_incident (or bounded default breach) → withdraw_credit`

## Repository

```text
contracts/carveout.py       one substantial Intelligent Contract
59 Direct Mode tests        authored behavioural/adversarial coverage (current checkout)
tests/integration/              opt-in live Studionet smoke against a deployed address
frontend/                       multipage Next.js application
deploy/deployScript.ts          61999-locked deployment script
docs/                           architecture, security, live-demo and reviewer evidence
AGENT_HANDOFF.md                detailed execution handoff
GOAL_PROMPT.txt                 compact finishing-agent goal
STATIC_VERIFICATION.md          checks actually run while packaging
```

Current contract surface: **21 public methods**. Release 0.3.0 is deployed at [`0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9`](https://explorer-studio.genlayer.com/address/0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9), deployment transaction [`0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323`](https://explorer-studio.genlayer.com/tx/0x0a7d3471aa60f1c4d8becff9e151ad7f655b13ad54dae6352f80b3353a860323). A live 0.3 measurement attempt ended `UNDETERMINED` after validators disagreed over relevant evidence with extra out-of-window history. Release 0.4.0 prepares generic interval normalization, passed [GitHub CI run 35606141013](https://github.com/ometere123/carveout/actions/runs/35606141013) at source commit `ba037c4148f8f79b45b781fe3200def9a817fb54`, and is not deployed; do not retry that incident or use it as proof of the fix. New live testing must wait for a fresh verified release. See [docs/REVIEW_EVIDENCE.md](docs/REVIEW_EVIDENCE.md).

## Frontend

The UI is intentionally product-specific rather than a reusable crypto/AI dashboard. Visual direction: **forensic SLA dossier: ivory ruled sheets, red examiner marks, evidence tabs and incident timelines**.

Routes: `/`, `/agreements`, `/agreements/[id]`, `/open`, `/account`, and `/protocol`. Primary navigation is limited to Agreements, New Agreement, Account, and Protocol; incident-specific actions stay within the agreement workflow. The New Agreement form starts blank. **Load Sample Agreement** is an explicit opt-in and its illustrative terms must be checked and replaced before a real proposal. The dynamic detail route reads on-chain state and keeps signing, finality, readback, and error feedback beside the relevant workflow.

User-facing timestamps are presented in West Africa Time using the IANA zone `Africa/Lagos`. UTC ISO values and Unix seconds remain canonical and are available on timestamp hover; no contract values or calculations are shifted.

When customers report an observation interval, they enter readable date/time values labeled WAT. The frontend converts those values with the `Africa/Lagos` IANA timezone to Unix seconds before the contract call; invalid and reversed intervals are rejected before submission.

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

The deployed 0.3.0 source commit `b70d49659b569ec7941a7607735ca5f096d10ebc` passed [GitHub CI run 35583968282](https://github.com/ometere123/carveout/actions/runs/35583968282). The 0.3.0 live measurement for `cv-i-2` (transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba`) reached `UNDETERMINED` and remains `MEASUREMENT_PENDING`; do not retry it. The full economic lifecycle is not demonstrated.

**Release boundary:** 0.3.0 at `0x74D8aEc8BF79369BeDdCae000214552Dcc7D00A9` remains deployed canonical until 0.4.0 has green CI, is deployed and source/schema verified. The 0.4.0 candidate is not safe for live writes yet. Lifecycle transactions remain user-approved.

## Previously deployed baseline

The previous frontend deployment and 0.2.0 contract are retained for provenance in `deployments/studionet.json`.

The earlier 0.1 contract deployment is recorded at [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054), with deployment transaction [`0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf`](https://explorer-studio.genlayer.com/tx/0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf). Older deployments are historical provenance only.

The previous 0.1 address must not be used with current UI code. The 0.2.0 live failure must not be retried. The release-0.3 economic lifecycle—including the new evidence measurement, exception adjudication, challenge, settlement, credits and withdrawals—has not yet been demonstrated; see [docs/LIVE_DEMO.md](docs/LIVE_DEMO.md). A deployment and a green CI run are not evidence that those lifecycle transactions occurred.
