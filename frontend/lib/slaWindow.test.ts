import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildSlaWindow, isValidProposalStartMinutes } from "./slaWindow.ts";

test("proposal creation rejects ten and fourteen minutes, and accepts fifteen", () => {
  assert.equal(isValidProposalStartMinutes(10), false);
  assert.equal(isValidProposalStartMinutes(14), false);
  assert.equal(isValidProposalStartMinutes(15), true);
});

test("SLA window uses the actual selected interval without hidden padding", () => {
  const now = 1_800_000_000;
  assert.deepEqual(buildSlaWindow(15, 60, now), {
    start: now + 15 * 60,
    end: now + 75 * 60,
  });
});

test("contract formation boundaries remain ten minutes and five minutes", () => {
  const contract = readFileSync(new URL("../../contracts/carveout.py", import.meta.url), "utf8");
  assert.match(contract, /FORMATION_LEAD_SECONDS\s*=\s*300\b/);
  assert.match(contract, /MIN_PROPOSAL_SECONDS\s*=\s*600\b/);
});
