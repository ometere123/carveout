const SERVICE = "CARVEOUT Controlled Demo API";

module.exports = function controlledOutageIncident(req, res) {
  const outage = process.env.CARVEOUT_DEMO_OUTAGE === "1";
  const startedAt = process.env.CARVEOUT_INCIDENT_STARTED_AT || "Not recorded yet";
  const endedAt = process.env.CARVEOUT_INCIDENT_ENDED_AT || (outage ? "Ongoing" : "Not recorded yet");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.statusCode = 200;
  res.end([
    `${SERVICE} — controlled outage incident record`,
    "Incident ID: controlled-outage",
    `Service identity: ${SERVICE} at ${process.env.CARVEOUT_DEMO_HEALTH_URL || "the public /health endpoint"}`,
    `Incident state: ${outage ? "The controlled outage is active; /health returns HTTP 503." : "The controlled outage is not active; /health returns HTTP 200."}`,
    `Incident start (UTC): ${startedAt}`,
    `Incident end (UTC): ${endedAt}`,
    "Observed impact: /health returned HTTP 503 during the controlled outage and HTTP 200 outside it.",
    "Maintenance pre-announced: no.",
    "This record is generated from the service deployment's recorded outage state and timestamps.",
  ].join("\n"));
};
