import { describe, expect, it } from "vitest";
import { isNestedJson, parseNestedJson } from "../nestedJson";

describe("isNestedJson", () => {
  it("returns true for valid JSON object", () => {
    expect(isNestedJson('{"key": "value"}')).toBe(true);
  });

  it("returns true for valid JSON array", () => {
    expect(isNestedJson("[1, 2, 3]")).toBe(true);
  });

  it("returns true for nested objects", () => {
    expect(isNestedJson('{"a": {"b": [1, 2]}}')).toBe(true);
  });

  it("returns true for empty object", () => {
    expect(isNestedJson("{}")).toBe(true);
  });

  it("returns true for empty array", () => {
    expect(isNestedJson("[]")).toBe(true);
  });

  it("returns false for primitive number", () => {
    expect(isNestedJson("42")).toBe(false);
  });

  it("returns false for primitive string", () => {
    expect(isNestedJson('"hello"')).toBe(false);
  });

  it("returns false for primitive boolean true", () => {
    expect(isNestedJson("true")).toBe(false);
  });

  it("returns false for primitive boolean false", () => {
    expect(isNestedJson("false")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNestedJson("null")).toBe(false);
  });

  it("returns false for invalid JSON", () => {
    expect(isNestedJson("{not valid json}")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isNestedJson("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isNestedJson("   ")).toBe(false);
  });

  it("handles leading/trailing whitespace", () => {
    expect(isNestedJson('  {"key": "value"}  ')).toBe(true);
  });

  it("returns false for strings over 100KB", () => {
    const huge = '{"a":"' + "x".repeat(100_001) + '"}';
    expect(isNestedJson(huge)).toBe(false);
  });

  it("returns false for string starting with non-object/array character", () => {
    expect(isNestedJson("hello world")).toBe(false);
  });
});

describe("parseNestedJson", () => {
  it("returns parsed object for valid JSON object", () => {
    expect(parseNestedJson('{"key": "value"}')).toEqual({ key: "value" });
  });

  it("returns parsed array for valid JSON array", () => {
    expect(parseNestedJson("[1, 2, 3]")).toEqual([1, 2, 3]);
  });

  it("returns null for primitive number", () => {
    expect(parseNestedJson("42")).toBeNull();
  });

  it("returns null for primitive string", () => {
    expect(parseNestedJson('"hello"')).toBeNull();
  });

  it("returns null for null literal", () => {
    expect(parseNestedJson("null")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseNestedJson("{broken}")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseNestedJson("")).toBeNull();
  });

  it("returns null for oversized strings", () => {
    const huge = '{"a":"' + "x".repeat(100_001) + '"}';
    expect(parseNestedJson(huge)).toBeNull();
  });

  it("handles whitespace around valid JSON", () => {
    expect(parseNestedJson("  [1, 2]  ")).toEqual([1, 2]);
  });

  it("returns null for boolean primitives", () => {
    expect(parseNestedJson("true")).toBeNull();
    expect(parseNestedJson("false")).toBeNull();
  });
});
