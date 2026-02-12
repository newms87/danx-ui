import { describe, expect, it, vi } from "vitest";
import * as yaml from "yaml";
import { useCodeFormat } from "../useCodeFormat";

vi.mock("yaml", async () => {
  const actual = await vi.importActual<typeof yaml>("yaml");
  return {
    ...actual,
    stringify: vi.fn(actual.stringify),
  };
});

describe("useCodeFormat", () => {
  describe("parse", () => {
    it("returns null for empty string", () => {
      const { parse } = useCodeFormat();
      expect(parse("")).toBeNull();
    });

    it("returns object from valid JSON string", () => {
      const { parse } = useCodeFormat();
      expect(parse('{"key":"value"}')).toEqual({ key: "value" });
    });

    it("returns object from valid YAML string", () => {
      const { parse } = useCodeFormat();
      expect(parse("key: value\nnested:\n  a: 1")).toEqual({ key: "value", nested: { a: 1 } });
    });

    it("returns null for invalid content", () => {
      const { parse } = useCodeFormat();
      // Must fail both JSON (not valid JSON) and YAML (unterminated flow sequence)
      expect(parse("[unterminated")).toBeNull();
    });

    it("strips markdown JSON fence", () => {
      const { parse } = useCodeFormat();
      const fenced = '```json\n{"a":1}\n```';
      expect(parse(fenced)).toEqual({ a: 1 });
    });

    it("strips markdown YAML fence", () => {
      const { parse } = useCodeFormat();
      const fenced = "```yaml\nkey: val\n```";
      expect(parse(fenced)).toEqual({ key: "val" });
    });

    it("prefers JSON over YAML when both are valid", () => {
      const { parse } = useCodeFormat();
      // {"a":1} is valid JSON and also valid YAML; JSON should be tried first
      const json = JSON.stringify({ a: 1 });
      const result = parse(json);
      expect(result).toEqual({ a: 1 });
    });
  });

  describe("formatValue", () => {
    it("returns empty string for null", () => {
      const { formatValue } = useCodeFormat();
      expect(formatValue(null)).toBe("");
    });

    it("formats object as JSON when targetFormat is json", () => {
      const { formatValue } = useCodeFormat();
      const result = formatValue({ a: 1 }, "json");
      expect(JSON.parse(result)).toEqual({ a: 1 });
      // Pretty-printed with 2-space indent
      expect(result).toContain("  ");
    });

    it("formats object as YAML when targetFormat is yaml", () => {
      const { formatValue } = useCodeFormat();
      const result = formatValue({ a: 1 }, "yaml");
      expect(result).toContain("a: 1");
    });

    it("passes string through unchanged for text format", () => {
      const { formatValue } = useCodeFormat();
      expect(formatValue("hello world" as unknown as object, "text")).toBe("hello world");
    });

    it("passes string through for markdown format", () => {
      const { formatValue } = useCodeFormat();
      expect(formatValue("# heading" as unknown as object, "markdown")).toBe("# heading");
    });

    it("stringifies object as JSON for string format", () => {
      const { formatValue } = useCodeFormat();
      const result = formatValue({ b: 2 }, "text");
      expect(JSON.parse(result)).toEqual({ b: 2 });
    });

    it("parses string then formats to target format", () => {
      const { formatValue } = useCodeFormat();
      // Pass a JSON string, ask for YAML output
      const result = formatValue('{"x":10}' as unknown as object, "yaml");
      expect(result).toContain("x: 10");
    });

    it("returns original string on parse failure", () => {
      const { formatValue } = useCodeFormat();
      const invalid = "not-parseable-at-all %%%";
      const result = formatValue(invalid as unknown as object, "json");
      expect(result).toBe(invalid);
    });

    it("returns original string when value fails both JSON and YAML parsing", () => {
      const { formatValue } = useCodeFormat();
      // "[unterminated" fails JSON (unterminated array) and YAML (unterminated flow sequence)
      const unparseable = "[unterminated";
      const result = formatValue(unparseable as unknown as object, "json");
      expect(result).toBe(unparseable);
    });

    it("returns JSON.stringify for non-string value when YAML conversion throws", () => {
      // Make yaml.stringify throw, forcing the catch block in formatValueToString
      vi.mocked(yaml.stringify).mockImplementationOnce(() => {
        throw new Error("YAML failure");
      });

      const { formatValue } = useCodeFormat();
      const obj = { key: "value" };
      const result = formatValue(obj, "yaml");

      // Catch block returns JSON.stringify for non-string values
      expect(result).toBe(JSON.stringify(obj, null, 2));
    });

    it("returns original string value when format conversion throws", () => {
      // Make yaml.stringify throw to exercise the catch block with a string value
      vi.mocked(yaml.stringify).mockImplementationOnce(() => {
        throw new Error("YAML failure");
      });

      const { formatValue } = useCodeFormat();
      // Pass a valid JSON string and request YAML output. parseContent succeeds
      // returning an object, then yamlStringify throws, hitting the catch block
      // with typeof value === "string" being true.
      const result = formatValue('{"a":1}' as unknown as object, "yaml");

      // Catch block returns the original string value
      expect(result).toBe('{"a":1}');
    });
  });

  describe("validate", () => {
    it("returns true for empty content", () => {
      const { validate } = useCodeFormat();
      expect(validate("", "json")).toBe(true);
    });

    it("returns true for valid JSON", () => {
      const { validate } = useCodeFormat();
      expect(validate('{"key":"value"}', "json")).toBe(true);
    });

    it("returns false for invalid JSON", () => {
      const { validate } = useCodeFormat();
      expect(validate("{bad json", "json")).toBe(false);
    });

    it("returns true for valid YAML", () => {
      const { validate } = useCodeFormat();
      expect(validate("key: value\nlist:\n  - one\n  - two", "yaml")).toBe(true);
    });

    it("returns false for invalid YAML", () => {
      const { validate } = useCodeFormat();
      expect(validate("key: value\n  bad:\nindent", "yaml")).toBe(false);
    });

    it("returns true for all string formats", () => {
      const { validate } = useCodeFormat();
      const formats = ["text", "markdown", "css", "javascript", "html"] as const;
      for (const fmt of formats) {
        expect(validate("anything {{{", fmt)).toBe(true);
      }
    });
  });

  describe("validateWithError", () => {
    it("returns null for empty content", () => {
      const { validateWithError } = useCodeFormat();
      expect(validateWithError("", "json")).toBeNull();
    });

    it("returns null for string formats", () => {
      const { validateWithError } = useCodeFormat();
      expect(validateWithError("anything", "text")).toBeNull();
      expect(validateWithError("anything", "markdown")).toBeNull();
    });

    it("returns null for valid JSON", () => {
      const { validateWithError } = useCodeFormat();
      expect(validateWithError('{"a":1}', "json")).toBeNull();
    });

    it("returns error with message for invalid JSON", () => {
      const { validateWithError } = useCodeFormat();
      const error = validateWithError("{bad", "json");
      expect(error).not.toBeNull();
      expect(error!.message).toBeTruthy();
    });

    it("returns error with linePos for invalid YAML", () => {
      const { validateWithError } = useCodeFormat();
      // Indentation error in YAML
      const error = validateWithError("key: value\n  bad:\nindent", "yaml");
      expect(error).not.toBeNull();
      expect(error!.message).toBeTruthy();
    });

    it("extracts line and column from JSON position error", () => {
      const { validateWithError } = useCodeFormat();
      // Multi-line invalid JSON to exercise the position extraction logic.
      // V8's JSON.parse includes "position N" in the error message.
      const content = '{\n  "key": value\n}';
      const error = validateWithError(content, "json");
      expect(error).not.toBeNull();
      expect(error!.message).toBeTruthy();
      // The error should have line/column extracted from position in message
      if (error!.line !== undefined) {
        expect(error!.line).toBeGreaterThanOrEqual(1);
        expect(error!.column).toBeGreaterThanOrEqual(1);
      }
    });

    it("handles JSON error without position in message", () => {
      const { validateWithError } = useCodeFormat();
      // Simple invalid JSON where error message may or may not contain "position"
      const error = validateWithError("{", "json");
      expect(error).not.toBeNull();
      expect(error!.message).toBeTruthy();
    });
  });

  describe("setFormat", () => {
    it("is no-op for same format", () => {
      const cf = useCodeFormat({ initialFormat: "json", initialValue: { a: 1 } });
      const before = cf.rawContent.value;
      cf.setFormat("json");
      expect(cf.rawContent.value).toBe(before);
    });

    it("converts content from JSON to YAML", () => {
      const cf = useCodeFormat({ initialFormat: "json", initialValue: { x: 5 } });
      expect(cf.format.value).toBe("json");
      cf.setFormat("yaml");
      expect(cf.format.value).toBe("yaml");
      expect(cf.rawContent.value).toContain("x: 5");
    });

    it("converts content from YAML to JSON", () => {
      const cf = useCodeFormat({ initialFormat: "yaml", initialValue: { y: 10 } });
      cf.setFormat("json");
      expect(cf.format.value).toBe("json");
      expect(JSON.parse(cf.rawContent.value)).toEqual({ y: 10 });
    });

    it("does not update rawContent when parsedValue is null on format change", () => {
      const cf = useCodeFormat({ initialFormat: "text" });
      // Set unparseable content (not valid JSON/YAML object)
      cf.setContent("plain text that is not json or yaml");
      const before = cf.rawContent.value;
      // Switch format — parsedValue will be null so rawContent is not updated
      cf.setFormat("json");
      expect(cf.format.value).toBe("json");
      expect(cf.rawContent.value).toBe(before);
    });
  });

  describe("setValue / setContent", () => {
    it("setContent updates rawContent directly", () => {
      const cf = useCodeFormat();
      cf.setContent("raw text here");
      expect(cf.rawContent.value).toBe("raw text here");
    });

    it("setValue formats object to current format", () => {
      const cf = useCodeFormat({ initialFormat: "json" });
      cf.setValue({ name: "test" });
      expect(JSON.parse(cf.rawContent.value)).toEqual({ name: "test" });
    });

    it("setValue formats string to current format", () => {
      const cf = useCodeFormat({ initialFormat: "yaml" });
      cf.setValue('{"count":3}');
      expect(cf.rawContent.value).toContain("count: 3");
    });

    it("setValue sets empty string for null", () => {
      const cf = useCodeFormat({ initialFormat: "json", initialValue: { a: 1 } });
      cf.setValue(null);
      expect(cf.rawContent.value).toBe("");
    });
  });

  describe("initialization and computed", () => {
    it("initialValue formats on construction", () => {
      const cf = useCodeFormat({ initialFormat: "json", initialValue: { k: "v" } });
      expect(cf.rawContent.value).toBeTruthy();
      expect(JSON.parse(cf.rawContent.value)).toEqual({ k: "v" });
    });

    it("initialFormat defaults to yaml", () => {
      const cf = useCodeFormat();
      expect(cf.format.value).toBe("yaml");
    });

    it("parsedValue computed returns parsed object", () => {
      const cf = useCodeFormat({ initialFormat: "json", initialValue: { z: 99 } });
      expect(cf.parsedValue.value).toEqual({ z: 99 });
    });

    it("formattedContent returns rawContent for string formats", () => {
      const cf = useCodeFormat({ initialFormat: "text" });
      cf.setContent("plain text content");
      expect(cf.formattedContent.value).toBe("plain text content");
    });

    it("isValid computed reflects validation state", () => {
      const cf = useCodeFormat({ initialFormat: "json" });
      cf.setContent('{"valid":true}');
      expect(cf.isValid.value).toBe(true);
      cf.setContent("{broken");
      expect(cf.isValid.value).toBe(false);
    });
  });
});
