const GEN = 10n ** 18n;

/** Parse GEN without passing through a floating-point number. */
export function parseGenAmount(value: string): bigint {
  const input = value.trim();
  const match = /^(\d+)(?:\.(\d{1,18}))?$/.exec(input);
  if (!match) {
    throw new Error("Enter a non-negative GEN amount with at most 18 decimal places.");
  }

  const whole = BigInt(match[1]);
  const fraction = BigInt((match[2] ?? "").padEnd(18, "0") || "0");
  return whole * GEN + fraction;
}

export function formatGenAmount(value: bigint, fractionDigits = 6): string {
  if (value < 0n) throw new Error("GEN amount cannot be negative.");
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0 || fractionDigits > 18) {
    throw new Error("Fraction digits must be between 0 and 18.");
  }

  const whole = value / GEN;
  const fraction = (value % GEN).toString().padStart(18, "0");
  if (fractionDigits === 0) return whole.toString();
  const shown = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return shown ? whole.toString() + "." + shown : whole.toString();
}

