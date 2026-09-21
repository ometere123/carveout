import assert from "node:assert/strict";
import { test } from "node:test";
import { isExpectedActionState, isMatchingProposedAgreement, NO_RESUBMIT_UNTIL_VERIFIED, resolveWriteVerification } from "./actionVerification.ts";

test("unknown execution plus matching canonical proposal state is state-verified", () => {
  const stored = { id: "cv-a-2", status: "PROPOSED", provider: "0x1111111111111111111111111111111111111111", customer: "0x2222222222222222222222222222222222222222", service_name: "Canonical service", bond_atto: "1000000000000000" };
  const verified = isMatchingProposedAgreement(stored, { provider: stored.provider, customer: stored.customer, service: stored.service_name, bondAtto: stored.bond_atto });
  assert.equal(resolveWriteVerification("unknown", verified), "state-verified");
});

test("unknown execution without matching canonical state remains incomplete", () => {
  const verified = isExpectedActionState({ action: "accept_agreement", beforeAgreement: { status: "PROPOSED" }, agreement: { status: "PROPOSED" } });
  assert.equal(resolveWriteVerification("unknown", verified), "verification-incomplete");
});

test("FINALIZED rollback stays failed even if an expected-looking state is present", () => {
  assert.equal(resolveWriteVerification("failure", true), "failed");
});

test("withdrawal verification requires claimable decrease and withdrawn increase", () => {
  const verified = isExpectedActionState({
    action: "withdraw_credit", creditBefore: "100", creditAfter: "0",
    statsBefore: { claimable: "100", withdrawn: "50" },
    statsAfter: { claimable: "0", withdrawn: "150", accounting_balanced: true },
  });
  assert.equal(verified, true);
});

test("ambiguous value-bearing writes have no resubmission path or success inference", () => {
  assert.equal(resolveWriteVerification("unknown", false), "verification-incomplete");
  assert.match(NO_RESUBMIT_UNTIL_VERIFIED, /Do not resubmit until the transaction is verified/);
});
