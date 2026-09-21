# CARVEOUT security notes

## Trust boundary

CARVEOUT separates deterministic SLA measurement and settlement from semantic exception interpretation. Deterministic code enforces the accepted specification, authorization, timing, source-family/origin/path rules, measured thresholds, interval constraints, liability arithmetic, GEN movement and accounting. GenLayer consensus is reserved for whether conflicting public evidence establishes the exact frozen exception and its causal relation to a measured event window; challenge consensus re-evaluates that semantic judgment against the complete record.

## Critical invariants

1. Studionet `61999` and `https://studio.genlayer.com/api` are the only release network/RPC.
2. Provider, named customer, bond, credit limit, SLA terms, exceptions and evidence policy are frozen before acceptance/exposure. Proposal execution leaves at least 600 seconds; acceptance leaves at least 300 seconds.
3. A customer-entered metric does not expose collateral. Measurement consensus must independently reproduce the service/window/value using multiple frozen source families and origins, including an independent probe outside the service domain.
4. Consequential evidence is bound by exact submitted URL, normalized origin, evidence family, service, observation window, decision timestamp, bounded canonical text excerpt, full decision digest and companion content digest. The digests supplement all existing case hashes.
5. Validators independently fetch the frozen source set and compare evidence digests and consequential structured outputs, not prose. Prompt-like page text is untrusted data.
6. Empty/malformed/stale/wrong-service/wrong-window/unavailable or contradictory evidence cannot establish a favorable semantic finding. `SOURCE_UNAVAILABLE` and `INCONCLUSIVE` remain non-decisions.
7. Measurement retry exhaustion dismisses an unproven claimed miss. Exception evidence unavailability after a verified miss closes neutrally and returns provider collateral; it does not become `NOT_PROVEN` or create additional liability. A full default is available only for provider silence after the miss was independently verified.
8. Challenges reconstruct the full measurement, exception and challenge record. Non-decisions preserve the pending allocation; bounded expiry returns the challenge bond.
9. The model never chooses liability basis points or GEN. Contract code validates intervals and calculates liability, allocates service credits and conserves accounting.
10. Pull withdrawals can only target the owner's address; agreement/challenge replay is blocked; there is no admin outcome backdoor.

## Evidence normalization limits

The contract stores normalized rendered-text excerpts capped at 800 characters per evidence URL rather than whole HTML pages. Whitespace and a small set of common page-chrome lines are ignored. Dynamic or irrelevant content outside the excerpt does not affect the decision digest; material excerpt changes do. If useful facts are outside the bounded excerpt, the evaluator must return a non-decision rather than treating omitted content as proof.

The GenVM `render(..., mode="text")` runtime does not reliably expose redirect chains/final URLs. The contract can enforce the submitted URL/origin and preserve it in the evidence record, but cannot claim to verify a redirected destination. Decisive results must also attribute the evidence to the frozen service and event window; deployments that require cryptographic redirect provenance need a future runtime surface that exposes it.

## Adversarial coverage

- Customer submits a low but unsupported value: evidence must not match service/window or must not establish the claimed metric.
- Provider names an outage that does not explain the observation: semantic adjudication must evaluate causal overlap and the exact frozen clause.
- Page changes only whitespace/common chrome: canonical digests stay stable. A later decision timestamp changes only the full decision digest. Substantive excerpt changes, different source attribution, or a validator seeing different evidence changes the content commitment too.
- Truncated or empty excerpt, non-text/malformed response, unavailable source or malformed model output: no decisive result; bounded retry/terminal handling applies.
- Stale event, wrong service, mismatched interval, source disagreement or prompt injection: structured attribution and decision output fail closed; prompt-like content is data, never an instruction.
- Missing exception proof after a verified measurement: `NOT_PROVEN` is a semantic finding only when the service/window evidence set is attributable. Evidence unavailable is non-decision and neutral close.
- Duplicate/replayed settlement, challenge or withdrawal: contract status and accounting checks reject the second operation.

## Release state

The old deployed contract at the address in `deployments/studionet.json` predates the current evidence-commitment changes. Do not point a frontend containing the new incident fields at that old deployment. This repository prepares a candidate release; a human-controlled deployment/signature and returned address/hash are required before production configuration can be changed.
