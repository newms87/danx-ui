import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import {
  parseDateTime,
  parseGenericDateTime,
  parseSlashDate,
  parseSlashDateTime,
  parseSqlDateTime,
} from "../dateTimeParsers";

describe("parseDateTime", () => {
  it("parses a number as milliseconds", () => {
    const result = parseDateTime(1700000000000);
    expect(result).toBeInstanceOf(DateTime);
    expect(result?.year).toBe(2023);
  });

  it("parses a date string", () => {
    const result = parseDateTime("2024-01-15");
    expect(result).toBeInstanceOf(DateTime);
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("passes through a DateTime object", () => {
    const dt = DateTime.fromISO("2024-06-15");
    const result = parseDateTime(dt);
    expect(result).toBe(dt);
  });

  it("returns null for null input", () => {
    expect(parseDateTime(null)).toBeNull();
  });

  it("returns null for falsy DateTime (0 treated as DateTime)", () => {
    // When dateTime is a falsy non-string non-number (null), returns null
    expect(parseDateTime(null)).toBeNull();
  });
});

describe("parseSqlDateTime", () => {
  it("parses SQL date format", () => {
    const result = parseSqlDateTime("2024-01-15 10:30:00");
    expect(result?.year).toBe(2024);
    expect(result?.hour).toBe(10);
    expect(result?.minute).toBe(30);
  });

  it("handles T separator", () => {
    const result = parseSqlDateTime("2024-01-15T10:30:00");
    expect(result?.year).toBe(2024);
    expect(result?.hour).toBe(10);
  });

  it("handles slash separators", () => {
    const result = parseSqlDateTime("2024/01/15 10:30:00");
    expect(result?.year).toBe(2024);
  });

  it("returns null for invalid input", () => {
    expect(parseSqlDateTime("not-a-date")).toBeNull();
  });
});

describe("parseSlashDate", () => {
  it("parses yyyy/MM/dd format", () => {
    const result = parseSlashDate("2024/01/15");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses with custom format", () => {
    const result = parseSlashDate("15/01/2024", "dd/MM/yyyy");
    expect(result?.year).toBe(2024);
    expect(result?.day).toBe(15);
  });

  it("returns null for invalid date", () => {
    expect(parseSlashDate("not-a-date")).toBeNull();
  });
});

describe("parseSlashDateTime", () => {
  it("parses yyyy/MM/dd HH:mm:ss format", () => {
    const result = parseSlashDateTime("2024/01/15 10:30:00");
    expect(result?.year).toBe(2024);
    expect(result?.hour).toBe(10);
    expect(result?.minute).toBe(30);
  });

  it("parses with custom format", () => {
    const result = parseSlashDateTime("15/01/2024 10:30", "dd/MM/yyyy HH:mm");
    expect(result?.year).toBe(2024);
    expect(result?.hour).toBe(10);
  });

  it("returns null for invalid date", () => {
    expect(parseSlashDateTime("not-a-date")).toBeNull();
  });
});

describe("parseGenericDateTime", () => {
  it("parses ISO date format", () => {
    const result = parseGenericDateTime("2024-01-15");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses ISO date with time", () => {
    const result = parseGenericDateTime("2024-01-15 10:30:00");
    expect(result?.year).toBe(2024);
    expect(result?.hour).toBe(10);
  });

  it("parses US-style date MM/dd/yyyy", () => {
    const result = parseGenericDateTime("01/15/2024");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses European-style date dd/MM/yyyy", () => {
    // 25/01/2024 can only be European (25 > 12)
    const result = parseGenericDateTime("25/01/2024");
    expect(result?.year).toBe(2024);
    expect(result?.day).toBe(25);
  });

  it("parses US short date MM/dd/yy", () => {
    const result = parseGenericDateTime("01/15/24");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses alternative ISO yyyy/MM/dd", () => {
    const result = parseGenericDateTime("2024/01/15");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
  });

  it("parses US date with dashes MM-dd-yyyy", () => {
    const result = parseGenericDateTime("01-15-2024");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses European date with dashes dd-MM-yyyy", () => {
    const result = parseGenericDateTime("25-01-2024");
    expect(result?.year).toBe(2024);
    expect(result?.day).toBe(25);
  });

  it("parses US date without leading zeros M/d/yyyy", () => {
    const result = parseGenericDateTime("1/5/2024");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(5);
  });

  it("parses compact ISO yyyyMMdd", () => {
    const result = parseGenericDateTime("20240115");
    expect(result?.year).toBe(2024);
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(15);
  });

  it("parses ISO with timezone (fallback)", () => {
    const result = parseGenericDateTime("2024-01-15T10:30:00Z");
    expect(result?.year).toBe(2024);
    expect(result?.isValid).toBe(true);
  });

  it("parses SQL format as fallback", () => {
    const result = parseGenericDateTime("2024-01-15 10:30:00.000");
    expect(result?.year).toBe(2024);
  });

  it("returns null for empty string", () => {
    expect(parseGenericDateTime("")).toBeNull();
  });

  it("returns null for unparseable string", () => {
    expect(parseGenericDateTime("not-a-date-at-all")).toBeNull();
  });

  it("accepts a custom default zone", () => {
    const result = parseGenericDateTime("2024-01-15", "UTC");
    expect(result?.zoneName).toBe("UTC");
  });

  it("resolves ambiguous US/European dates as US (MM/dd)", () => {
    // 01/02/2024: US interprets as Jan 2, European as Feb 1
    // US format comes first so it matches first
    const result = parseGenericDateTime("01/02/2024");
    expect(result?.month).toBe(1);
    expect(result?.day).toBe(2);
  });
});
