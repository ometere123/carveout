import { parseGenAmount } from "./amount";

export const MIN_PROVIDER_BOND = 10n ** 15n;
export const MAX_PROVIDER_BOND = 50n * 10n ** 18n;

export function parseProviderBond(value: string): bigint {
  const bond = parseGenAmount(value);
  if (bond < MIN_PROVIDER_BOND || bond > MAX_PROVIDER_BOND) {
    throw new Error("Provider bond and maximum credit must be between 0.001 and 50 GEN.");
  }
  return bond;
}

export type CreateAgreementCall = {
  customer: string;
  service: string;
  serviceUrl: string;
  metric: string;
  targetBps: number;
  maxCreditAtto: bigint;
  windowStart: number;
  windowEnd: number;
  exceptions: string;
  policy: string;
  sourcePolicy: string;
  challengeWindowSeconds: number;
};

export function buildCreateAgreementCall(input: CreateAgreementCall) {
  return {
    args: [
      input.customer,
      input.service,
      input.serviceUrl,
      input.metric,
      input.targetBps,
      input.maxCreditAtto,
      input.windowStart,
      input.windowEnd,
      input.exceptions,
      input.policy,
      input.sourcePolicy,
      input.challengeWindowSeconds,
    ],
    value: input.maxCreditAtto,
  };
}
