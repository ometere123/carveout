import assert from "node:assert/strict";
import { test } from "node:test";
import { formatGenAmount, parseGenAmount } from "./amount.ts";
import { assertWriteWallet } from "./walletGuard.ts";

test("GEN parser keeps decimal values exact", () => {
  assert.equal(parseGenAmount("1"), 10n ** 18n);
  assert.equal(parseGenAmount("0.001"), 10n ** 15n);
  assert.equal(parseGenAmount("1.000000000000000001"), 10n ** 18n + 1n);
});

test("GEN formatter avoids floating-point conversion", () => {
  assert.equal(formatGenAmount(1_234_567_890_123_456_789n), "1.234567");
  assert.equal(formatGenAmount(10n ** 18n), "1");
});

test("GEN parser rejects malformed or over-precise values", () => {
  for (const value of ["", "-1", "1e-3", "0.0000000000000000001", "NaN"]) {
    assert.throws(() => parseGenAmount(value));
  }
});

test("injected write guard enforces Studionet and the current account", () => {
  const wallet = "0x1234567890123456789012345678901234567890";
  assert.doesNotThrow(() => assertWriteWallet("0xf22f", [wallet], wallet));
  assert.throws(() => assertWriteWallet("0xf21d", [wallet], wallet), /Studionet \(61999\)/);
  assert.throws(() => assertWriteWallet("0xf22f", ["0x2234567890123456789012345678901234567890"], wallet), /account changed/);
  assert.throws(() => assertWriteWallet("0xf22f", [], wallet), /account changed/);
  assert.throws(() => assertWriteWallet("0xf22f", [wallet], "undefined"), /address is missing or invalid/);
  assert.throws(() => assertWriteWallet("0xf22fgarbage", [wallet], wallet), /Studionet \(61999\)/);
});
