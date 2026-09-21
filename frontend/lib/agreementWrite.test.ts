import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCreateAgreementCall, MAX_PROVIDER_BOND, MIN_PROVIDER_BOND, parseProviderBond } from "./agreementWrite.ts";

const validCallInput = {
  customer: "0x1234567890123456789012345678901234567890",
  service: "Production API",
  serviceUrl: "https://api.example.org",
  metric: "availability",
  targetBps: 9995,
  windowStart: 1_800_000_000,
  windowEnd: 1_800_003_600,
  exceptions: "[]",
  policy: "Use source evidence only.",
  sourcePolicy: "{}",
  challengeWindowSeconds: 600,
};

test("0.001 GEN encodes max_credit_atto and payable value as the same bigint", () => {
  const minBond = parseProviderBond("0.001");
  assert.equal(minBond, 1_000_000_000_000_000n);
  assert.equal(minBond, MIN_PROVIDER_BOND);
  const call = buildCreateAgreementCall({ ...validCallInput, maxCreditAtto: minBond });
  assert.equal(typeof call.args[5], "bigint");
  assert.equal(call.args[5], 1_000_000_000_000_000n);
  assert.equal(call.value, minBond);
});

test("provider bond rejects values below 0.001 GEN", () => {
  assert.throws(() => parseProviderBond("0.000999999999999999"), /between 0.001 and 50 GEN/);
});

test("provider bond preserves exact integer precision through 50 GEN", () => {
  assert.equal(parseProviderBond("50"), MAX_PROVIDER_BOND);
  assert.equal(parseProviderBond("49.999999999999999999"), 49_999_999_999_999_999_999n);
  assert.equal(typeof buildCreateAgreementCall({ ...validCallInput, maxCreditAtto: MAX_PROVIDER_BOND }).args[5], "bigint");
});
