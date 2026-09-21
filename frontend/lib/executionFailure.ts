type LeaderResult = string | {
  status?: unknown;
  payload?: unknown;
};

type LeaderReceiptLike = {
  error?: unknown;
  result?: LeaderResult;
};

export type FinalizedTransactionLike = {
  statusName?: unknown;
  txExecutionResult?: unknown;
  txExecutionResultName?: unknown;
  consensus_data?: {
    leader_receipt?: LeaderReceiptLike[];
  };
};

function leaderRollbackReason(receipt: FinalizedTransactionLike): string | undefined {
  for (const leader of receipt.consensus_data?.leader_receipt ?? []) {
    if (typeof leader.error === "string" && leader.error.trim()) return leader.error.trim();
    if (leader.result && typeof leader.result === "object") {
      const status = leader.result.status;
      const payload = leader.result.payload;
      if ((status === "rollback" || status === "contract_error" || status === "error") && typeof payload === "string" && payload.trim()) {
        return payload.trim();
      }
    }
  }
  return undefined;
}

export function finalizedExecutionFailure(receipt: FinalizedTransactionLike): string {
  const execution = typeof receipt.txExecutionResultName === "string"
    ? receipt.txExecutionResultName
    : typeof receipt.txExecutionResult === "number"
      ? String(receipt.txExecutionResult)
      : "unknown execution result";
  const reason = leaderRollbackReason(receipt);
  if (reason || execution === "FINISHED_WITH_ERROR") {
    return `Transaction rolled back: ${reason ?? "the finalized execution failed and the network did not provide a rollback reason."}`;
  }
  const status = typeof receipt.statusName === "string" ? receipt.statusName : "unknown status";
  return `Transaction finalized without successful execution (${status} / ${execution}).`;
}
