import { DateTime, Settings } from "luxon";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  dbDateTime,
  fDate,
  fDateTime,
  fDateTimeMs,
  fDuration,
  fLocalizedDateTime,
  fMillisecondsToDuration,
  fSecondsToDuration,
  fSecondsToTime,
  fSlashDate,
  fTimeAgo,
} from "../datetime";

describe("fSlashDate", () => {
  it("formats a date string as yyyy/MM/dd", () => {
    expect(fSlashDate("2024-01-15")).toBe("2024/01/15");
  });
});

describe("fLocalizedDateTime", () => {
  it("formats a server datetime to localized format", () => {
    const result = fLocalizedDateTime("2024-01-15 10:30:00");
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2}/);
  });

  it("accepts format options", () => {
    const result = fLocalizedDateTime("2024-01-15 10:30:00", {
      format: "yyyy-MM-dd",
    });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fDateTime", () => {
  it("formats a date string", () => {
    expect(fDateTime("2024-01-15")).toMatch(/1\/15\/24/);
  });

  it("formats a DateTime object", () => {
    const dt = DateTime.fromISO("2024-06-15T14:30:00");
    expect(fDateTime(dt)).toMatch(/6\/15\/24/);
  });

  it("returns empty string for null", () => {
    expect(fDateTime(null)).toBe("- -");
  });

  it("uses custom format", () => {
    expect(fDateTime("2024-01-15", { format: "yyyy-MM-dd" })).toBe("2024-01-15");
  });

  it("uses custom empty string", () => {
    expect(fDateTime(null, { empty: "N/A" })).toBe("N/A");
  });

  it("lowercases the output", () => {
    const result = fDateTime("2024-01-15 14:30:00", { format: "h:mma" });
    expect(result).toBe("2:30pm");
  });
});

describe("fDateTimeMs", () => {
  it("formats with millisecond precision", () => {
    const result = fDateTimeMs("2024-01-15 10:30:45");
    expect(result).toMatch(/1\/15\/24 10:30:45\.000/);
  });

  it("returns empty string for null", () => {
    expect(fDateTimeMs(null)).toBe("- -");
  });

  it("uses custom empty string", () => {
    expect(fDateTimeMs(null, { empty: "N/A" })).toBe("N/A");
  });
});

describe("dbDateTime", () => {
  it("formats for database input", () => {
    expect(dbDateTime("2024-01-15 10:30:00")).toBe("2024-01-15 10:30:00");
  });

  it("returns default empty for null", () => {
    // dbDateTime passes empty: undefined, but fDateTime destructuring default applies
    expect(dbDateTime(null)).toBe("- -");
  });
});

describe("fDate", () => {
  it("formats a date string as short date", () => {
    expect(fDate("2024-01-15")).toBe("1/15/24");
  });

  it("returns -- for null", () => {
    expect(fDate(null)).toBe("--");
  });

  it("uses custom format", () => {
    expect(fDate("2024-01-15", { format: "yyyy-MM-dd" })).toBe("2024-01-15");
  });

  it("uses custom empty string", () => {
    expect(fDate(null, { empty: "N/A" })).toBe("N/A");
  });
});

describe("fSecondsToTime", () => {
  it("formats seconds only", () => {
    expect(fSecondsToTime(45)).toBe("00:45");
  });

  it("formats minutes and seconds", () => {
    expect(fSecondsToTime(125)).toBe("02:05");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(fSecondsToTime(3661)).toBe("1:01:01");
  });

  it("formats zero", () => {
    expect(fSecondsToTime(0)).toBe("00:00");
  });
});

describe("fSecondsToDuration", () => {
  it("formats seconds only", () => {
    expect(fSecondsToDuration(45)).toBe("45s");
  });

  it("formats minutes and seconds", () => {
    expect(fSecondsToDuration(125)).toBe("2m 5s");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(fSecondsToDuration(3661)).toBe("1h 1m 1s");
  });

  it("formats zero", () => {
    expect(fSecondsToDuration(0)).toBe("0s");
  });

  it("formats hours and seconds with no minutes", () => {
    expect(fSecondsToDuration(3605)).toBe("1h 5s");
  });
});

describe("fMillisecondsToDuration", () => {
  it("formats milliseconds only", () => {
    expect(fMillisecondsToDuration(500)).toBe(" 500ms");
  });

  it("formats seconds and milliseconds", () => {
    expect(fMillisecondsToDuration(1500)).toBe("1s 500ms");
  });

  it("formats full duration", () => {
    expect(fMillisecondsToDuration(3661500)).toBe("1h 1m 1s 500ms");
  });

  it("formats zero", () => {
    expect(fMillisecondsToDuration(0)).toBe(" 0ms");
  });
});

describe("fDuration", () => {
  it("formats duration between two dates", () => {
    const result = fDuration("2024-01-15 10:00:00", "2024-01-15 11:30:45");
    expect(result).toBe("1h 30m 45s");
  });

  it("formats duration with number timestamps", () => {
    const start = DateTime.fromISO("2024-01-15T10:00:00").toMillis();
    const end = DateTime.fromISO("2024-01-15T10:05:30").toMillis();
    const result = fDuration(start, end);
    expect(result).toBe("5m 30s");
  });

  it("returns - for invalid diff", () => {
    const result = fDuration("invalid-date", "also-invalid");
    expect(result).toBe("-");
  });
});

describe("fTimeAgo", () => {
  const NOW_MS = DateTime.fromISO("2024-06-15T12:00:00").toMillis();

  beforeEach(() => {
    Settings.now = () => NOW_MS;
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it("returns empty string for null", () => {
    expect(fTimeAgo(null)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(fTimeAgo("")).toBe("");
  });

  it("returns 'a few seconds ago' for < 10 seconds", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ seconds: 5 });
    expect(fTimeAgo(dt)).toBe("a few seconds ago");
  });

  it("returns seconds for < 60 seconds", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ seconds: 30 });
    expect(fTimeAgo(dt)).toBe("30 seconds ago");
  });

  it("returns 'a minute ago' for 1 minute", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ minutes: 1, seconds: 30 });
    expect(fTimeAgo(dt)).toBe("a minute ago");
  });

  it("returns minutes for < 60 minutes", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ minutes: 25 });
    expect(fTimeAgo(dt)).toBe("25 minutes ago");
  });

  it("returns 'an hour ago' for 1 hour", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ hours: 1, minutes: 20 });
    expect(fTimeAgo(dt)).toBe("an hour ago");
  });

  it("returns hours for < 24 hours", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ hours: 5 });
    expect(fTimeAgo(dt)).toBe("5 hours ago");
  });

  it("returns 'yesterday' for 1 day ago", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ days: 1 });
    expect(fTimeAgo(dt)).toBe("yesterday");
  });

  it("returns days for < 7 days", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ days: 3 });
    expect(fTimeAgo(dt)).toBe("3 days ago");
  });

  it("returns 'a week ago' for 7-13 days", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ days: 10 });
    expect(fTimeAgo(dt)).toBe("a week ago");
  });

  it("returns weeks for 14-29 days", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ days: 20 });
    expect(fTimeAgo(dt)).toBe("2 weeks ago");
  });

  it("returns full date for 30+ days", () => {
    const dt = DateTime.fromMillis(NOW_MS).minus({ days: 60 });
    const result = fTimeAgo(dt);
    expect(result).toMatch(/Apr/);
  });

  it("accepts number timestamps", () => {
    const ts = DateTime.fromMillis(NOW_MS).minus({ minutes: 5 }).toMillis();
    expect(fTimeAgo(ts)).toBe("5 minutes ago");
  });

  it("accepts date strings", () => {
    expect(fTimeAgo("2024-06-15 11:55:00")).toMatch(/minutes? ago/);
  });

  it("handles unparseable date gracefully", () => {
    expect(fTimeAgo("not-a-date-at-all")).toBe("");
  });
});
