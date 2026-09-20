# CARVEOUT build status

| Gate | Verified result |
| --- | --- |
| GenLayer dependency resolution | PASS: `genlayer-test==0.29.2`, `genlayer-py==0.16.3`; frontend uses stable `genlayer-js@1.2.0` |
| GenVM lint | PASS: `ok=true`, 3 checks |
| Direct Mode | PASS: 46 tests |
| Release/static guards | PASS: release, contract patterns, frontend surface |
| Frontend install | PASS |
| Frontend typecheck | PASS |
| Next production build | PASS: six app routes generated |
| Studionet integration smoke | SKIPPED: no deployed address |
| Required RPC accessibility | BLOCKED: prior preflight returned HTTP 403; no transaction submitted |
| Deployment/source-schema/live economic demo | NOT RUN |
| Public frontend / hosted address | NOT CONFIGURED |
| Source commit / CI / clean status | PENDING: release clone has Git metadata; validated changes are not yet committed or pushed |

See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for exact local results and live-release gates that remain unproven. No live claims are inferred from local tests.
