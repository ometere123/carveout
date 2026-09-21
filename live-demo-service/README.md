# CARVEOUT controlled demo service

This isolated Vercel project exposes `/health` and `/incidents/controlled-outage` for public CARVEOUT evidence. It is not part of the production CARVEOUT app and has no user-facing outage control route.

The project owner controls state through production environment variables and deployments:

- `CARVEOUT_DEMO_OUTAGE=0` makes `/health` return HTTP 200; `1` returns HTTP 503.
- `CARVEOUT_INCIDENT_STARTED_AT` and `CARVEOUT_INCIDENT_ENDED_AT` are ISO-8601 UTC event times.
- `CARVEOUT_DEMO_HEALTH_URL` records the exact monitored endpoint on the public incident page.

Keep the Vercel production environment private to the operator. Publish only the read-only service and incident URLs. Do not record planned maintenance as a pre-event notice for this test; the record truthfully states that maintenance was not preannounced.

Set the outage toggle only by updating the Vercel Production environment and deploying a new version. After deployment is READY, verify the live HTTP status and timestamp the observed state transition. Preserve deployment activation time and Better Stack check/incident timestamps as evidence.
