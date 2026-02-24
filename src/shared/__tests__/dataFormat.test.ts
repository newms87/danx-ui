import { describe, it, expect } from "vitest";
import { isJSON, isStructuredData } from "../dataFormat";

describe("isJSON", () => {
  it("returns true for a plain object", () => {
    expect(isJSON({ key: "value" })).toBe(true);
  });

  it("returns true for an array object", () => {
    expect(isJSON([1, 2, 3])).toBe(true);
  });

  it("returns true for a valid JSON string", () => {
    expect(isJSON('{"name": "John"}')).toBe(true);
  });

  it("returns true for a JSON array string", () => {
    expect(isJSON("[1, 2, 3]")).toBe(true);
  });

  it("returns false for an invalid JSON string", () => {
    expect(isJSON("{not json}")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isJSON("")).toBe(false);
  });

  it("returns false for a plain text string", () => {
    expect(isJSON("hello world")).toBe(false);
  });
});

describe("isStructuredData", () => {
  it("returns true for a valid JSON string", () => {
    expect(isStructuredData('{"key": "value"}')).toBe(true);
  });

  it("returns true for an object input", () => {
    expect(isStructuredData({ key: "value" })).toBe(true);
  });

  it("returns true for a YAML object string", () => {
    expect(isStructuredData("name: John\nage: 30")).toBe(true);
  });

  it("returns true for a YAML array string", () => {
    expect(isStructuredData("- apple\n- banana")).toBe(true);
  });

  it("returns false for a YAML scalar string", () => {
    expect(isStructuredData("just a plain string")).toBe(false);
  });

  it("returns true for JSON number scalars (valid JSON)", () => {
    expect(isStructuredData("42")).toBe(true);
  });

  it("returns true for JSON boolean scalars (valid JSON)", () => {
    expect(isStructuredData("true")).toBe(true);
  });

  it("returns true for JSON null (valid JSON)", () => {
    expect(isStructuredData("null")).toBe(true);
  });

  it("returns false for non-string non-JSON input", () => {
    expect(isStructuredData("not valid {json} or yaml")).toBe(false);
  });
});
