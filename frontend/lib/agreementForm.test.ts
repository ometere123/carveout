import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyAgreementDraft, sampleAgreementDraft } from "./agreementForm";

test("new agreement form is blank until the sample action is chosen", () => {
  const draft = emptyAgreementDraft();
  assert.deepEqual(draft, {
    customer: "", service: "", url: "", metric: "", target: "", credit: "",
    exceptions: "", policy: "", sourcePolicy: "", startAfterHours: "",
    durationDays: "", challenge: "",
  });
});

test("sample agreement is opt-in, visibly illustrative, and has structured source groups", () => {
  const sample = sampleAgreementDraft();
  assert.match(sample.service, /illustrative/i);
  assert.match(sample.url, /^https:\/\//);
  const sourcePolicy = JSON.parse(sample.sourcePolicy);
  assert.equal(sourcePolicy.measurement.length, 2);
  assert.ok(sourcePolicy.measurement.some((source: { kind: string }) => source.kind === "INDEPENDENT_PROBE"));
  assert.equal(sourcePolicy.exception.length, 1);
  assert.equal(sourcePolicy.challenge.length, 1);
});
