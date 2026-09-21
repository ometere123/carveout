import test from "node:test";
import assert from "node:assert/strict";
import { isMissingAgreementRead } from "./agreementLookup";

test("recognizes the GenLayer/Viem missing-record response", () => {
  assert.equal(isMissingAgreementRead(new Error("Missing or invalid parameters. Double check you have provided the correct parameters. Details: execution failed Version: viem@2.56.8")), true);
});

test("does not disguise unrelated RPC failures as a missing agreement", () => {
  assert.equal(isMissingAgreementRead(new Error("Failed to fetch")), false);
  assert.equal(isMissingAgreementRead(new Error("Invalid chain ID")), false);
  assert.equal(isMissingAgreementRead(null), false);
});
