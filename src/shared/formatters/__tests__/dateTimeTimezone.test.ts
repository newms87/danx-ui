import { IANAZone } from "luxon";
import { afterEach, describe, expect, it } from "vitest";
import {
  getServerTimezone,
  localizedDateTime,
  remoteDateTime,
  setServerTimezone,
} from "../dateTimeTimezone";

describe("getServerTimezone / setServerTimezone", () => {
  afterEach(() => {
    setServerTimezone("America/Chicago");
  });

  it("defaults to America/Chicago", () => {
    const tz = getServerTimezone();
    expect(tz).toBeInstanceOf(IANAZone);
    expect(tz.name).toBe("America/Chicago");
  });

  it("changes the server timezone", () => {
    setServerTimezone("America/New_York");
    expect(getServerTimezone().name).toBe("America/New_York");
  });

  it("can be set to UTC", () => {
    setServerTimezone("UTC");
    expect(getServerTimezone().name).toBe("UTC");
  });
});

describe("localizedDateTime", () => {
  it("converts server time to local DateTime", () => {
    const result = localizedDateTime("2024-01-15 10:30:00");
    expect(result.isValid).toBe(true);
    expect(result.zoneName).not.toBe("America/Chicago");
  });

  it("handles T separator", () => {
    const result = localizedDateTime("2024-01-15T10:30:00");
    expect(result.isValid).toBe(true);
  });
});

describe("remoteDateTime", () => {
  it("converts local time to server timezone", () => {
    const result = remoteDateTime("2024-01-15 10:30:00");
    expect(result.isValid).toBe(true);
    expect(result.zoneName).toBe("America/Chicago");
  });

  it("handles T separator", () => {
    const result = remoteDateTime("2024-01-15T10:30:00");
    expect(result.isValid).toBe(true);
    expect(result.zoneName).toBe("America/Chicago");
  });
});
