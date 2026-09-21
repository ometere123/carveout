# CARVEOUT architecture

## Why GenLayer is used

Deterministic systems can establish a measured SLA result. They cannot reliably decide whether a frozen semantic clause such as “an upstream infrastructure failure materially caused this service impact” is established by conflicting public evidence, whether causation matches the observation interval, or whether that exact frozen exception applies. CARVEOUT uses deterministic code for timing, thresholds, interval arithmetic and money, while GenLayer consensus is restricted to the contested semantic interpretation.

Deterministic duties are agreement formation, authorization, timing, source-policy enforcement, measurement threshold comparison, interval validation, partial-liability arithmetic, GEN allocation, settlement and accounting. Consensus duties are semantic interpretation of public evidence, applying the frozen exception to facts, assessing causation against the impact interval, and challenge re-evaluation. GenLayer is not claimed as necessary for arithmetic or ordinary deterministic oracle facts.

## Lifecycle

```text
provider bond + frozen SLA, source policy and exceptions
          ↓
       PROPOSED
          ↓ named customer accepts before exposure and deadline
       ACTIVE
          ↓ customer submits completed miss + evidence packet
 MEASUREMENT_PENDING
          ↓ GenLayer validators independently re-fetch and compare evidence digests
   ┌──────┼──────────────────┐
NOT_PROVEN SOURCE_UNAVAILABLE VERIFIED MISS
   ↓          ↓                    ↓
reject   bounded retry       OPEN INCIDENT
                               ↓ provider response window
                      frozen exception claim
                               ↓
                    semantic adjudication
                  ┌────────────┴─────────────┐
              decision                   non-decision
         bounded challenge         bounded retry/neutral close
                  └────────────┬─────────────┘
                    deterministic settlement
```

`create_agreement()` freezes service, terms, source policy, exceptions and collateral. The named customer must accept the complete proposal before exposure, with at least 300 seconds remaining. Proposal creation itself must execute at least 600 seconds before exposure. A proposed agreement can be expired for a provider bond refund.

## Source policy and measurement

Measurement evidence requires 2..8 unique origins, at least two source families, and an `INDEPENDENT_PROBE` outside the service domain. Each URL must match a frozen family, public DNS host and path prefix. The case hash binds the submitted evidence locations and claim.

`verify_measurement()` independently fetches each submitted source using its retrieval mode frozen in source policy (`REQUEST_JSON`, `REQUEST_TEXT`, or `RENDER_TEXT`). GenVM documents the HTTP request API and rendered page API in the [Web Access reference](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access). The contract sends bounded fetched content (24,000 characters/source, 48,000/decision) to structured extraction. Each source yields a normalized manifest with source identity, attribution, contribution, measured availability when established, event intervals and bounded factual notes. Persisted manifests are bounded to 3,600 characters/source; raw page length above the prior 800-character excerpt limit is not itself a failure. A decisive result requires every submitted source—including the independent probe and corroborating source—to be available, attributed to the frozen service/window and materially supportive. `NOT_PROVEN` rejects the report without touching provider collateral. `SOURCE_UNAVAILABLE`, empty/malformed content or actual processing-limit excess yields a bounded non-decision/retry. After measurement retry exhaustion, the unproven incident can be dismissed and the agreement remains available for a later real attempt.

## Durable canonical evidence commitments

Each measurement, exception adjudication and challenge decision stores a structured evidence manifest, its consensus SHA-256 digest, and a separate leader observation digest. The consensus digest binds consequential stable fields: exact submitted URL/origin/family, service and frozen interval, availability, attribution, source contribution and normalized event intervals. It excludes volatile request metadata and short explanatory prose. `measurement_evidence_digest`, `exception_evidence_digest` and `challenge_evidence_digest` therefore reflect the manifest validators independently agree upon. The separate `*_observation_digest` hashes the accepted leader's fetched bodies and supports audit; it is not compared to validators' different raw observations. Only bounded manifests/factual notes are persisted; full webpages are never stored.

The manifest and digests supplement, rather than replace, `measurement_case_hash`, `exception_case_hash` and `challenge_case_hash`. Validators independently re-fetch the same frozen sources, independently extract structured facts, and compare exact consequential outputs and canonical evidence digests. Changes only to timestamps, rolling ranges, cache metadata, counters, JSON order, unrelated records, or page chrome can agree when the stable manifest is identical. Differences in service attribution, window attribution, availability, source contribution, event intervals, exception result, excused intervals, challenge outcome or settlement consequence cannot agree. The contract does not compare free-form reasoning prose.

The documented GenVM request/render surfaces do not provide a reliable redirect chain/final URL as an input to this contract. CARVEOUT enforces and records the submitted URL/origin but does not claim to prove a final redirect destination. Structured semantic attribution to the frozen service/window is required for decisive measurement, exception and challenge outputs; if it cannot be established, the operation is non-decisive. Reviewers should treat redirect provenance as a runtime limitation and prefer stable direct URLs where that distinction matters.

Fetched page text is untrusted data, including prompt-like instructions. Consensus prompts explicitly exclude such instructions. Empty, malformed, unavailable or contradictory material cannot create a favorable semantic result or manufacture liability.

## Provider burden and exception judgment

After a verified miss, the provider may claim only a clause frozen in the agreement and must submit evidence from allowed origins. If the provider does not claim an exception within the response window, the already independently verified miss can default to full liability.

`adjudicate_exception()` re-fetches measurement and exception evidence together. Consequential outcomes are `PROVEN` (0 liable bps), `NOT_PROVEN` (10,000 liable bps), `PARTIAL` (validated intervals, with liability computed by contract code), or `INCONCLUSIVE`/`SOURCE_UNAVAILABLE` (no semantic decision). A provider failing to prove an exception after a verified miss does not retroactively create that breach; the measurement gate established the miss first.

If evidence remains unavailable/inconclusive through the bounded adjudication period, the agreement closes neutrally: provider collateral is returned, no exception/liability judgment is recorded, and funds are not trapped. Unavailability is not converted to `NOT_PROVEN`.

For `PARTIAL`, the contract rejects malformed, overlapping, unsupported or out-of-window intervals and deterministically calculates:

```text
excused_bps = excused_duration * 10000 // observed_duration
liable_bps = 10000 - excused_bps
payout = min(provider_bond, max_credit * liable_bps // 10000)
```

## Full-record challenge

Either party may submit one bonded challenge while an allocation is pending, using an origin/path frozen at formation. The leader and validators reconstruct the complete case from measurement, exception and challenge evidence. Validators compare the structured outcome, revised status, attribution flags, intervals and evidence digest. `INCONCLUSIVE`/`SOURCE_UNAVAILABLE` do not change the pending allocation; after the bounded resolution period the challenge bond is returned and the pending judgment can finalize.

## Deterministic accounting and withdrawals

Consensus does not choose liability basis points or GEN. The contract allocates settlement, closes the agreement, enforces replay protection and exposes pull-based credits. A credit can only be withdrawn to its owner's address.

```text
total_deposited == agreement_escrow + challenge_escrow + claimable + withdrawn
```

This invariant is tested across proposal expiry, rejection, retries, adjudication, challenges, settlement and withdrawals. There is no admin outcome backdoor.

## Frontend timestamps

Contract timestamps remain canonical UTC Unix seconds. User-facing times use IANA timezone `Africa/Lagos` (WAT/UTC+1); tooltips retain canonical UTC ISO and Unix seconds. Display conversion never changes timestamps, hashes or protocol calculations.

## Release 0.4 evidence interval normalization

The 0.4 candidate treats historical events outside the frozen observation interval as irrelevant source records, not malformed evidence. It validates event intervals, clips them to the observation bounds, sorts and merges duplicate/overlapping intervals before consensus comparison. When a source supplies events but none overlap the frozen interval, it is marked as not matching the window and not supporting measurement. Service attribution and the independent-source contribution requirements remain enforced. This is provider-neutral and does not parse vendor-specific metadata.
