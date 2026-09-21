export const MIN_PROPOSAL_START_MINUTES = 15;

export function isValidProposalStartMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= MIN_PROPOSAL_START_MINUTES;
}

export function buildSlaWindow(startAfterMinutes: number, durationMinutes: number, nowSeconds: number) {
  return {
    start: nowSeconds + startAfterMinutes * 60,
    end: nowSeconds + (startAfterMinutes + durationMinutes) * 60,
  };
}
