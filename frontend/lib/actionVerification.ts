type Snapshot = Record<string, any> | null | undefined;

export const NO_RESUBMIT_UNTIL_VERIFIED = "Do not resubmit until the transaction is verified.";

export function isMatchingProposedAgreement(record: Snapshot, expected: { provider: string; customer: string; service: string; bondAtto: string }): boolean {
  return Boolean(record && record.status === "PROPOSED" && String(record.provider).toLowerCase() === expected.provider.toLowerCase() && String(record.customer).toLowerCase() === expected.customer.toLowerCase() && record.service_name === expected.service && String(record.bond_atto) === expected.bondAtto);
}

export function isExpectedActionState(options: {
  action: string;
  beforeAgreement?: Snapshot;
  beforeIncident?: Snapshot;
  agreement?: Snapshot;
  incident?: Snapshot;
  args?: unknown[];
  creditBefore?: string;
  creditAfter?: string;
  statsBefore?: Snapshot;
  statsAfter?: Snapshot;
  creditsBefore?: Record<string, string>;
  creditsAfter?: Record<string, string>;
}): boolean {
  const { action, beforeAgreement: ba, beforeIncident: bi, agreement: a, incident: i, args = [], creditBefore, creditAfter, statsBefore, statsAfter, creditsBefore, creditsAfter } = options;
  switch (action) {
    case "accept_agreement": return ba?.status === "PROPOSED" && a?.status === "ACTIVE" && Boolean(a.accepted_at && a.accepted_at !== "0");
    case "expire_proposal":
    case "expire_agreement": return ba?.status !== "EXPIRED" && a?.status === "EXPIRED" && creditIncreasedByBond(ba?.bond_atto, creditBefore, creditAfter);
    case "open_incident": return !ba?.incident_id && Boolean(a?.incident_id && i && i.id === a.incident_id && i.agreement_id === ba?.id && String(i.claimed_actual_bps) === String(args[1]) && String(i.observed_from) === String(args[2]) && String(i.observed_to) === String(args[3]));
    case "verify_measurement": return Boolean(i?.measurement_basis && (i.status !== bi?.status || i.measurement_basis !== bi?.measurement_basis || String(i.actual_bps) !== String(bi?.actual_bps)));
    case "dismiss_unproven_measurement": return bi?.status === "MEASUREMENT_INCONCLUSIVE" && i?.status === "MEASUREMENT_REJECTED";
    case "claim_exception": return i?.status === "EXCEPTION_CLAIMED" && i.exception_code === String(args[1]).toUpperCase() && Array.isArray(i.exception_evidence) && i.exception_evidence.length > 0;
    case "adjudicate_exception": return i?.status !== bi?.status && Boolean(i?.exception_result && i?.basis);
    case "challenge_exception": {
      const challenge = parseChallenge(i?.challenge);
      return Boolean(challenge && challenge.status === "OPEN" && challenge.text === args[1] && challenge.url === args[2] && BigInt(String(challenge.bond_atto || 0)) > 0n);
    }
    case "resolve_challenge":
    case "expire_challenge": {
      const previous = parseChallenge(bi?.challenge), current = parseChallenge(i?.challenge);
      return Boolean(previous?.status === "OPEN" && current && current.status !== "OPEN" && current.status !== previous.status);
    }
    case "finalize_incident":
    case "finalize_default_breach": {
      if (i?.status !== "FINAL" || a?.status !== "CLOSED" || !i.finalized_at || i.payout_atto === undefined || statsAfter?.accounting_balanced !== true || !ba?.customer || !ba?.provider || !creditsBefore || !creditsAfter) return false;
      const payout = BigInt(String(i.payout_atto));
      const bond = BigInt(String(ba.bond_atto));
      const customer = String(ba.customer).toLowerCase(), provider = String(ba.provider).toLowerCase();
      return BigInt(creditsAfter[customer]) - BigInt(creditsBefore[customer]) === payout && BigInt(creditsAfter[provider]) - BigInt(creditsBefore[provider]) === bond - payout;
    }
    case "withdraw_credit": {
      if (creditBefore === undefined || creditAfter === undefined || !statsBefore || !statsAfter) return false;
      const amount = BigInt(creditBefore) - BigInt(creditAfter);
      return amount > 0n && BigInt(creditAfter) === 0n && BigInt(String(statsAfter.withdrawn)) - BigInt(String(statsBefore.withdrawn)) === amount && BigInt(String(statsBefore.claimable)) - BigInt(String(statsAfter.claimable)) === amount && statsAfter.accounting_balanced === true;
    }
    default: return false;
  }
}

function creditIncreasedByBond(bond?: string, before?: string, after?: string): boolean {
  return bond !== undefined && before !== undefined && after !== undefined && BigInt(after) - BigInt(before) === BigInt(bond);
}

function parseChallenge(value: unknown): Record<string, any> | null {
  if (typeof value !== "string" || !value) return null;
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed : null; } catch { return null; }
}

export type WriteVerification = "state-verified" | "verification-incomplete" | "failed";

export function resolveWriteVerification(execution: "success" | "failure" | "unknown", expectedStatePresent: boolean): WriteVerification {
  if (execution === "failure") return "failed";
  return expectedStatePresent ? "state-verified" : "verification-incomplete";
}
