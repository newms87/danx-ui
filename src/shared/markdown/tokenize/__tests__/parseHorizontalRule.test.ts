import { describe, it, expect } from "vitest";
import { parseHorizontalRule } from "../parseHorizontalRule";

describe("parseHorizontalRule", () => {
  it("parses --- as horizontal rule", () => {
    expect(parseHorizontalRule("---", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("parses *** as horizontal rule", () => {
    expect(parseHorizontalRule("***", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("parses ___ as horizontal rule", () => {
    expect(parseHorizontalRule("___", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("parses more than 3 dashes (-----)", () => {
    expect(parseHorizontalRule("-----", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("parses more than 3 asterisks (*****)", () => {
    expect(parseHorizontalRule("*****", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("parses more than 3 underscores (_____)", () => {
    expect(parseHorizontalRule("_____", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("returns endIndex as index + 1", () => {
    expect(parseHorizontalRule("---", 5)).toEqual({
      token: { type: "hr" },
      endIndex: 6,
    });
  });

  it("returns null for -- (too few dashes)", () => {
    expect(parseHorizontalRule("--", 0)).toBeNull();
  });

  it("returns null for ** (too few asterisks)", () => {
    expect(parseHorizontalRule("**", 0)).toBeNull();
  });

  it("returns null for __ (too few underscores)", () => {
    expect(parseHorizontalRule("__", 0)).toBeNull();
  });

  it("returns null for plain text", () => {
    expect(parseHorizontalRule("Hello world", 0)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseHorizontalRule("", 0)).toBeNull();
  });

  it("returns null for dashes followed by text", () => {
    expect(parseHorizontalRule("---text", 0)).toBeNull();
  });

  it("returns null for mixed characters", () => {
    expect(parseHorizontalRule("-*_", 0)).toBeNull();
  });

  it("handles leading whitespace (trimmed)", () => {
    expect(parseHorizontalRule("  ---", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("handles trailing whitespace (trimmed)", () => {
    expect(parseHorizontalRule("---  ", 0)).toEqual({
      token: { type: "hr" },
      endIndex: 1,
    });
  });

  it("returns null for single dash", () => {
    expect(parseHorizontalRule("-", 0)).toBeNull();
  });

  it("returns null for single asterisk", () => {
    expect(parseHorizontalRule("*", 0)).toBeNull();
  });

  it("returns null for single underscore", () => {
    expect(parseHorizontalRule("_", 0)).toBeNull();
  });
});
