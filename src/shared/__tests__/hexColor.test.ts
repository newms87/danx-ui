import { describe, it, expect } from "vitest";
import { findHexMatches, HEX_PATTERN, VALID_HEX } from "../hexColor";

describe("HEX_PATTERN", () => {
  it("matches 6-digit hex colors", () => {
    HEX_PATTERN.lastIndex = 0;
    const match = HEX_PATTERN.exec("#ff00aa");
    expect(match).not.toBeNull();
    expect(match![0]).toBe("#ff00aa");
  });

  it("matches 3-digit hex colors", () => {
    HEX_PATTERN.lastIndex = 0;
    const match = HEX_PATTERN.exec("#f0a");
    expect(match).not.toBeNull();
    expect(match![0]).toBe("#f0a");
  });

  it("rejects hex inside HTML entities", () => {
    HEX_PATTERN.lastIndex = 0;
    const match = HEX_PATTERN.exec("&#039;");
    expect(match).toBeNull();
  });

  it("rejects hex preceded by word character", () => {
    HEX_PATTERN.lastIndex = 0;
    const match = HEX_PATTERN.exec("word#abc");
    expect(match).toBeNull();
  });
});

describe("VALID_HEX", () => {
  it("validates 6-digit hex", () => {
    expect(VALID_HEX.test("#aabbcc")).toBe(true);
  });

  it("validates 3-digit hex", () => {
    expect(VALID_HEX.test("#abc")).toBe(true);
  });

  it("rejects 4-digit hex", () => {
    expect(VALID_HEX.test("#abcd")).toBe(false);
  });

  it("rejects missing hash", () => {
    expect(VALID_HEX.test("aabbcc")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(VALID_HEX.test("#gghhii")).toBe(false);
  });
});

describe("findHexMatches", () => {
  it("finds 6-digit hex colors", () => {
    const matches = findHexMatches("color: #ff0000;");
    expect(matches).toHaveLength(1);
    expect(matches[0].fullMatch).toBe("#ff0000");
    expect(matches[0].index).toBe(7);
  });

  it("finds 3-digit hex colors", () => {
    const matches = findHexMatches("color: #f00;");
    expect(matches).toHaveLength(1);
    expect(matches[0].fullMatch).toBe("#f00");
    expect(matches[0].index).toBe(7);
  });

  it("finds multiple hex colors", () => {
    const matches = findHexMatches("#aaa and #bbccdd");
    expect(matches).toHaveLength(2);
    expect(matches[0].fullMatch).toBe("#aaa");
    expect(matches[1].fullMatch).toBe("#bbccdd");
  });

  it("returns correct indices for multiple matches", () => {
    const matches = findHexMatches("#abc #def");
    expect(matches[0].index).toBe(0);
    expect(matches[1].index).toBe(5);
  });

  it("rejects hex inside HTML entities", () => {
    const matches = findHexMatches("&#039; &#x27;");
    expect(matches).toHaveLength(0);
  });

  it("returns empty array for no matches", () => {
    const matches = findHexMatches("no colors here");
    expect(matches).toHaveLength(0);
  });

  it("returns empty array for empty string", () => {
    const matches = findHexMatches("");
    expect(matches).toHaveLength(0);
  });

  it("resets lastIndex between calls", () => {
    findHexMatches("#aaa");
    const matches = findHexMatches("#bbb");
    expect(matches).toHaveLength(1);
    expect(matches[0].fullMatch).toBe("#bbb");
  });
});
