import assert from "node:assert/strict";
import { test } from "node:test";
import { waitForFinalizedExecution } from "./finalizedReceipt.ts";

const hash = `0x${"1".repeat(64)}` as `0x${string}`;

test("waits for a full Studio receipt and accepts its successful leader result", async () => {
  let request: Record<string, unknown> | undefined;
  const receipt = { statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", error: null, result: "cv-a-1" }] } };
  const result = await waitForFinalizedExecution({
    waitForTransactionReceipt: async (args) => { request = args; return receipt; },
  }, hash, async () => ({ txExecutionResult: 1, txExecutionResultName: "FinishedWithReturn", statusName: "Finalized" }));
  assert.equal(result.execution, "success");
  assert.deepEqual(request, { hash, status: "FINALIZED", retries: 240, interval: 15000, fullTransaction: true });
});

test("Studio leader execution errors surface their actual GenVM message", async () => {
  await assert.rejects(
    waitForFinalizedExecution({
      waitForTransactionReceipt: async () => ({
        statusName: "FINALIZED",
        consensus_data: { leader_receipt: [{ execution_result: "ERROR", error: "[EXPECTED] max credit is too small" }] },
      }),
    }, hash, async () => { throw new Error("Method not found"); }),
    /Transaction rolled back: \[EXPECTED\] max credit is too small/,
  );
});

test("ambiguous finalized receipt returns unknown for canonical state verification", async () => {
  let receiptQuery = false;
  const result = await waitForFinalizedExecution({
    waitForTransactionReceipt: async () => ({ statusName: "FINALIZED" }),
  }, hash, async () => { receiptQuery = true; throw new Error("Method not found"); });
  assert.equal(receiptQuery, true);
  assert.equal(result.finalized, true);
  assert.equal(result.execution, "unknown");
  assert.equal(result.receiptLookupError, "Method not found");
});

test("normal top-level FINISHED_WITH_RETURN receipt succeeds", async () => {
  const receipt = { statusName: "FINALIZED", txExecutionResultName: "FINISHED_WITH_RETURN" };
  const result = await waitForFinalizedExecution({ waitForTransactionReceipt: async () => ({ statusName: "FINALIZED" }) }, hash, async () => receipt);
  assert.equal(result.execution, "success");
});

test("legacy Studio SUCCESS leader receipt remains compatible when production receipt RPC is unavailable", async () => {
  const result = await waitForFinalizedExecution({
    waitForTransactionReceipt: async () => ({ statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", result: "cv-a-2" }] } }),
  }, hash, async () => { throw new Error("Method not found"); });
  assert.equal(result.execution, "success");
});

test("an incomplete documented receipt keeps an explicit legacy leader result", async () => {
  const result = await waitForFinalizedExecution({
    waitForTransactionReceipt: async () => ({ statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", result: "cv-a-2" }] } }),
  }, hash, async () => ({ statusName: "Finalized" }));
  assert.equal(result.execution, "success");
});

test("finalized explicit rollback fails before any canonical-state success is accepted", async () => {
  await assert.rejects(waitForFinalizedExecution({
    waitForTransactionReceipt: async () => ({ statusName: "FINALIZED" }),
  }, hash, async () => ({ statusName: "Finalized", txExecutionResult: 2, txExecutionResultName: "FinishedWithError", error: "[EXPECTED] rejected" })), /Transaction rolled back: \[EXPECTED\] rejected/);
});
