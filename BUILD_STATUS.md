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
| Read-only Studionet integration | PASS against the historical 0.1.0 address only; candidate deployment/readback remains pending. No live application writes were performed. |
| GitHub main CI | PENDING candidate push. Latest pre-candidate main CI is recorded as run `35557155393` in the prior handoff; it does not verify this candidate. |
| Contract deployment | PENDING user signature. The previous deployed address is incompatible with candidate UI; do not wire/deploy candidate frontend to it. |
| Canonical production frontend | Existing Vercel deployment is the previous release. Candidate frontend deploy is blocked until a new source/schema-verified contract address is returned. |
| User browser-wallet lifecycle | PENDING user execution; no agent-side application writes. |

Candidate source hash, unchanged public schema hash, historic deployment and pending steps are tracked in [`deployments/studionet.json`](deployments/studionet.json). The user-run transaction sequence is in [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md). No live hash, agreement, incident, balance or adjudication is claimed.
