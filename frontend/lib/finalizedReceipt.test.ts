import assert from "node:assert/strict";
import { test } from "node:test";
import { waitForFinalizedExecution } from "./finalizedReceipt.ts";

const hash = `0x${"1".repeat(64)}` as `0x${string}`;

test("waits for a full Studio receipt and accepts its successful leader result", async () => {
  let request: Record<string, unknown> | undefined;
  const receipt = { statusName: "FINALIZED", consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", error: null, result: "cv-a-1" }] } };
  const result = await waitForFinalizedExecution({
    waitForTransactionReceipt: async (args) => { request = args; return receipt; },
  }, hash);
  assert.equal(result, receipt);
  assert.deepEqual(request, { hash, status: "FINALIZED", retries: 240, interval: 15000, fullTransaction: true });
});

test("Studio leader execution errors surface their actual GenVM message", async () => {
  await assert.rejects(
    waitForFinalizedExecution({
      waitForTransactionReceipt: async () => ({
        statusName: "FINALIZED",
        consensus_data: { leader_receipt: [{ execution_result: "ERROR", error: "[EXPECTED] max credit is too small" }] },
      }),
    }, hash),
    /Transaction rolled back: \[EXPECTED\] max credit is too small/,
  );
});

test("ambiguous finalized receipt fetches full transaction and trace, then fails closed", async () => {
  let transactionFetched = false;
  let traceFetched = false;
  await assert.rejects(
    waitForFinalizedExecution({
      waitForTransactionReceipt: async () => ({ statusName: "FINALIZED" }),
      getTransaction: async () => { transactionFetched = true; return { statusName: "FINALIZED" }; },
      debugTraceTransaction: async () => { traceFetched = true; return { stdout: "" }; },
    }, hash),
    /execution could not be verified.*execution trace fetched/,
  );
  assert.equal(transactionFetched, true);
  assert.equal(traceFetched, true);
});

test("normal top-level FINISHED_WITH_RETURN receipt succeeds", async () => {
  const receipt = { statusName: "FINALIZED", txExecutionResultName: "FINISHED_WITH_RETURN" };
  const result = await waitForFinalizedExecution({ waitForTransactionReceipt: async () => receipt }, hash);
  assert.equal(result, receipt);
});
