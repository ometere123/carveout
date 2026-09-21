export const USER_TIME_ZONE = "Africa/Lagos";

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

/** Convert a timezone-free datetime-local value in the specified IANA zone to canonical Unix seconds. */
export function localDateTimeToUnixSeconds(value: string, timeZone = USER_TIME_ZONE): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) throw new Error("Enter a valid observation date and time in WAT.");
  const desired: ZonedParts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]), hour: Number(match[4]), minute: Number(match[5]), second: Number(match[6] ?? 0) };
  const utcLike = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute, desired.second);
  const check = new Date(utcLike);
  if (check.getUTCFullYear() !== desired.year || check.getUTCMonth() + 1 !== desired.month || check.getUTCDate() !== desired.day || desired.hour > 23 || desired.minute > 59 || desired.second > 59) {
    throw new Error("Enter a valid observation date and time in WAT.");
  }
  let candidate = utcLike;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = zonedParts(new Date(candidate), timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const correction = utcLike - actualAsUtc;
    if (correction === 0) return Math.floor(candidate / 1000);
    candidate += correction;
  }
  throw new Error(`That local time is not valid in ${timeZone}.`);
}

/** Display a Unix timestamp in an HTML datetime-local input using the given IANA zone. */
export function unixSecondsToLocalDateTime(value: number | string, timeZone = USER_TIME_ZONE): string {
  const seconds = Number(value);
  if (!Number.isSafeInteger(seconds) || seconds <= 0) return "";
  const p = zonedParts(new Date(seconds * 1000), timeZone);
  return `${String(p.year).padStart(4, "0")}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function formatWatTimestamp(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "" || value === 0 || value === "0") return "—";
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
