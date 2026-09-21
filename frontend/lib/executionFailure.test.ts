import assert from "node:assert/strict";
import { test } from "node:test";
import { finalizedExecutionFailure, finalizedExecutionState } from "./executionFailure.ts";

test("Studio finalized SUCCESS leader receipt passes", () => {
  const receipt = { statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", error: null, result: "cv-a-1" }] } };
  assert.equal(finalizedExecutionState(receipt), "success");
});

test("Studio finalized ERROR leader receipt fails with the actual GenVM error", () => {
  const receipt = { statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "ERROR", error: "[EXPECTED] max credit is too small" }] } };
  assert.equal(finalizedExecutionState(receipt), "failure");
  assert.equal(finalizedExecutionFailure(receipt), "Transaction rolled back: [EXPECTED] max credit is too small");
});

test("top-level SDK FINISHED_WITH_RETURN remains a successful receipt shape", () => {
  assert.equal(finalizedExecutionState({ statusName: "FINALIZED", txExecutionResultName: "FINISHED_WITH_RETURN" }), "success");
});

test("single Studio leader receipt object is normalized safely", () => {
  assert.equal(finalizedExecutionState({ statusName: "FINALIZED", consensus_data: { leader_receipt: { execution_result: "SUCCESS" } } }), "success");
});

test("finalized GenLayer SDK leader rollback result surfaces its decoded payload", () => {
  const receipt = {
    statusName: "FINALIZED",
    txExecutionResultName: "FINISHED_WITH_ERROR",
    consensus_data: {
      leader_receipt: [{
        error: null,
        result: { raw: "ignored-by-ui", status: "rollback", payload: "[EXPECTED] max credit is too small" },
      }],
    },
  };
  assert.equal(finalizedExecutionFailure(receipt), "Transaction rolled back: [EXPECTED] max credit is too small");
});

test("finalized rollback falls back to the typed leader error or a useful generic message", () => {
  assert.equal(finalizedExecutionFailure({
    txExecutionResultName: "FINISHED_WITH_ERROR",
    consensus_data: { leader_receipt: [{ error: "[EXPECTED] rejected", result: "" }] },
  }), "Transaction rolled back: [EXPECTED] rejected");
  assert.equal(finalizedExecutionFailure({ statusName: "FINALIZED" }), "Transaction finalized without successful execution (FINALIZED / unknown execution result).");
});
