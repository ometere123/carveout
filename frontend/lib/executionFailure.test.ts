import assert from "node:assert/strict";
import { test } from "node:test";
import { finalizedExecutionFailure } from "./executionFailure.ts";

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
