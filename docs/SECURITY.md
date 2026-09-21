# CARVEOUT security notes

## Trust boundary

CARVEOUT separates deterministic SLA measurement and settlement from semantic exception interpretation. Deterministic code enforces the accepted specification, authorization, timing, source-family/origin/path rules, measured thresholds, interval constraints, liability arithmetic, GEN movement and accounting. GenLayer consensus is reserved for whether conflicting public evidence establishes the exact frozen exception and its causal relation to a measured event window; challenge consensus re-evaluates that semantic judgment against the complete record.

## Critical invariants

1. Studionet `61999` and `https://studio.genlayer.com/api` are the only release network/RPC.
2. Provider, named customer, bond, credit limit, SLA terms, exceptions and evidence policy are frozen before acceptance/exposure. Proposal execution leaves at least 600 seconds; acceptance leaves at least 300 seconds.
3. A customer-entered metric does not expose collateral. Measurement consensus must independently reproduce the service/window/value using multiple frozen source families and origins, including an independent probe outside the service domain.
4. Each policy source freezes `REQUEST_JSON`, `REQUEST_TEXT`, or `RENDER_TEXT`. Fetched sources are processed up to 24,000 characters each / 48,000 per decision. Only bounded structured source manifests are persisted. The consensus digest binds source identity, service/window attribution, source contribution, availability and normalized event intervals; the separate leader observation digest records fetched-body hashes but is not compared across validators.
5. Validators independently fetch every submitted source, independently extract stable fields and compare exact consequential outputs plus the canonical manifest digest. They ignore raw-body hashes, generated timestamps, rolling metadata, JSON order, page chrome and narrative prose. Prompt-like page text is untrusted data.
6. Empty/malformed/stale/wrong-service/wrong-window/unavailable or contradictory evidence cannot establish a favorable semantic finding. `SOURCE_UNAVAILABLE` and `INCONCLUSIVE` remain non-decisions.
7. Measurement retry exhaustion dismisses an unproven claimed miss. Exception evidence unavailability after a verified miss closes neutrally and returns provider collateral; it does not become `NOT_PROVEN` or create additional liability. A full default is available only for provider silence after the miss was independently verified.
8. Challenges reconstruct the full measurement, exception and challenge record. Non-decisions preserve the pending allocation; bounded expiry returns the challenge bond.
9. The model never chooses liability basis points or GEN. Contract code validates intervals and calculates liability, allocates service credits and conserves accounting.
10. Pull withdrawals can only target the owner's address; agreement/challenge replay is blocked; there is no admin outcome backdoor.

## Evidence normalization limits

The contract does not use the old 800-character excerpt as an analysis cutoff. It processes each fetched body up to a hard 24,000-character safety limit (48,000 across the decision), allowing a relevant historical fact later in an ordinary page. It persists only normalized source manifests bounded to 3,600 characters per source, with at most 12 event intervals and six short factual notes. It fails closed when processing limits, malformed payloads or manifest bounds are exceeded. Volatile request timestamps, rolling ranges, counters, response ordering, unrelated current records and page chrome are not consensus-critical when the extracted historical manifest is identical.

The currently documented GenVM request/render surfaces do not provide a reliable redirect chain/final URL to this contract. It enforces and commits the submitted URL/origin and requires content-based attribution to the frozen service/window, but does not claim final-destination provenance. Prefer stable direct URLs where origin provenance matters; if a source's attribution cannot be established, the result is non-decisive.

## Adversarial coverage

- Customer submits a low but unsupported value: evidence must not match service/window or must not establish the claimed metric.
- Provider names an outage that does not explain the observation: semantic adjudication must evaluate causal overlap and the exact frozen clause.
- Request timestamps, cache/rolling metadata, JSON key order, unrelated records, page chrome, or fact-note wording change while stable manifests match: consensus remains possible and the consensus digest is stable; leader observation digest can differ.
- Availability, service/window attribution, source-contribution state or event intervals differ: canonical consensus digest differs and validator comparison rejects equivalence.
- Bodies over 800 characters with the relevant historical fact later in the body remain analyzable; empty/malformed JSON/text, unavailable sources, actual processing-limit excess or malformed manifest: no decisive result; bounded retry/terminal handling applies.
- Stale event, wrong service, mismatched interval, source disagreement or prompt injection: structured attribution and decision output fail closed; prompt-like content is data, never an instruction.
- Missing exception proof after a verified measurement: `NOT_PROVEN` is a semantic finding only when the service/window evidence set is attributable. Evidence unavailable is non-decision and neutral close.
- Duplicate/replayed settlement, challenge or withdrawal: contract status and accounting checks reject the second operation.

## Release state

The deployed canonical contract is 0.4.0 at `0x08Dc200120385474c40F1a48A640d987A94aB1BB` on Studionet 61999; deployment tx `0xbb9c23a98730ff3779f8bff4399b358d009f18d70716efc023a18b31428cd7cd` finalized successfully, and deployed source/schema match local artifacts. The production frontend is configured to this address. A new lifecycle must start with a fresh agreement. The superseded 0.3.0 measurement transaction `0x75daf13670200403477bed9beb07ea5200a83973f4bf106f296de66f12bfe0ba` ended `UNDETERMINED`; incident `cv-i-2` remains `MEASUREMENT_PENDING` and must not be retried or continued. Releases 0.3.0, 0.2.0 and earlier are historical.
