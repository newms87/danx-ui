/**
 * DateTime Parsing Utilities
 *
 * Functions for parsing date/time strings in various formats into Luxon DateTime objects.
 * Supports SQL, ISO, slash-delimited, and many other common formats.
 */

import { DateTime } from "luxon";

/** Parses a date string or number into a Luxon DateTime object */
export function parseDateTime(dateTime: string | DateTime | number | null): DateTime | null {
  if (typeof dateTime === "number") {
    return DateTime.fromMillis(dateTime);
  }
  if (typeof dateTime === "string") {
    return parseGenericDateTime(dateTime);
  }
  return (dateTime as DateTime) || null;
}

/** Parses a SQL formatted date string (e.g., "2024-01-15 10:30:00") */
export function parseSqlDateTime(dateTime: string): DateTime | null {
  const parsed = DateTime.fromSQL(dateTime.replace("T", " ").replace(/\//g, "-"));
  return parsed.isValid ? parsed : null;
}

/** Parses a slash-delimited date string (e.g., "2024/01/15") */
export function parseSlashDate(date: string, format = "yyyy/MM/dd"): DateTime | null {
  const parsed = DateTime.fromFormat(date, format);
  return parsed.isValid ? parsed : null;
}

/** Parses a slash-delimited date/time string (e.g., "2024/01/15 10:30:00") */
export function parseSlashDateTime(date: string, format = "yyyy/MM/dd HH:mm:ss"): DateTime | null {
  const parsed = DateTime.fromFormat(date, format);
  return parsed.isValid ? parsed : null;
}

/**
 * Parses a date string in various formats into a Luxon DateTime object.
 * Tries common formats (US before European) until one succeeds.
 */
export function parseGenericDateTime(
  dateTimeString: string,
  defaultZone = "local"
): DateTime | null {
  if (!dateTimeString) return null;

  const formats = [
    "yyyy-MM-dd",
    "yyyy-MM-dd HH:mm:ss",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "MM/dd/yy",
    "dd/MM/yy",
    "yyyy/MM/dd",
    "MM-dd-yyyy",
    "dd-MM-yyyy",
    "M/d/yyyy",
    "d/M/yyyy",
    "yyyyMMdd",
  ];

  for (const format of formats) {
    const parsed = DateTime.fromFormat(dateTimeString, format, {
      zone: defaultZone,
    });
    if (parsed.isValid) {
      return parsed;
    }
  }

  const isoParsed = DateTime.fromISO(dateTimeString, { zone: defaultZone });
  if (isoParsed.isValid) {
    return isoParsed;
  }

  const sqlParsed = DateTime.fromSQL(dateTimeString, { zone: defaultZone });
  if (sqlParsed.isValid) {
    return sqlParsed;
  }

  return null;
}
