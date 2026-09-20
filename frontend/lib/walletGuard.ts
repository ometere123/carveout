const CHAIN_ID = 61999;

/** Revalidate the injected wallet immediately before asking it to sign. */
export function assertWriteWallet(chainId: unknown, accounts: unknown, account: string): void {
  if (typeof chainId !== "string" || Number.parseInt(chainId, 16) !== CHAIN_ID) {
    throw new Error("Wallet network changed. Switch to GenLayer Studionet (61999) before signing.");
  }
  if (
    !Array.isArray(accounts) ||
    !accounts.some((candidate) => typeof candidate === "string" && candidate.toLowerCase() === account.toLowerCase())
  ) {
    throw new Error("The selected account is no longer connected. Reconnect the intended injected wallet account before signing.");
  }
}
