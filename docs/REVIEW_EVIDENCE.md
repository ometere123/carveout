# CARVEOUT reviewer evidence ledger

## Existing deployed baseline (historical/current chain state)

- Network: GenLayer Studionet, alias `studionet`, chain ID `61999`; RPC `https://studio.genlayer.com/api`; explorer `https://explorer-studio.genlayer.com`.
- Previously deployed contract: [`0x75f2e473E6f010B510F1d281C8E4679fD2043054`](https://explorer-studio.genlayer.com/address/0x75f2e473E6f010B510F1d281C8E4679fD2043054).
- Previous deployment transaction: [`0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf`](https://explorer-studio.genlayer.com/tx/0x07ed7c7495129adc7ed26091c673b37dfe9dbd9b50fa85d21dd6a63b29722ddf).
- That deployed instance corresponds to source commit `8f1302f10e0fee65f79187241e7da853225240d4`, source SHA-256 `144caccbd8b6daa8cbebc72ae9a4a5737c44147cbc100e8f7f1cb23cadf35f98`, and schema SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`.
- **This old address does not contain the evidence-commitment/neutral-timeout candidate now in this repository. Do not use it with the candidate frontend.** A user-controlled Studionet deployment and canonical source/schema readback are required before frontend release.
- Previously deployed frontend baseline: [https://carve-out.vercel.app](https://carve-out.vercel.app), deployment `dpl_DvNdou86SF8oGDqF3Ya1kidSVEco`, source commit `351d283278b39870f123495dde6643f52151cdea`. It predates the current WAT/evidence-record UI.

## Candidate contract/frontend release

- Candidate version: `0.2.0-studionet`.
- Candidate contract source commit: `afb6a28de0a9f22aa8ac73fe72073a66822f5e13` (the release-manifest/documentation follow-up does not modify contract source).
- Candidate contract source SHA-256: `d8a0c3eb5ae2f7f164bb5526c42ec24557dbfa06f8a2cf540e30215210978a99` (verify again against final commit).
- Candidate schema: unchanged public signatures (21 public methods; 6 views and 15 writes), SHA-256 `26de6f5a55a686fb6f38bffd320d14ba53d4b74162a2ad15bdb123aed6f345fd`. Local `genvm-lint check`/validate, schema generation (hash match), and typecheck all pass; candidate CI remains required.
- Target network is hard-locked to Studionet `61999`, RPC `https://studio.genlayer.com/api`; new contract address and deployment transaction: **pending user-controlled deployment/signature**.
- Candidate production frontend contract address: **unset until the candidate contract address is verified**. Do not deploy this frontend while it points at the previous contract.
- Final code commit: pending final manifest/documentation commit and push. Latest green CI for candidate commit: pending.

## Candidate local gates

- Stable pins: Python 3.12; GenLayer CLI `0.39.1`; `genlayer-js==1.1.8`; `genlayer-test==0.29.2`; `genlayer-py==0.16.3`; `genvm-linter==0.11.0`; stable contract runtime hash retained.
- `run_direct_windows.py`: **52 Direct Mode tests passed** using Python 3.12 and the repository's Windows temp-file-lock workaround.
- Frontend tests: **38 passed**; typecheck: PASS; production Next.js build: PASS for the candidate UI.
- `scripts/check_contract_patterns.py`, `scripts/check_release.py`, and `scripts/check_frontend_surface.py`: PASS.
- GenVM lint/validate/schema/typecheck: PASS (21 methods; 6 views and 15 writes; generated schema hash matches).
- Read-only integration smoke: PASS against prior deployment `0x75f2e473E6f010B510F1d281C8E4679fD2043054` only; it does not verify candidate behavior. No consensus write or user wallet operation has been performed.
- Local 100% viewport/browser review and final canonical Vercel deployment: pending after verified contract deployment. The existing editorial design and prior desktop layout are retained; new timestamp and evidence-record displays need final browser inspection.

## Candidate evidence-integrity behavior

- Stored records include exact submitted URL, normalized origin, evidence family, service identity, observation bounds, decision timestamp, canonical excerpt (at most 800 characters/source) and truncation flag. A full decision digest binds the timestamp and representation; a companion content digest omits only decision time. Both supplement each existing case hash.
- Whitespace and designated common page chrome normalize to the same record; substantive excerpt changes alter both digests, while a later decision timestamp alters only the full digest. Overlong records fail closed as `SOURCE_UNAVAILABLE`/`INCONCLUSIVE` rather than making decisions from incomplete excerpts.
- Validators compare consequential structured results, service/window attribution, intervals and both evidence digests. Free-form reasoning prose is not an equivalence criterion.
- GenVM's renderer does not expose a reliable redirect chain/final URL. The contract enforces the submitted URL/origin and records this runtime limitation; it does not claim final-destination proof.
- Evidence unavailability is a non-decision. Measurement retry exhaustion rejects an unproven report. Exception adjudication unavailability closes neutrally and returns provider collateral. Challenge non-decisions preserve the pending allocation and bounded expiry refunds the challenger.
- WAT display uses `Africa/Lagos`; raw timestamps and all contract/evidence values remain UTC Unix seconds.

## Live lifecycle ledger (all pending; no live application writes performed by the agent)

Record only user-generated, finalized transactions and actual readbacks. Use the new deployed address and link each hash directly to the explorer.

| Evidence item | Actual value / explorer link |
| --- | --- |
| Candidate contract deployment transaction/address/source/schema readback | PENDING USER DEPLOYMENT |
| Provider proposal/funding transaction + agreement ID | PENDING USER BROWSER WALLET |
| Named customer acceptance transaction | PENDING USER BROWSER WALLET |
| Incident opening transaction + incident ID | PENDING USER BROWSER WALLET |
| Measurement decision transaction + `measurement_case_hash` + `measurement_evidence_digest` | PENDING USER BROWSER WALLET |
| Exception claim transaction + `exception_case_hash` | PENDING USER BROWSER WALLET |
| Exception adjudication transaction/result + `exception_evidence_digest` | PENDING USER BROWSER WALLET |
| Challenge transaction/result + `challenge_case_hash` + `challenge_evidence_digest` OR finalized challenge-window completion read | PENDING USER BROWSER WALLET |
| Deterministic finalization transaction + payout/provider return | PENDING USER BROWSER WALLET |
| Native GEN withdrawal transaction | PENDING USER BROWSER WALLET |
| Fail-closed healthy-service/false-claim path transactions and state | PENDING USER BROWSER WALLET |
| Provider/customer balances before and after | PENDING USER READBACK |
| Final `get_stats()` JSON | PENDING USER READBACK |
| Accounting proof `deposited == agreement escrow + challenge escrow + claimable + withdrawn` | PENDING USER READBACK |
| Explorer links and screenshots for every consequential step | PENDING USER EVIDENCE |

## Accounting evidence requirements

For each settlement and withdrawal, save the relevant party `get_credit()` values before and after, plus all five `get_stats()` amounts. Run `python scripts/verify_accounting.py path/to/get-stats.json` on the final stats response. The verifier checks chain/RPC identity and the exact conservation equation; it does not itself prove that transaction hashes are genuine.

## Manual runbook

See [`LIVE_DEMO.md`](LIVE_DEMO.md) for the wallet-by-wallet sequence, concrete form values, truthful controlled-service test setup, exact source URL shapes, approval values, expected canonical state and screenshot/hash return packet. All transaction hashes and live lifecycle evidence remain pending until the user supplies them.
