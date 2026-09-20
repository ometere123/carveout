# CARVEOUT build status

This status reflects CARVEOUT main commit `e618163` and the 2026-09-20 verification pass.

| Gate | Verified result |
| --- | --- |
| GenLayer dependency resolution | Stable pins: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`, frontend `genlayer-js==1.1.8`. |
| Canonical contract | PASS: deployed source/schema match repository; `get_stats()` read on Studionet 61999 returns balanced zero accounting. |
| GenVM lint / validate / schema / typecheck | PASS in GitHub Actions run [35517271797](https://github.com/ometere123/carveout/actions/runs/35517271797) for main commit `e618163`. |
| Direct Mode | PASS: `py -3.12 run_direct_windows.py`, 46 tests. |
| Studionet integration smoke | PASS: canonical read-only `get_stats()` integration test, 1 passed. |
| Release/static guards | PASS: Python compile, release, contract patterns, frontend surface (6 routes / 11 required actions), deploy-helper typecheck. |
| Frontend install | PASS: `npm ci`. |
| Frontend tests | PASS: 6 tests. |
| Frontend typecheck / Next production build | PASS: six application routes generated. |
| Local HTTP routes | PASS: `/`, `/agreements`, `/open`, `/account`, `/protocol`, `/agreements/1` all returned HTTP 200 with CARVEOUT branding. |
| Screenshot viewport inspection | PASS locally at 100% zoom: captured and reviewed the home page and agreement form at 1366×768; checked home layout at 1366, 1440, 1536, 1600 and 1920px, plus 820px tablet and 390px mobile widths with no horizontal overflow. Axe WCAG 2.1 AA scan: zero violations across all six routes. |
| Production frontend | READY: `https://frontend-neon-six-65.vercel.app`; deployment `dpl_EULyvUQAzYyGSD3qMnNA7bGyypcE`; all six routes return HTTP 200. |
| Full live SLA / economic lifecycle | NOT DEMONSTRATED: do not infer measurement, adjudication, settlement, credits, or withdrawal from deployment/read-only checks. |
| Exact main commit CI | PASS: [run 35517271797](https://github.com/ometere123/carveout/actions/runs/35517271797). |

See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for deployment details and evidence boundaries. No live claims are inferred from local tests.
