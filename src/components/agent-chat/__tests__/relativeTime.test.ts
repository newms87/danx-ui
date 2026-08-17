import { describe, it, expect } from "vitest";
import {
  fAbsoluteTime,
  fClockTime,
  fDayLabel,
  fRelativeTime,
  isDifferentDay,
} from "../../../shared/formatters/relativeTime";

const NOW = new Date("2026-08-17T12:00:00.000Z").getTime();

describe("fRelativeTime", () => {
  it("reads sub-minute deltas as 'just now'", () => {
    expect(fRelativeTime("2026-08-17T11:59:40.000Z", { now: NOW })).toBe("just now");
  });

  it("formats minutes in the past", () => {
    expect(fRelativeTime("2026-08-17T11:55:00.000Z", { now: NOW })).toMatch(/5 minutes ago/);
  });

  it("formats hours in the past", () => {
    expect(fRelativeTime("2026-08-17T09:00:00.000Z", { now: NOW })).toMatch(/3 hours ago/);
  });

  it("formats days in the past", () => {
    expect(fRelativeTime("2026-08-15T12:00:00.000Z", { now: NOW })).toMatch(/2 days ago/);
  });

  it("formats months in the past", () => {
    expect(fRelativeTime("2026-05-17T12:00:00.000Z", { now: NOW })).toMatch(/months ago/);
  });

  it("formats years in the past", () => {
    expect(fRelativeTime("2023-08-17T12:00:00.000Z", { now: NOW })).toMatch(/years ago/);
  });

  it("formats a future timestamp", () => {
    expect(fRelativeTime("2026-08-17T12:10:00.000Z", { now: NOW })).toMatch(/in 10 minutes/);
  });

  it("accepts epoch millis and Date instances", () => {
    expect(fRelativeTime(new Date("2026-08-17T11:55:00.000Z"), { now: NOW })).toMatch(/5 minutes/);
    expect(fRelativeTime(new Date("2026-08-17T11:55:00.000Z").getTime(), { now: NOW })).toMatch(
      /5 minutes/
    );
  });

  it("returns the empty fallback for missing or unparseable input", () => {
    expect(fRelativeTime(null)).toBe("");
    expect(fRelativeTime(undefined)).toBe("");
    expect(fRelativeTime("")).toBe("");
    expect(fRelativeTime("not-a-date")).toBe("");
    expect(fRelativeTime(null, { empty: "—" })).toBe("—");
  });

  it("defaults `now` to the current clock when not supplied", () => {
    expect(fRelativeTime(new Date())).toBe("just now");
  });

  it("accepts a Date for `now`", () => {
    expect(fRelativeTime("2026-08-17T11:55:00.000Z", { now: new Date(NOW) })).toMatch(/5 minutes/);
  });
});

describe("fAbsoluteTime", () => {
  it("renders a localized date and time", () => {
    expect(fAbsoluteTime("2026-08-17T12:00:00.000Z", { locale: "en-US" })).toMatch(/2026/);
  });

  it("returns the empty fallback for missing input", () => {
    expect(fAbsoluteTime(null)).toBe("");
    expect(fAbsoluteTime(null, { empty: "n/a" })).toBe("n/a");
  });
});

describe("fClockTime", () => {
  it("renders a short clock label", () => {
    expect(fClockTime("2026-08-17T12:00:00.000Z", { locale: "en-US" })).toMatch(/\d/);
  });

  it("returns the empty fallback for missing input", () => {
    expect(fClockTime(null)).toBe("");
    expect(fClockTime(undefined, { empty: "--" })).toBe("--");
  });
});

describe("fDayLabel", () => {
  it("labels the current day as Today", () => {
    expect(fDayLabel("2026-08-17T08:00:00.000Z", { now: NOW })).toBe("Today");
  });

  it("labels the previous day as Yesterday", () => {
    expect(fDayLabel("2026-08-16T08:00:00.000Z", { now: NOW })).toBe("Yesterday");
  });

  it("falls back to a formatted date further back", () => {
    expect(fDayLabel("2026-08-01T08:00:00.000Z", { now: NOW, locale: "en-US" })).toMatch(/Aug/);
  });

  it("returns the empty fallback for missing input", () => {
    expect(fDayLabel(null)).toBe("");
    expect(fDayLabel(null, { empty: "?" })).toBe("?");
  });

  it("defaults `now` to the current clock", () => {
    expect(fDayLabel(new Date())).toBe("Today");
  });
});

describe("isDifferentDay", () => {
  // Constructed as LOCAL dates: day boundaries are what the reader sees on
  // their own clock, so the comparison is deliberately local, not UTC.
  it("is false within one calendar day", () => {
    expect(isDifferentDay(new Date(2026, 7, 17, 1, 0), new Date(2026, 7, 17, 23, 0))).toBe(false);
  });

  it("is true across a day change", () => {
    expect(isDifferentDay("2026-08-17T12:00:00.000Z", "2026-08-18T12:00:00.000Z")).toBe(true);
  });

  it("is true across a month or year change", () => {
    expect(isDifferentDay("2026-08-31T12:00:00.000Z", "2026-09-01T12:00:00.000Z")).toBe(true);
    expect(isDifferentDay("2025-08-17T12:00:00.000Z", "2026-08-17T12:00:00.000Z")).toBe(true);
  });

  it("is false when either side is missing (cannot be proven different)", () => {
    expect(isDifferentDay(null, "2026-08-17T12:00:00.000Z")).toBe(false);
    expect(isDifferentDay("2026-08-17T12:00:00.000Z", undefined)).toBe(false);
  });
});
