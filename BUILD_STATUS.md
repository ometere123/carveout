# CARVEOUT build status

This status reflects the 2026-09-20 verification pass. CI for the current UI revision is pending; see the evidence section below for what was directly run.

| Gate | Verified result |
| --- | --- |
| GenLayer dependency resolution | Stable pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, frontend `genlayer-js==1.1.8`. |
| Canonical contract | PASS: deployed source/schema match repository; `get_stats()` read on Studionet 61999 returns balanced zero accounting. |
| GenVM lint / validate / schema / typecheck | Passed in the latest prior CI run. Contract source is unchanged in this UI-only pass; exact updated commit must pass CI. |
| Direct Mode | PASS: `py -3.12 run_direct_windows.py`, 46 tests. |
| Studionet integration smoke | PASS: canonical read-only `get_stats()` integration test, 1 passed. |
| Release/static guards | PASS: Python compile, release, contract patterns, frontend surface (6 routes / 11 required actions), deploy-helper typecheck. |
| Frontend install | PASS: `npm ci`. |
| Frontend tests | PASS: 6 tests. |
| Frontend typecheck / Next production build | PASS: six application routes generated. |
| Local HTTP routes | PASS: `/`, `/agreements`, `/open`, `/account`, `/protocol`, `/agreements/1` all returned HTTP 200 with CARVEOUT branding. |
| Screenshot viewport inspection | NOT VERIFIED: Windows computer-use helper exits on ACL error; responsive breakpoints are implemented, but visual screenshots are not claimed. |
| Production frontend | Existing canonical URL: `https://carveout-sla.vercel.app`; current UI redeploy and production verification pending. |
| Full live SLA / economic lifecycle | NOT DEMONSTRATED: do not infer measurement, adjudication, settlement, credits, or withdrawal from deployment/read-only checks. |
| Exact UI commit CI | PENDING. |

See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for deployment details and evidence boundaries. No live claims are inferred from local tests.
