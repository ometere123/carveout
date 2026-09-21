const SERVICE = "CARVEOUT Controlled Demo API";

module.exports = function health(req, res) {
  const outage = process.env.CARVEOUT_DEMO_OUTAGE === "1";
  const checkedAt = new Date().toISOString();
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = outage ? 503 : 200;
  res.end(JSON.stringify({
    service: SERVICE,
    endpoint: "/health",
    state: outage ? "controlled_outage" : "operational",
    checked_at: checkedAt,
    incident_id: process.env.CARVEOUT_INCIDENT_ID || "controlled-outage",
    incident_started_at: process.env.CARVEOUT_INCIDENT_STARTED_AT || null,
    incident_ended_at: process.env.CARVEOUT_INCIDENT_ENDED_AT || null,
    maintenance_preannounced: false,
  }));
};
