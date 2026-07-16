import { describe, it, expect } from "vitest";
import { getInitials } from "../initials";

describe("getInitials", () => {
  it("returns first letters of first two words, uppercased", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("returns single initial for a single word", () => {
    expect(getInitials("Madonna")).toBe("M");
  });

  it("uses only the first two words when there are more than two", () => {
    expect(getInitials("Ada Augusta Lovelace")).toBe("AA");
  });

  it("uppercases lowercase input", () => {
    expect(getInitials("ada lovelace")).toBe("AL");
  });

  it("collapses extra whitespace between words", () => {
    expect(getInitials("Ada   Lovelace")).toBe("AL");
  });

  it("trims leading and trailing whitespace", () => {
    expect(getInitials("  Ada Lovelace  ")).toBe("AL");
  });

  it("returns empty string for undefined", () => {
    expect(getInitials(undefined)).toBe("");
  });

  it("returns empty string for an empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(getInitials("   ")).toBe("");
  });
});
