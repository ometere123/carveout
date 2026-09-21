type LeaderResult = string | {
  status?: unknown;
  payload?: unknown;
};

type LeaderReceiptLike = {
  execution_result?: unknown;
  error?: unknown;
  result?: LeaderResult;
};

export type FinalizedTransactionLike = {
  statusName?: unknown;
  error?: unknown;
  txExecutionError?: unknown;
  txExecutionResult?: unknown;
  txExecutionResultName?: unknown;
  consensus_data?: {
    leader_receipt?: LeaderReceiptLike[] | LeaderReceiptLike;
  };
};

export type ExecutionState = "success" | "failure" | "unknown";

function normalizeResultName(value: unknown): ExecutionState {
  if (typeof value !== "string") return "unknown";
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "finishedwithreturn") return "success";
  if (normalized === "finishedwitherror") return "failure";
  return "unknown";
}

function leaders(receipt: FinalizedTransactionLike): LeaderReceiptLike[] {
  const value = receipt.consensus_data?.leader_receipt;
  if (Array.isArray(value)) return value;
  return value && typeof value === "object" ? [value] : [];
}

export function finalizedExecutionState(receipt: FinalizedTransactionLike): ExecutionState {
  if (receipt.txExecutionResult === 1 || receipt.txExecutionResult === "1") return "success";
  if (receipt.txExecutionResult === 2 || receipt.txExecutionResult === "2") return "failure";
  const byName = normalizeResultName(receipt.txExecutionResultName);
  if (byName !== "unknown") return byName;

  const leaderReceipts = leaders(receipt);
  if (leaderReceipts.length !== 1) return "unknown";
  if (leaderReceipts[0].execution_result === "SUCCESS") return "success";
  if (leaderReceipts[0].execution_result === "ERROR") return "failure";
  return "unknown";
}

function leaderRollbackReason(receipt: FinalizedTransactionLike): string | undefined {
  for (const value of [receipt.error, receipt.txExecutionError]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  for (const leader of leaders(receipt)) {
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
  const execution = typeof receipt.txExecutionResultName === "string" ? receipt.txExecutionResultName : typeof receipt.txExecutionResult === "number" ? String(receipt.txExecutionResult) : "unknown execution result";
  const reason = leaderRollbackReason(receipt);
  if (reason || finalizedExecutionState(receipt) === "failure" || leaders(receipt).some((leader) => leader.execution_result === "ERROR")) {
    return `Transaction rolled back: ${reason ?? "the finalized execution failed and the network did not provide a rollback reason."}`;
  }
  const status = typeof receipt.statusName === "string" ? receipt.statusName : "unknown status";
  return `Transaction finalized without successful execution (${status} / ${execution}).`;
}
