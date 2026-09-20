# CARVEOUT static packaging verification

Date: 2026-09-19

This report records checks that were actually executed on the packaged source. It is intentionally narrower than a live GenLayer verification report.

## Artifact facts

- network target: Studionet only
- chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- contract: `contracts/carveout.py`
- contract SHA-256: `6a34178f2d9ed61375588d70bc95eb2ea50d8f7eb8c560da349375fede95dfbf`
- contract lines: 490
- public methods: 19
- authored Direct Mode tests: 21
- frontend TS/TSX source files parsed: 17
- browser signer: injected EIP-1193 `window.ethereum`

## Passed in the packaging environment

```text
Python compile                         PASS
contract trust-boundary static guard  PASS
release/network/wallet static scan    PASS
frontend route/action surface guard   PASS
TypeScript/TSX parser diagnostics     PASS (0 syntax diagnostics)
```

## Deliberately unverified here

```text
genvm-lint                            NOT RUN — package unavailable offline
Direct Mode execution                 NOT RUN — genlayer-test unavailable offline
Next dependency typecheck/build       NOT RUN — npm dependencies unavailable offline
Studionet deployment/consensus        NOT RUN — requires finishing environment/account
live economic lifecycle               NOT RUN
public frontend                        NOT RUN
```

Passing this file is not evidence of a live deployment. Replace the `TBD` fields in `docs/REVIEW_EVIDENCE.md` only with real final hashes/addresses/results produced after the remaining gates run.
