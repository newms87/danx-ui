import { describe, it, expect } from "vitest";
import { highlightJSON } from "../highlightJSON";

describe("highlightJSON", () => {
  describe("keys", () => {
    it("highlights keys followed by colon", () => {
      const result = highlightJSON('{"name": "value"}');
      expect(result).toContain('<span class="syntax-key">&quot;name&quot;</span>');
      expect(result).toContain('<span class="syntax-punctuation">:</span>');
    });

    it("handles whitespace before colon", () => {
      const result = highlightJSON('{"key"  : "val"}');
      expect(result).toContain('<span class="syntax-key">&quot;key&quot;</span>');
      expect(result).toContain('<span class="syntax-punctuation">  :</span>');
    });
  });

  describe("string values", () => {
    it("highlights string values", () => {
      const result = highlightJSON('{"key": "hello"}');
      expect(result).toContain('<span class="syntax-string">&quot;hello&quot;</span>');
    });

    it("handles escaped characters in strings", () => {
      const result = highlightJSON('{"msg": "hello\\nworld"}');
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain("hello\\nworld");
    });

    it("handles escaped quotes in strings", () => {
      const result = highlightJSON('{"msg": "say \\"hi\\""}');
      expect(result).toContain('class="syntax-string"');
    });

    it("handles unterminated string at end of input", () => {
      const result = highlightJSON('{"key": "unterminated');
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("numbers", () => {
    it("highlights integer values", () => {
      const result = highlightJSON('{"count": 42}');
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights negative numbers", () => {
      const result = highlightJSON('{"val": -3.14}');
      expect(result).toContain('<span class="syntax-number">-3.14</span>');
    });

    it("highlights decimal numbers", () => {
      const result = highlightJSON('{"pi": 3.14159}');
      expect(result).toContain('<span class="syntax-number">3.14159</span>');
    });

    it("highlights scientific notation", () => {
      const result = highlightJSON('{"big": 1e10}');
      expect(result).toContain('<span class="syntax-number">1e10</span>');
    });

    it("highlights scientific notation with sign", () => {
      const result = highlightJSON('{"tiny": 5E-3}');
      expect(result).toContain('<span class="syntax-number">5E-3</span>');
    });

    it("falls through when minus is not followed by digit", () => {
      const result = highlightJSON('{"key": -}');
      expect(result).toContain('<span class="syntax-key">&quot;key&quot;</span>');
      expect(result).toContain('<span class="syntax-punctuation">}</span>');
    });
  });

  describe("booleans", () => {
    it("highlights true", () => {
      const result = highlightJSON('{"active": true}');
      expect(result).toContain('<span class="syntax-boolean">true</span>');
    });

    it("highlights false", () => {
      const result = highlightJSON('{"active": false}');
      expect(result).toContain('<span class="syntax-boolean">false</span>');
    });
  });

  describe("null", () => {
    it("highlights null", () => {
      const result = highlightJSON('{"value": null}');
      expect(result).toContain('<span class="syntax-null">null</span>');
    });
  });

  describe("punctuation", () => {
    it("highlights braces, brackets, commas, and colons", () => {
      const result = highlightJSON('{"a": [1, 2]}');
      expect(result).toContain('<span class="syntax-punctuation">{</span>');
      expect(result).toContain('<span class="syntax-punctuation">}</span>');
      expect(result).toContain('<span class="syntax-punctuation">[</span>');
      expect(result).toContain('<span class="syntax-punctuation">]</span>');
      expect(result).toContain('<span class="syntax-punctuation">,</span>');
    });
  });

  describe("complex structures", () => {
    it("handles nested objects", () => {
      const result = highlightJSON('{"a": {"b": 1}}');
      expect(result).toContain('<span class="syntax-key">&quot;a&quot;</span>');
      expect(result).toContain('<span class="syntax-key">&quot;b&quot;</span>');
      expect(result).toContain('<span class="syntax-number">1</span>');
    });

    it("handles arrays of mixed types", () => {
      const result = highlightJSON('[1, "two", true, null]');
      expect(result).toContain('<span class="syntax-number">1</span>');
      expect(result).toContain('<span class="syntax-string">&quot;two&quot;</span>');
      expect(result).toContain('<span class="syntax-boolean">true</span>');
      expect(result).toContain('<span class="syntax-null">null</span>');
    });

    it("preserves whitespace", () => {
      const result = highlightJSON('{ "a" : 1 }');
      expect(result).toContain(" ");
    });
  });

  describe("nested JSON detection", () => {
    const opts = { isExpanded: () => true };

    it("wraps string containing JSON object in nested-json markup when options provided", () => {
      // The JSON string value contains an escaped JSON object
      const code = '{"data": "{\\"key\\":\\"value\\"}"}';
      const result = highlightJSON(code, opts);
      expect(result).toContain('class="nested-json"');
      expect(result).toContain("data-nested-json-id=");
      expect(result).toContain('class="nested-json-toggle"');
      expect(result).toContain('class="nested-json-parsed"');
    });

    it("wraps string containing JSON array in nested-json markup when options provided", () => {
      const code = '{"items": "[1,2,3]"}';
      const result = highlightJSON(code, opts);
      expect(result).toContain('class="nested-json"');
      expect(result).toContain('class="nested-json-parsed"');
    });

    it("does not wrap normal strings as nested JSON", () => {
      const code = '{"key": "just a string"}';
      const result = highlightJSON(code, opts);
      expect(result).not.toContain('class="nested-json"');
      expect(result).toContain('class="syntax-string"');
    });

    it("shows raw view when isExpanded returns false", () => {
      const collapsedOpts = { isExpanded: () => false };
      const code = '{"data": "{\\"a\\":1}"}';
      const result = highlightJSON(code, collapsedOpts);
      expect(result).toContain('class="nested-json-raw"');
      expect(result).not.toContain('class="nested-json-parsed"');
    });

    it("shows expanded view when isExpanded returns true", () => {
      const expandedOpts = { isExpanded: () => true };
      const code = '{"data": "{\\"a\\":1}"}';
      const result = highlightJSON(code, expandedOpts);
      expect(result).toContain('class="nested-json-parsed"');
      expect(result).not.toContain('class="nested-json-raw"');
    });

    it("does not add nested-json markup when options omitted", () => {
      const code = '{"data": "{\\"key\\":\\"value\\"}"}';
      const result = highlightJSON(code);
      expect(result).not.toContain('class="nested-json"');
      expect(result).toContain('class="syntax-string"');
    });

    it("generates deterministic IDs based on character position", () => {
      const code = '{"a": "{\\"x\\":1}", "b": "{\\"y\\":2}"}';
      const result = highlightJSON(code, opts);
      // Both nested JSON instances should have unique IDs
      const ids = result.match(/data-nested-json-id="nj-\d+"/g);
      expect(ids).not.toBeNull();
      expect(ids!.length).toBeGreaterThanOrEqual(2);
      // IDs should be different (based on different positions)
      expect(ids![0]).not.toBe(ids![1]);
    });

    it("includes toggle indicator with triangle character", () => {
      const code = '{"data": "{\\"a\\":1}"}';
      const expanded = highlightJSON(code, { isExpanded: () => true });
      expect(expanded).toContain("\u25BC"); // down triangle for expanded

      const collapsed = highlightJSON(code, { isExpanded: () => false });
      expect(collapsed).toContain("\u25B6"); // right triangle for collapsed
    });
  });
});
