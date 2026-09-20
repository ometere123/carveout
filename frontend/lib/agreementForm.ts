export type AgreementFormDraft = {
  customer: string;
  service: string;
  url: string;
  metric: string;
  target: string;
  credit: string;
  exceptions: string;
  policy: string;
  sourcePolicy: string;
  startAfterHours: string;
  durationDays: string;
  challenge: string;
};

export function emptyAgreementDraft(): AgreementFormDraft {
  return {
    customer: "", service: "", url: "", metric: "", target: "", credit: "",
    exceptions: "", policy: "", sourcePolicy: "", startAfterHours: "",
    durationDays: "", challenge: "",
  };
}

export function sampleAgreementDraft(): AgreementFormDraft {
  return {
    customer: "0x0000000000000000000000000000000000000001",
    service: "GitHub API (illustrative)",
    url: "https://api.github.com",
    metric: "Monthly API availability",
    target: "9995",
    credit: "0.001",
    exceptions: JSON.stringify([{
      code: "MAINT",
      title: "Scheduled maintenance",
      rule: "Only a notice published at least 48 hours before the window and matching its exact interval may qualify.",
      proof: "Timestamped official notice and incident timeline",
    }], null, 2),
    policy: "Use only evidence from the origins frozen below. A status notice alone does not establish an exception; evidence must match the service and incident window. Unavailable or inconclusive evidence does not excuse the miss.",
    sourcePolicy: JSON.stringify({
      measurement: [
        { kind: "PROVIDER_STATUS", host: "status.github.com", path_prefix: "/api/v2/incidents" },
        { kind: "INDEPENDENT_PROBE", host: "www.githubstatus.com", path_prefix: "/api/v2" },
      ],
      exception: [{ kind: "PUBLIC_NOTICE", host: "github.blog", path_prefix: "/" }],
      challenge: [{ kind: "COUNTER_EVIDENCE", host: "docs.github.com", path_prefix: "/" }],
    }, null, 2),
    startAfterHours: "24",
    durationDays: "30",
    challenge: "1800",
  };
}
