# CARVEOUT candidate build status

This checkout started from latest `origin/main` commit `a5e73d2d1e7f82c529ca2d1f5acf7fa91893b723`. The release candidate adds bounded canonical evidence commitments and UTC+1 UI display while preserving the existing product, contract surface and injected-wallet flow.

| Gate | Candidate result |
| --- | --- |
| Hardening preserved | PASS by source/test review: proposal/customer acceptance, 600/300-second formation boundaries, frozen spec/source policies, replay protection, deterministic liability, pull withdrawals and accounting remain. |
| Durable evidence | PASS in Direct Mode: per-source canonical records persist exact submitted URL/origin/family/service/window/time, bounded excerpt, truncation flag, full decision digest and timestamp-independent content digest; validators compare both digests with consequential outputs. |
| Evidence attribution and unavailable handling | PASS in Direct Mode: measurement/exception/challenge attribution flags, truncation, source unavailability, validator mismatch and neutral bounded exception close are covered. |
| Accounting tests | PASS in Direct Mode: 52 tests, including settlement, proposal expiry, retry exhaustion, challenge, replay protection, neutral no-decision close and accounting conservation. |
| Frontend tests | PASS: 38 tests, including WAT conversion with unchanged canonical UTC/Unix values. |
| TypeScript typecheck | PASS. |
| Production Next.js build | PASS for candidate UI. |
| Static release guards | PASS: contract patterns, Studionet lock and six-route frontend surface. Candidate manifest hash verifier passes. |
| GenVM check / validate / schema / typecheck | PASS: static checks, validation (21 methods), schema generation matching recorded hash, and typecheck. |
| Candidate deployment/readback | PASS: finalized at `0xA9C86FF6113187915C1Bd8e958fC718719337531`; deployed source SHA-256 and 21-method schema match local candidate. Initial `get_stats()` is balanced and clean. |
| Read-only Studionet integration | PASS against candidate `0.2.0-studionet`; no live application writes were performed by the agent. |
| GitHub main CI | PASS: [run `35563691627`](https://github.com/ometere123/carveout/actions/runs/35563691627), tested main commit `7efce487c84b75d3b757036e2e8c3cd94dd98bcb`. |
| Contract deployment | PASS: candidate finalized and source/schema verified. Previous deployed address remains historical only. |
| Canonical production frontend | PASS: Vercel deployment `dpl_7LsZDctCsRoxfLPj99kaJaKtLsDz` READY; canonical URL HTTP 200 and served client config verified for candidate address, chain 61999 and canonical RPC. |
| User browser-wallet lifecycle | PENDING user execution; no agent-side application writes. |

Candidate source hash, unchanged public schema hash, historical deployment and user-operated lifecycle evidence still pending are tracked in [`deployments/studionet.json`](deployments/studionet.json). The user-run transaction sequence is in [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md). No live hash, agreement, incident, balance or adjudication is claimed.
