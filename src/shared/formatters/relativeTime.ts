/**
 * Peer-free relative + absolute time formatting.
 *
 * DXUI-170 established that `fTimeAgo`/`fDateTime` (formatters/datetime.ts) pull
 * in `luxon`, an OPTIONAL peer — any component importing them must stay out of
 * the main barrel or it breaks a clean install that skipped the peers.
 *
 * These helpers use only native `Intl`, so components that just need to stamp a
 * message with "2 minutes ago" (chat, activity feeds, notifications) can do so
 * while remaining in the peer-free surface. Reach for the luxon-backed
 * formatters when you need real parsing, timezone conversion, or custom format
 * strings — this module deliberately does none of those.
 */

/** Thresholds in seconds, paired with the Intl unit to divide into. */
const DIVISIONS: { limit: number; seconds: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limit: 60, seconds: 1, unit: "second" },
  { limit: 3600, seconds: 60, unit: "minute" },
  { limit: 86400, seconds: 3600, unit: "hour" },
  { limit: 604800, seconds: 86400, unit: "day" },
  { limit: 2629800, seconds: 604800, unit: "week" },
  { limit: 31557600, seconds: 2629800, unit: "month" },
  { limit: Infinity, seconds: 31557600, unit: "year" },
];

/** Parse the accepted input shapes into epoch millis, or null when unusable. */
function toEpochMs(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Format a timestamp as a relative label ("just now", "5 minutes ago", "in 2 days").
 *
 * @param value - ISO string, epoch millis, or Date
 * @param options.now - Reference point, for deterministic tests (default: Date.now())
 * @param options.empty - Returned when the value is missing/unparseable (default: "")
 * @param options.locale - BCP 47 locale (default: runtime locale)
 */
export function fRelativeTime(
  value: string | number | Date | null | undefined,
  options: { now?: number | Date; empty?: string; locale?: string } = {}
): string {
  const { empty = "", locale } = options;
  const ms = toEpochMs(value);
  if (ms === null) return empty;

  const nowMs = toEpochMs(options.now) ?? Date.now();
  const deltaSeconds = (ms - nowMs) / 1000;
  const magnitude = Math.abs(deltaSeconds);

  // Sub-minute reads better as a phrase than as "in 0 seconds"/"3 seconds ago".
  if (magnitude < 45) return "just now";

  const division = DIVISIONS.find((d) => magnitude < d.limit) ?? DIVISIONS[DIVISIONS.length - 1]!;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return formatter.format(Math.round(deltaSeconds / division.seconds), division.unit);
}

/**
 * Format a timestamp as a localized absolute date+time — the hover/title
 * companion to `fRelativeTime`.
 *
 * @param value - ISO string, epoch millis, or Date
 * @param options.empty - Returned when the value is missing/unparseable (default: "")
 * @param options.locale - BCP 47 locale (default: runtime locale)
 */
export function fAbsoluteTime(
  value: string | number | Date | null | undefined,
  options: { empty?: string; locale?: string } = {}
): string {
  const { empty = "", locale } = options;
  const ms = toEpochMs(value);
  if (ms === null) return empty;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(ms)
  );
}

/**
 * Short clock label used for message group headers ("2:14 PM").
 *
 * @param value - ISO string, epoch millis, or Date
 * @param options.empty - Returned when the value is missing/unparseable (default: "")
 * @param options.locale - BCP 47 locale (default: runtime locale)
 */
export function fClockTime(
  value: string | number | Date | null | undefined,
  options: { empty?: string; locale?: string } = {}
): string {
  const { empty = "", locale } = options;
  const ms = toEpochMs(value);
  if (ms === null) return empty;
  return new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(new Date(ms));
}

/**
 * Calendar-day label for day dividers — "Today" / "Yesterday" / "Mar 4, 2026".
 *
 * @param value - ISO string, epoch millis, or Date
 * @param options.now - Reference point, for deterministic tests (default: Date.now())
 * @param options.empty - Returned when the value is missing/unparseable (default: "")
 * @param options.locale - BCP 47 locale (default: runtime locale)
 */
export function fDayLabel(
  value: string | number | Date | null | undefined,
  options: { now?: number | Date; empty?: string; locale?: string } = {}
): string {
  const { empty = "", locale } = options;
  const ms = toEpochMs(value);
  if (ms === null) return empty;

  const target = new Date(ms);
  const now = new Date(toEpochMs(options.now) ?? Date.now());
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDelta = Math.round((startOfDay(target) - startOfDay(now)) / 86400000);

  if (dayDelta === 0) return "Today";
  if (dayDelta === -1) return "Yesterday";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(target);
}

/** True when the two timestamps fall on different calendar days (day-divider test). */
export function isDifferentDay(
  a: string | number | Date | null | undefined,
  b: string | number | Date | null | undefined
): boolean {
  const aMs = toEpochMs(a);
  const bMs = toEpochMs(b);
  if (aMs === null || bMs === null) return false;
  const da = new Date(aMs);
  const db = new Date(bMs);
  return (
    da.getFullYear() !== db.getFullYear() ||
    da.getMonth() !== db.getMonth() ||
    da.getDate() !== db.getDate()
  );
}
