import { finalizedExecutionFailure, finalizedExecutionState, type FinalizedTransactionLike } from "./executionFailure";

type ReceiptClient = {
  waitForTransactionReceipt: (request: Record<string, unknown>) => Promise<FinalizedTransactionLike>;
  getTransaction?: (request: { hash: `0x${string}` }) => Promise<FinalizedTransactionLike>;
  debugTraceTransaction?: (request: { hash: `0x${string}` }) => Promise<unknown>;
};

export async function waitForFinalizedExecution(client: ReceiptClient, hash: `0x${string}`) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: "FINALIZED",
    retries: 240,
    interval: 15000,
    fullTransaction: true,
  });
  const state = finalizedExecutionState(receipt);
  if (state === "success") return receipt;
  if (state === "failure") throw new Error(finalizedExecutionFailure(receipt));

  let diagnostic = "full finalized receipt contained no unambiguous execution result";
  if (client.getTransaction) {
    try {
      const transaction = await client.getTransaction({ hash });
      const transactionState = finalizedExecutionState(transaction);
      if (transactionState === "success") return transaction;
      if (transactionState === "failure") throw new Error(finalizedExecutionFailure(transaction));
      diagnostic += "; full transaction lookup was also ambiguous";
    } catch (error: any) {
      if (error?.message?.startsWith("Transaction rolled back:")) throw error;
      diagnostic += `; full transaction lookup failed: ${error?.message || String(error)}`;
    }
  }
  if (client.debugTraceTransaction) {
    try {
      const trace = await client.debugTraceTransaction({ hash });
      const traceText = JSON.stringify(trace);
      diagnostic += `; execution trace fetched${traceText ? `: ${traceText.slice(0, 500)}` : ""}`;
    } catch (error: any) {
      diagnostic += `; execution trace lookup failed: ${error?.message || String(error)}`;
    }
  }
  throw new Error(`CARVEOUT: finalized transaction execution could not be verified (${diagnostic}). Transaction: ${hash}`);
}
