import { describe, expect, it } from "vitest";
import { centerTruncate, fNameOrCount, fPhone } from "../strings";

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
