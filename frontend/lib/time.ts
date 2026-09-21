export const USER_TIME_ZONE = "Africa/Lagos";

export function formatWatTimestamp(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = typeof value === "number" || /^-?\d+$/.test(String(value));
  const date = new Date(numeric ? Number(value) * 1000 : String(value));
  if (!Number.isFinite(date.getTime())) return "Invalid timestamp";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: USER_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const month = part("month").replace(/^Sept$/, "Sep");
  return `${part("day")} ${month} ${part("year")}, ${part("hour")}:${part("minute")}:${part("second")} WAT`;
}

export function canonicalUtcTimestamp(value: string | number): string {
  const numeric = typeof value === "number" || /^-?\d+$/.test(String(value));
  const date = new Date(numeric ? Number(value) * 1000 : String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : "Invalid timestamp";
}
