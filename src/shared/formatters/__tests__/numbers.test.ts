import { describe, expect, it } from "vitest";
import {
  fBoolean,
  fCurrency,
  fCurrencyNoCents,
  fNumber,
  fPercent,
  fShortCurrency,
  fShortNumber,
  fShortSize,
} from "../numbers";

describe("fCurrency", () => {
  it("formats a positive amount", () => {
    expect(fCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(fCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(fCurrency(-50)).toBe("-$50.00");
  });

  it("returns $- for NaN", () => {
    expect(fCurrency(NaN)).toBe("$-");
  });

  it("returns $- for null", () => {
    expect(fCurrency(null as unknown as number)).toBe("$-");
  });

  it("returns $- for undefined", () => {
    expect(fCurrency(undefined as unknown as number)).toBe("$-");
  });

  it("accepts Intl.NumberFormatOptions", () => {
    expect(fCurrency(1234.5, { minimumFractionDigits: 0 })).toBe("$1,234.5");
  });
});

describe("fCurrencyNoCents", () => {
  it("formats without cents", () => {
    expect(fCurrencyNoCents(1234.56)).toBe("$1,235");
  });

  it("returns $- for NaN", () => {
    expect(fCurrencyNoCents(NaN)).toBe("$-");
  });

  it("accepts additional options", () => {
    expect(fCurrencyNoCents(1234, { useGrouping: false })).toBe("$1234");
  });
});

describe("fNumber", () => {
  it("formats with separators", () => {
    expect(fNumber(1234567)).toBe("1,234,567");
  });

  it("formats decimals", () => {
    expect(fNumber(3.14159, { maximumFractionDigits: 2 })).toBe("3.14");
  });
});

describe("fShortCurrency", () => {
  it("formats thousands", () => {
    expect(fShortCurrency(5000)).toBe("$5.0K");
  });

  it("formats millions", () => {
    expect(fShortCurrency(1200000)).toBe("$1.2M");
  });

  it("returns $- for empty string", () => {
    expect(fShortCurrency("")).toBe("$-");
  });
});

describe("fShortNumber", () => {
  it("returns - for empty string", () => {
    expect(fShortNumber("")).toBe("-");
  });

  it("returns - for null", () => {
    expect(fShortNumber(null as unknown as string)).toBe("-");
  });

  it("returns - for undefined", () => {
    expect(fShortNumber(undefined as unknown as string)).toBe("-");
  });

  it("formats small numbers without unit", () => {
    expect(fShortNumber(500)).toBe("500");
  });

  it("formats thousands", () => {
    expect(fShortNumber(5000)).toBe("5.0K");
  });

  it("formats millions", () => {
    expect(fShortNumber(1200000)).toBe("1.2M");
  });

  it("formats billions", () => {
    expect(fShortNumber(3500000000)).toBe("3.5B");
  });

  it("formats trillions", () => {
    expect(fShortNumber(2000000000000)).toBe("2.0T");
  });

  it("formats quadrillions", () => {
    expect(fShortNumber(5000000000000000)).toBe("5.0Q");
  });

  it("rounds when option is set", () => {
    expect(fShortNumber(5432, { round: true })).toBe("5.432K");
  });

  it("uses 0 decimal places for values > 100 in unit", () => {
    expect(fShortNumber(150000)).toBe("150K");
  });

  it("formats number at exact boundary (1000)", () => {
    // 1000 is not > 1000 so no short unit
    expect(fShortNumber(1000)).toBe("1000");
  });

  it("formats string numbers", () => {
    expect(fShortNumber("25000")).toBe("25.0K");
  });
});

describe("fShortSize", () => {
  it("formats small byte values", () => {
    expect(fShortSize(500)).toBe("500 B");
  });

  it("keeps values under 2^20 in bytes", () => {
    expect(fShortSize(1024)).toBe("1024 B");
  });

  it("formats values at 2^20 boundary as KB", () => {
    expect(fShortSize(1048576)).toBe("1024 KB");
  });

  it("formats values at 2^30 boundary as MB", () => {
    expect(fShortSize(1073741824)).toBe("1024 MB");
  });

  it("formats values at 2^40 boundary as GB", () => {
    expect(fShortSize(1099511627776)).toBe("1024 GB");
  });

  it("formats zero", () => {
    expect(fShortSize(0)).toBe("0 B");
  });

  it("formats string input", () => {
    expect(fShortSize("2048")).toBe("2048 B");
  });

  it("formats large KB values", () => {
    // 5 MB = 5,242,880 bytes → falls in KB range (2^20 to 2^30)
    expect(fShortSize(5242880)).toBe("5120 KB");
  });
});

describe("fBoolean", () => {
  it("returns Yes for true", () => {
    expect(fBoolean(true)).toBe("Yes");
  });

  it("returns No for false", () => {
    expect(fBoolean(false)).toBe("No");
  });

  it("returns - for null", () => {
    expect(fBoolean(null)).toBe("-");
  });

  it("returns - for undefined", () => {
    expect(fBoolean(undefined)).toBe("-");
  });

  it("passes through Yes string", () => {
    expect(fBoolean("Yes")).toBe("Yes");
  });

  it("passes through No string", () => {
    expect(fBoolean("No")).toBe("No");
  });

  it("returns Yes for truthy string", () => {
    expect(fBoolean("anything")).toBe("Yes");
  });

  it("returns No for empty string", () => {
    expect(fBoolean("")).toBe("No");
  });
});

describe("fPercent", () => {
  it("formats a decimal as percentage", () => {
    expect(fPercent(0.452)).toBe("45.2%");
  });

  it("returns N/A for non-numeric input", () => {
    expect(fPercent("not-a-number")).toBe("N/A");
  });

  it("uses custom NaN string", () => {
    expect(fPercent("abc", { NaN: "—" })).toBe("—");
  });

  it("uses custom multiplier", () => {
    expect(fPercent(45, { multiplier: 1 })).toBe("45%");
  });

  it("uses custom maximumFractionDigits", () => {
    expect(fPercent(0.12345, { maximumFractionDigits: 3 })).toBe("12.345%");
  });

  it("formats zero", () => {
    expect(fPercent(0)).toBe("0%");
  });

  it("formats string numbers", () => {
    expect(fPercent("0.5")).toBe("50%");
  });
});
