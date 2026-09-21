import assert from "node:assert/strict";
import test from "node:test";
import { canonicalUtcTimestamp, formatWatTimestamp } from "./time";

test("formats canonical UTC timestamps as West Africa Time without changing the value", () => {
  const utc = "2026-09-21T03:45:50.000Z";
  assert.equal(formatWatTimestamp(utc), "21 Sep 2026, 04:45:50 WAT");
  assert.equal(formatWatTimestamp("not-a-date"), "Invalid timestamp");
  assert.equal(canonicalUtcTimestamp(utc), utc);
});

test("formats Unix seconds in Africa/Lagos while preserving the contract integer", () => {
  const unixSeconds = 1789962350;
  assert.equal(formatWatTimestamp(unixSeconds), "21 Sep 2026, 04:45:50 WAT");
  assert.equal(String(unixSeconds), "1789962350");
});

test("renders zero and unset contract timestamps as unset, not the Unix epoch", () => {
  for (const value of [0, "0", null, undefined, ""]) {
    assert.equal(formatWatTimestamp(value), "—");
    assert.doesNotMatch(formatWatTimestamp(value), /1970/);
  }
  const unixSeconds = 1789962350;
  assert.equal(formatWatTimestamp(unixSeconds), "21 Sep 2026, 04:45:50 WAT");
  assert.equal(String(unixSeconds), "1789962350");
});
