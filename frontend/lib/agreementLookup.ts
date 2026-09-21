/** True only for the SDK's execution error used when get_agreement has no record. */
export function isMissingAgreementRead(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /Missing or invalid parameters\.[\s\S]*execution failed/i.test(message);
}
