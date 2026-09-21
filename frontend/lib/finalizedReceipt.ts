import { finalizedExecutionFailure, finalizedExecutionState, type FinalizedTransactionLike } from "./executionFailure";
import { getTransactionReceipt, type GenLayerReceipt } from "./genlayerRpc";

type ReceiptClient = {
  waitForTransactionReceipt: (request: Record<string, unknown>) => Promise<FinalizedTransactionLike>;
};

export type FinalizedWriteResult = {
  finalized: true;
  execution: "success" | "unknown";
  receipt?: FinalizedTransactionLike;
  receiptLookupError?: string;
};

export async function waitForFinalizedExecution(
  client: ReceiptClient,
  hash: `0x${string}`,
  readReceipt: (txId: string) => Promise<GenLayerReceipt> = getTransactionReceipt,
  onFinalized?: () => void,
): Promise<FinalizedWriteResult> {
  const sdkReceipt = await client.waitForTransactionReceipt({
    hash,
    status: "FINALIZED",
    retries: 240,
    interval: 15000,
    fullTransaction: true,
  });
  onFinalized?.();

  let authoritativeReceipt: FinalizedTransactionLike = sdkReceipt;
  let receiptLookupError: string | undefined;
  try {
    const rpcReceipt = await readReceipt(hash) as FinalizedTransactionLike;
    authoritativeReceipt = {
      ...sdkReceipt,
      ...rpcReceipt,
      consensus_data: {
        ...sdkReceipt.consensus_data,
        ...rpcReceipt.consensus_data,
        leader_receipt: rpcReceipt.consensus_data?.leader_receipt ?? sdkReceipt.consensus_data?.leader_receipt,
      },
    };
  } catch (error: any) {
    receiptLookupError = error?.message || String(error);
  }

  const state = finalizedExecutionState(authoritativeReceipt);
  if (state === "failure") throw new Error(finalizedExecutionFailure(authoritativeReceipt));
  if (state === "success") return { finalized: true, execution: "success", receipt: authoritativeReceipt };

  // Finality is established by the SDK poll, but missing execution metadata is
  // not a rollback. The caller must verify the action's canonical state change.
  return { finalized: true, execution: "unknown", receipt: authoritativeReceipt, receiptLookupError };
}
