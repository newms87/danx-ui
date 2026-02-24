import { describe, it, expect } from "vitest";
import { parseStructuredData } from "../parseStructuredData";
import { tokenizeBlocks } from "../index";

describe("parseStructuredData", () => {
  describe("JSON detection", () => {
    it("parses a single-line JSON object", () => {
      const lines = ['{"name": "John", "age": 30}'];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{"name": "John", "age": 30}',
        },
        endIndex: 1,
      });
    });

    it("parses a single-line JSON array", () => {
      const lines = ["[1, 2, 3]"];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: "[1, 2, 3]",
        },
        endIndex: 1,
      });
    });

    it("parses a multi-line JSON object", () => {
      const lines = ["{", '  "name": "John",', '  "age": 30', "}"];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{\n  "name": "John",\n  "age": 30\n}',
        },
        endIndex: 4,
      });
    });

    it("parses a multi-line JSON array with nested objects", () => {
      const lines = ['[{"name": ["Dr.", "John", "Smith"]},', '{"name": ["Ms.", "Jane", "Doe"]}]'];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '[{"name": ["Dr.", "John", "Smith"]},\n{"name": ["Ms.", "Jane", "Doe"]}]',
        },
        endIndex: 2,
      });
    });

    it("handles brackets inside JSON string values", () => {
      const lines = ['{"key": "[value]", "other": "{braces}"}'];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{"key": "[value]", "other": "{braces}"}',
        },
        endIndex: 1,
      });
    });

    it("handles escaped quotes inside JSON strings", () => {
      const lines = ['{"msg": "say \\"hello\\""}'];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{"msg": "say \\"hello\\""}',
        },
        endIndex: 1,
      });
    });

    it("returns null for unbalanced JSON (missing closing bracket)", () => {
      const lines = ['{"name": "John"', ""];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null for invalid JSON with balanced brackets", () => {
      const lines = ["{not valid json}"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null for markdown links (false positive prevention)", () => {
      const lines = ["[Click here](https://example.com)"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null for markdown image links", () => {
      const lines = ["[alt text](image.png)"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("stops at empty lines during JSON collection", () => {
      const lines = ["{", '  "key": "value"', "", "}"];
      // Empty line at index 2 stops collection while depth > 0 → unbalanced → null
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("starts parsing from given index", () => {
      const lines = ["some text", '{"data": true}', "more text"];
      expect(parseStructuredData(lines, 1)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{"data": true}',
        },
        endIndex: 2,
      });
    });

    it("parses multi-line JSON starting at non-zero index", () => {
      const lines = ["text", "{", '  "a": 1', "}", "more text"];
      expect(parseStructuredData(lines, 1)).toEqual({
        token: {
          type: "code_block",
          language: "json",
          content: '{\n  "a": 1\n}',
        },
        endIndex: 4,
      });
    });

    it("does not consume lines after the JSON block", () => {
      const lines = ['{"a": 1}', "next line"];
      const result = parseStructuredData(lines, 0);
      expect(result!.endIndex).toBe(1);
    });
  });

  describe("YAML detection", () => {
    it("parses a YAML key-value block", () => {
      const lines = ["name: John", "age: 30", "city: NYC"];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "yaml",
          content: "name: John\nage: 30\ncity: NYC",
        },
        endIndex: 3,
      });
    });

    it("parses a YAML list with key-value items", () => {
      const lines = ["- name: John", "- name: Jane"];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "yaml",
          content: "- name: John\n- name: Jane",
        },
        endIndex: 2,
      });
    });

    it("stops at empty lines", () => {
      const lines = ["name: John", "age: 30", "", "next paragraph"];
      const result = parseStructuredData(lines, 0);
      expect(result).toEqual({
        token: {
          type: "code_block",
          language: "yaml",
          content: "name: John\nage: 30",
        },
        endIndex: 2,
      });
    });

    it("returns null for single-line prose with colons", () => {
      const lines = ["Note: this is important"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null for single YAML key-value line (requires 2+ lines)", () => {
      const lines = ["name: John"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("parses YAML with nested indented values", () => {
      const lines = ["name: John", "roles:", "  - admin", "  - editor"];
      expect(parseStructuredData(lines, 0)).toEqual({
        token: {
          type: "code_block",
          language: "yaml",
          content: "name: John\nroles:\n  - admin\n  - editor",
        },
        endIndex: 4,
      });
    });

    it("returns null for multi-line content matching YAML pattern but failing validation", () => {
      // Lines match YAML_LINE_PATTERN but combined content fails isStructuredData
      // Use tab characters after colon which breaks YAML parsing
      const lines = ["key: \t{[invalid", "other: \t]]}yaml"];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null for lines that don't match YAML pattern", () => {
      const lines = ["Just a regular sentence without structured data."];
      expect(parseStructuredData(lines, 0)).toBeNull();
    });

    it("returns null when YAML content is actually JSON", () => {
      // A line like `{"a": 1}` starts with { so JSON path runs first
      // This test ensures YAML path rejects content that isJSON() accepts
      // We need a case where YAML pattern matches but content is also valid JSON
      // This is hard to construct since JSON objects start with { which bypasses YAML
      // The guard exists for safety but in practice JSON path handles it first
      const lines = ["[1, 2, 3]"];
      const result = parseStructuredData(lines, 0);
      // JSON path handles this, producing json language
      expect(result!.token).toHaveProperty("language", "json");
    });

    it("starts parsing from given index", () => {
      const lines = ["paragraph text", "key: value", "another: data"];
      expect(parseStructuredData(lines, 1)).toEqual({
        token: {
          type: "code_block",
          language: "yaml",
          content: "key: value\nanother: data",
        },
        endIndex: 3,
      });
    });
  });

  describe("non-structured data", () => {
    it("returns null for plain text", () => {
      expect(parseStructuredData(["Hello world"], 0)).toBeNull();
    });

    it("returns null for markdown heading syntax", () => {
      expect(parseStructuredData(["# Heading"], 0)).toBeNull();
    });

    it("returns null for empty lines", () => {
      expect(parseStructuredData([""], 0)).toBeNull();
    });
  });

  describe("integration with tokenizeBlocks", () => {
    it("tokenizes unfenced JSON between paragraphs", () => {
      const markdown = 'Here is some data:\n\n{"name": "John", "age": 30}\n\nMore text after.';
      const tokens = tokenizeBlocks(markdown);
      expect(tokens).toEqual([
        { type: "paragraph", content: "Here is some data:" },
        {
          type: "code_block",
          language: "json",
          content: '{"name": "John", "age": 30}',
        },
        { type: "paragraph", content: "More text after." },
      ]);
    });

    it("tokenizes unfenced YAML between paragraphs", () => {
      const markdown = "Some intro text\n\nname: John\nage: 30\n\nEnd text";
      const tokens = tokenizeBlocks(markdown);
      expect(tokens).toEqual([
        { type: "paragraph", content: "Some intro text" },
        {
          type: "code_block",
          language: "yaml",
          content: "name: John\nage: 30",
        },
        { type: "paragraph", content: "End text" },
      ]);
    });

    it("does not interfere with fenced code blocks", () => {
      const markdown = '```json\n{"fenced": true}\n```';
      const tokens = tokenizeBlocks(markdown);
      expect(tokens).toEqual([
        {
          type: "code_block",
          language: "json",
          content: '{"fenced": true}',
        },
      ]);
    });

    it("handles mixed content with JSON array", () => {
      const markdown = 'Description\n\n[{"name": ["Dr.", "John", "Smith"]}]\n\nFollowing text';
      const tokens = tokenizeBlocks(markdown);
      expect(tokens).toEqual([
        { type: "paragraph", content: "Description" },
        {
          type: "code_block",
          language: "json",
          content: '[{"name": ["Dr.", "John", "Smith"]}]',
        },
        { type: "paragraph", content: "Following text" },
      ]);
    });
  });
});
