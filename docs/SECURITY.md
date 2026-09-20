# CARVEOUT security notes

## Security model

CARVEOUT separates **proof that an SLA miss happened** from **judgment about whether a frozen exception excuses it**. That prevents either party from becoming its own oracle. All money logic is deterministic after the semantic facts are established.

## Critical invariants

1. Studionet `61999` / `https://studio.genlayer.com/api` is the only release target.
2. Provider bond, maximum service credit, full SLA specification, exception clauses and structured source policy are fixed in a proposed agreement; the named customer must accept before the window with at least 300 seconds formation lead. An unaccepted proposal has a bounded provider refund path.
3. A customer-typed metric cannot expose provider collateral until independent multi-source measurement consensus verifies the service, window and measured value.
4. Only exception clauses frozen before the incident may be invoked. Evidence URLs must match the exact accepted host/family/path policy; independent measurement origins cannot share the service domain, and measurement evidence requires distinct families and origins.
5. `SOURCE_UNAVAILABLE`/`INCONCLUSIVE` are non-decisions; they do not prove an excuse.
6. Provider silence after a verified miss cannot strand the customer forever; bounded default-breach paths exist.
7. Either economic party may challenge a pending liability allocation with the exact bond. Resolution validators reconstruct the full case from original measurement, exception and challenge evidence. Non-decisions preserve the pending allocation and refund after the bounded deadline.
8. The model cannot choose liability basis points or GEN. For PARTIAL it proposes bounded excused time intervals that cite frozen exception evidence; the contract validates them and computes the liable share deterministically. Settlement applies frozen economic rules mechanically.
9. Withdrawal can only target the credit owner.
10. `total_deposited == agreement_escrow + challenge_escrow + claimable + withdrawn` must remain true.

## Adversarial surfaces

- **Customer fabricates a low availability number:** `verify_measurement()` must reproduce it from at least two allowed source families including an independent probe.
- **Provider invents a post-incident exception:** `claim_exception()` accepts only a frozen code.
- **Provider points at a real upstream outage that does not explain the miss:** exception consensus evaluates the frozen clause and causal evidence rather than treating an outage headline as an automatic excuse.
- **Evidence outage:** unverified measurement can be dismissed after a bounded retry; unresolved provider exception evidence can eventually default against the party carrying the burden after the miss itself has already been proven.
- **One-sided challenge abuse:** challenge is symmetric and bonded; rejected bond goes to the opposing party.
- **Finalized-but-reverted transaction:** frontend treats successful consensus finality and successful execution as separate requirements.

## Release proof still required

Run real GenVM lint/tests and demonstrate: verified measurement → frozen exception result → challenge or challenge-window finality → deterministic service credit → withdrawal, plus one unproven/unavailable/default path.
