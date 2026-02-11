/**
 * DateTime Formatting Utilities
 *
 * Functions for formatting dates, times, durations, and relative time strings.
 * Re-exports DateTime from Luxon for consumer convenience.
 */

import { DateTime } from "luxon";
import { parseDateTime } from "./dateTimeParsers";
import { localizedDateTime } from "./dateTimeTimezone";
import type { FormatDateOptions } from "./types";

export { DateTime };

/** Formats a date as a slash-delimited string (e.g., "2024/01/15") */
export function fSlashDate(date: string): string {
  return fDate(date, { format: "yyyy/MM/dd" });
}

/** Formats a server date/time string into a localized human-readable format */
export function fLocalizedDateTime(
  dateTimeString: string,
  options: FormatDateOptions = {}
): string {
  return fDateTime(localizedDateTime(dateTimeString), options);
}

/** Formats a date/time value into a human-readable string */
export function fDateTime(
  dateTime: string | DateTime | null = null,
  { format = "M/d/yy h:mma", empty = "- -" }: FormatDateOptions = {}
): string {
  const formatted = parseDateTime(dateTime)?.toFormat(format).toLowerCase();
  return formatted || empty;
}

/** Formats a date/time value with millisecond precision */
export function fDateTimeMs(
  dateTime: string | DateTime | null = null,
  { empty = "- -" }: FormatDateOptions = {}
): string {
  const formatted = parseDateTime(dateTime)?.toFormat("M/d/yy H:mm:ss.SSS").toLowerCase();
  return formatted || empty;
}

/** Formats a date/time into SQL database format (e.g., "2024-01-15 10:30:00") */
export function dbDateTime(dateTime: string | DateTime | null = null): string {
  return fDateTime(dateTime, {
    format: "yyyy-MM-dd HH:mm:ss",
    empty: undefined,
  });
}

/** Formats a date value into a short date string (e.g., "1/15/24") */
export function fDate(
  dateTime: string | DateTime | null,
  { empty = "--", format = "M/d/yy" }: FormatDateOptions = {}
): string {
  const formatted = parseDateTime(dateTime)?.toFormat(format || "M/d/yy");
  return formatted || empty;
}

/** Formats seconds into a time string (e.g., "1:05:30" or "05:30") */
export function fSecondsToTime(second: number): string {
  const time = DateTime.now().setZone("UTC").startOf("year").set({ second });
  const hours = Math.floor(second / 3600);
  return (hours ? hours + ":" : "") + time.toFormat("mm:ss");
}

/** Formats seconds into a duration string (e.g., "1h 5m 30s") */
export function fSecondsToDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${secs}s`;
}

/** Formats milliseconds into a duration string (e.g., "1h 5m 30s 250ms") */
export function fMillisecondsToDuration(milliseconds: number): string {
  const durStr = fSecondsToDuration(Math.floor(milliseconds / 1000));
  return (durStr === "0s" ? "" : durStr) + ` ${Math.floor(milliseconds % 1000)}ms`;
}

/** Formats the duration between two date/time values (e.g., "1h 5m 30s") */
export function fDuration(start: string | number, end?: string | number): string {
  const endDateTime = end ? parseDateTime(end) : DateTime.now();
  const diff = endDateTime?.diff(parseDateTime(start) || DateTime.now(), [
    "hours",
    "minutes",
    "seconds",
  ]);
  if (!diff?.isValid) {
    return "-";
  }
  const totalSeconds = diff.as("seconds");
  return fSecondsToDuration(totalSeconds);
}

/** Formats a date/time as a relative time string (e.g., "5 minutes ago") */
export function fTimeAgo(dateTime: string | DateTime | number | null): string {
  if (!dateTime) return "";

  const date = parseDateTime(dateTime);
  if (!date) return "";

  const now = DateTime.now();
  const diffTime = Math.abs(now.toMillis() - date.toMillis());

  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffSeconds < 10) {
    return "a few seconds ago";
  } else if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  }

  if (diffMinutes === 1) {
    return "a minute ago";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }

  if (diffHours === 1) {
    return "an hour ago";
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const today = now.startOf("day");
  const authDay = date.startOf("day");
  const daysDiff = Math.floor(today.diff(authDay, "days").days);

  if (daysDiff === 1) {
    return "yesterday";
  } else if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  }

  if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
  }

  return date.toLocaleString({
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
