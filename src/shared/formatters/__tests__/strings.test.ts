import { describe, expect, it } from "vitest";
import {
  centerTruncate,
  fAddress,
  fLowercase,
  fNameOrCount,
  fPhone,
  fTruncate,
  fUppercase,
} from "../strings";

describe("centerTruncate", () => {
  it("truncates long strings from the middle", () => {
    expect(centerTruncate("abcdefghijklmnop", 10)).toBe("abc...mnop");
  });

  it("returns short strings unchanged", () => {
    expect(centerTruncate("hello", 10)).toBe("hello");
  });

  it("returns string at exact max length unchanged", () => {
    expect(centerTruncate("1234567890", 10)).toBe("1234567890");
  });

  it("handles minimum truncation length", () => {
    expect(centerTruncate("abcdef", 4)).toBe("...f");
  });

  it("handles odd max length", () => {
    expect(centerTruncate("abcdefghijklmnop", 9)).toBe("abc...nop");
  });
});

describe("fTruncate", () => {
  it("returns empty string for null", () => {
    expect(fTruncate(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(fTruncate(undefined)).toBe("");
  });

  it("returns string unchanged when within limit", () => {
    expect(fTruncate("hello", 10)).toBe("hello");
  });

  it("truncates string exceeding limit with ellipsis", () => {
    expect(fTruncate("abcdefghijklmnop", 10)).toBe("abcdefghij...");
  });

  it("returns string unchanged at exact limit length", () => {
    expect(fTruncate("1234567890", 10)).toBe("1234567890");
  });

  it("coerces non-string input to string", () => {
    expect(fTruncate(12345, 3)).toBe("123...");
  });

  it("uses default maxLength of 100", () => {
    const longStr = "a".repeat(105);
    expect(fTruncate(longStr)).toBe("a".repeat(100) + "...");
  });
});

describe("fUppercase", () => {
  it("returns empty string for null", () => {
    expect(fUppercase(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(fUppercase(undefined)).toBe("");
  });

  it("converts string to uppercase", () => {
    expect(fUppercase("hello world")).toBe("HELLO WORLD");
  });

  it("coerces non-string input to string", () => {
    expect(fUppercase(123)).toBe("123");
  });
});

describe("fLowercase", () => {
  it("returns empty string for null", () => {
    expect(fLowercase(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(fLowercase(undefined)).toBe("");
  });

  it("converts string to lowercase", () => {
    expect(fLowercase("HELLO WORLD")).toBe("hello world");
  });

  it("coerces non-string input to string", () => {
    expect(fLowercase(123)).toBe("123");
  });
});

describe("fAddress", () => {
  it("returns empty string for null", () => {
    expect(fAddress(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(fAddress(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(fAddress("")).toBe("");
  });

  it("coerces non-object input to string", () => {
    expect(fAddress(12345)).toBe("12345");
  });

  it("formats single-line with all fields", () => {
    expect(
      fAddress({ street: "123 Main St", city: "Springfield", state: "IL", zip: "62704" })
    ).toBe("123 Main St, Springfield, IL, 62704");
  });

  it("formats single-line with partial fields", () => {
    expect(fAddress({ city: "Springfield", state: "IL" })).toBe("Springfield, IL");
  });

  it("formats multiline with all fields", () => {
    expect(
      fAddress(
        { street: "123 Main St", city: "Springfield", state: "IL", zip: "62704" },
        "multiline"
      )
    ).toBe("123 Main St\nSpringfield, IL 62704");
  });

  it("formats multiline with missing street", () => {
    expect(fAddress({ city: "Springfield", state: "IL", zip: "62704" }, "multiline")).toBe(
      "Springfield, IL 62704"
    );
  });

  it("formats multiline with missing zip", () => {
    expect(fAddress({ street: "123 Main St", city: "Springfield", state: "IL" }, "multiline")).toBe(
      "123 Main St\nSpringfield, IL"
    );
  });

  it("formats multiline with only city", () => {
    expect(fAddress({ city: "Springfield" }, "multiline")).toBe("Springfield");
  });
});

describe("fPhone", () => {
  it("formats a 10-digit number", () => {
    expect(fPhone("5551234567")).toBe("(555) 123-4567");
  });

  it("formats a number starting with 1", () => {
    expect(fPhone("15551234567")).toBe("+1 (555) 123-4567");
  });

  it("strips non-digit characters", () => {
    expect(fPhone("(555) 123-4567")).toBe("(555) 123-4567");
  });

  it("returns empty string for falsy value", () => {
    expect(fPhone("")).toBe("");
  });

  it("returns empty string for number type 0", () => {
    expect(fPhone(0)).toBe("");
  });

  it("returns empty string for special +1 ( pattern", () => {
    expect(fPhone("+1 (")).toBe("");
  });

  it("formats partial numbers", () => {
    expect(fPhone("555")).toBe("(555");
  });

  it("formats numbers with extensions", () => {
    expect(fPhone("55512345671234")).toBe("(555) 123-4567 x1234");
  });

  it("returns empty string for non-string falsy", () => {
    expect(fPhone(null as unknown as string)).toBe("");
  });

  it("returns numeric value coerced for non-string number type", () => {
    expect(fPhone(5551234567)).toBe(5551234567);
  });
});

describe("fNameOrCount", () => {
  it("returns count for arrays", () => {
    expect(fNameOrCount([{ name: "a" }, { name: "b" }], "items")).toBe("2 items");
  });

  it("returns empty count for empty arrays", () => {
    expect(fNameOrCount([], "items")).toBe("0 items");
  });

  it("returns title for single item with title", () => {
    expect(fNameOrCount({ title: "My Item" }, "items")).toBe("My Item");
  });

  it("returns name for single item with name", () => {
    expect(fNameOrCount({ name: "Test" }, "items")).toBe("Test");
  });

  it("returns id for single item with only id", () => {
    expect(fNameOrCount({ id: 42 }, "items")).toBe("42");
  });

  it("prefers title over name", () => {
    expect(fNameOrCount({ title: "Title", name: "Name" }, "items")).toBe("Title");
  });

  it("returns empty string for null item", () => {
    expect(fNameOrCount(null as unknown as { name: string }, "items")).toBe("");
  });
});
