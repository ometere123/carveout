# CARVEOUT security notes

## Security model

CARVEOUT separates **proof that an SLA miss happened** from **judgment about whether a frozen exception excuses it**. That prevents either party from becoming its own oracle. All money logic is deterministic after the semantic facts are established.

## Critical invariants

1. Studionet `61999` / `https://studio.genlayer.com/api` is the only release target.
2. Provider bond and maximum service credit are fixed when the agreement is created.
3. A customer-typed metric cannot expose provider collateral until independent multi-source measurement consensus verifies the service, window and measured value.
4. Only exception clauses frozen before the incident may be invoked.
5. `SOURCE_UNAVAILABLE`/`INCONCLUSIVE` are non-decisions; they do not prove an excuse.
6. Provider silence after a verified miss cannot strand the customer forever; bounded default-breach paths exist.
7. Either economic party may challenge a pending liability allocation with a bond.
8. The model returns liability basis points, never GEN. Settlement applies the frozen credit amount mechanically.
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
