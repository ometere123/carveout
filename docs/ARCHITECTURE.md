# CARVEOUT architecture

## Product boundary

CARVEOUT is a provider-backed SLA exception protocol. It does not ask GenLayer to compare `99.00 < 99.95`. Threshold arithmetic remains deterministic. The contested question is whether an exception clause frozen before the incident actually excuses an independently established SLA miss.

The provider funds the maximum service credit when the agreement is created. The customer cannot create liability merely by typing a bad metric, and the provider cannot invent a new exception after failure.

## Lifecycle

```text
provider bond + frozen SLA, source policy and exceptions
          ↓
       PROPOSED
          ↓ customer signs before the formation deadline
       ACTIVE
          ↓ customer submits claimed miss + measurement packet
 MEASUREMENT_PENDING
          ↓ GenLayer independently re-fetches measurement sources
   ┌──────┼───────────────────┐
NOT_PROVEN SOURCE_UNAVAILABLE  VERIFIED MISS
   ↓            ↓                   ↓
reject      bounded retry        OPEN INCIDENT
                                    ↓ provider response window
                           claim frozen exception
                                    ↓
                         exception adjudication
                         ├─ PROVEN      0 liable bps
                         ├─ PARTIAL     1..9999
                         ├─ NOT_PROVEN  10000
                         └─ unavailable/inconclusive
                                    ↓
                           symmetric bonded challenge
                                    ↓
                           deterministic service credit
```

## Measurement gate

`open_incident()` records only a **claimed** miss. The provider first proposes and bonds the complete specification. The named customer must accept at least 300 seconds before the window and before the proposal deadline. Unaccepted proposals can be expired for a provider bond refund. Agreement terms and the structured source policy are committed in `spec_hash` and cannot be changed.

The measurement packet must contain 2..8 unique HTTPS origins, at least two allowed source families, and an `INDEPENDENT_PROBE` whose frozen host is not the service host or a subdomain. Evidence origins and path prefixes must match the policy accepted at formation; a self-applied family label is insufficient. Allowed measurement families are:

- `INDEPENDENT_PROBE`
- `STATUS_AGGREGATOR`
- `PUBLIC_TELEMETRY`
- `PROVIDER_STATUS`

`verify_measurement()` independently re-fetches the packet and reproduces:

- `result`
- exact integer `measured_bps`
- `service_matches`
- `window_matches`

Only a verified value below the frozen target opens the contractual incident. A value at/above target or `NOT_PROVEN` clears the incident without touching provider funds. `SOURCE_UNAVAILABLE` creates a bounded retry state; if evidence stays unavailable, anyone can dismiss the unproven incident after the retry deadline. This prevents unavailable measurement evidence from becoming a breach.

## Provider burden after a verified miss

Once the miss itself is established, the provider has a bounded response window. It may invoke only an exception code frozen in the agreement and must attach public evidence. If it does nothing, the independently proven miss can default to full liability after the response deadline.

If exception evidence remains unavailable/inconclusive past the adjudication grace period, the provider has still failed to establish its excuse and `finalize_default_breach()` can settle full liability. This burden applies **only after** the measurement gate independently proves the SLA miss.

## Exception consensus

`adjudicate_exception()` re-fetches the measurement and exception evidence together and decides only the frozen carve-out. Consequential outputs are:

- `PROVEN` → `liable_bps = 0`
- `NOT_PROVEN` → `liable_bps = 10000`
- `PARTIAL` → bounded evidence-supported excused intervals; deterministic `liable_bps = 10000 - (excused_duration * 10000 // observed_duration)`, restricted to `1..9999`
- `INCONCLUSIVE` / `SOURCE_UNAVAILABLE` → non-decision

The normalizer rejects internally contradictory result/liable combinations. Validators independently repeat the web/semantic task and compare status plus the evidence-bound excused intervals; contract code derives all basis points. Natural-language fact/basis text remains auditable but is not required to match word-for-word. Measurement and exception evidence origins are checked against the frozen agreement source policy.

## Symmetric challenge

Either agreement party may file the one in-contract challenge while a settlement is pending. This matters because a customer may challenge an over-broad excuse and a provider may challenge a full-liability finding. The challenge must cite an origin/path allowed by the frozen challenge source policy and post the exact bond. On resolution, the leader and validators re-fetch the original measurement evidence, original exception evidence, and challenge evidence, then compare structured outcomes and any bounded interval revision against the same frozen clause and case context. `INCONCLUSIVE` and `SOURCE_UNAVAILABLE` do not alter liability. Measurement, exception and challenge inputs receive deterministic case commitments exposed in views.

- upheld: the challenger receives their bond back and `liable_bps` is revised;
- rejected: the bond goes to the opposing agreement party;
- unavailable/inconclusive: no result is forced; after the bounded resolution deadline the bond is refunded and the original pending allocation may finalize.

## Deterministic settlement

The LLM never chooses GEN or partial percentages. It can only propose supported, bounded excused intervals; the contract rejects malformed, overlapping, unsupported or out-of-window intervals and computes liability from their union. The LLM never chooses GEN. The customer credit is:

```text
payout = min(provider_bond, max_credit * liable_bps / 10000)
```

The remaining provider bond becomes provider pull credit. Each agreement settles once and closes.

Accounting invariant:

```text
total_deposited == agreement_escrow + challenge_escrow + claimable + withdrawn
```

## Frontend boundary

The browser uses generic injected EIP-1193 only. The UI exposes the measurement gate separately from the exception phase so a reviewer can see the protocol did not trust the customer's claimed number. Finalized reads and execution-result checks are enforced in the shared GenLayer client adapter.
