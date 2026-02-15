import { describe, it, expect } from "vitest";
import { highlightYAML } from "../highlightYAML";

describe("highlightYAML", () => {
  describe("key-value pairs", () => {
    it("highlights simple key-value pair", () => {
      const result = highlightYAML("name: John");
      expect(result).toContain('<span class="syntax-key">name</span>');
      expect(result).toContain('<span class="syntax-punctuation">:</span>');
      expect(result).toContain('<span class="syntax-string">John</span>');
    });

    it("highlights nested key-value pairs", () => {
      const result = highlightYAML("parent:\n  child: value");
      expect(result).toContain('<span class="syntax-key">parent</span>');
      expect(result).toContain('<span class="syntax-key">child</span>');
      expect(result).toContain('<span class="syntax-string">value</span>');
    });
  });

  describe("value types", () => {
    it("highlights numeric values", () => {
      const result = highlightYAML("count: 42");
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights decimal numbers", () => {
      const result = highlightYAML("pi: 3.14");
      expect(result).toContain('<span class="syntax-number">3.14</span>');
    });

    it("highlights negative numbers", () => {
      const result = highlightYAML("offset: -5");
      expect(result).toContain('<span class="syntax-number">-5</span>');
    });

    it("highlights scientific notation", () => {
      const result = highlightYAML("val: 1.5e10");
      expect(result).toContain('<span class="syntax-number">1.5e10</span>');
    });

    it("highlights boolean true", () => {
      const result = highlightYAML("active: true");
      expect(result).toContain('<span class="syntax-boolean">true</span>');
    });

    it("highlights boolean false", () => {
      const result = highlightYAML("enabled: false");
      expect(result).toContain('<span class="syntax-boolean">false</span>');
    });

    it("highlights case-insensitive booleans", () => {
      const result = highlightYAML("flag: True");
      expect(result).toContain('<span class="syntax-boolean">True</span>');
    });

    it("highlights null", () => {
      const result = highlightYAML("value: null");
      expect(result).toContain('<span class="syntax-null">null</span>');
    });

    it("highlights tilde as null", () => {
      const result = highlightYAML("value: ~");
      expect(result).toContain('<span class="syntax-null">~</span>');
    });

    it("highlights case-insensitive null", () => {
      const result = highlightYAML("val: Null");
      expect(result).toContain('<span class="syntax-null">Null</span>');
    });

    it("highlights quoted string values", () => {
      const result = highlightYAML('name: "John"');
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("comments", () => {
    it("highlights comments", () => {
      const result = highlightYAML("# This is a comment");
      expect(result).toContain('<span class="syntax-punctuation">');
      expect(result).toContain("# This is a comment");
    });

    it("highlights indented comments", () => {
      const result = highlightYAML("  # indented comment");
      expect(result).toContain('class="syntax-punctuation"');
    });
  });

  describe("array items", () => {
    it("highlights array items", () => {
      const result = highlightYAML("- item1");
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-string">item1</span>');
    });

    it("highlights array items with numeric values", () => {
      const result = highlightYAML("- 42");
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("handles empty array items", () => {
      const result = highlightYAML("-");
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
    });

    it("highlights block scalar indicator as array item value", () => {
      const result = highlightYAML("- |");
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-punctuation">|</span>');
    });
  });

  describe("block scalars", () => {
    it("highlights pipe block scalar indicator", () => {
      const result = highlightYAML("description: |");
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('<span class="syntax-punctuation">|</span>');
    });

    it("highlights block scalar with chomping indicator", () => {
      const result = highlightYAML("text: |-");
      expect(result).toContain('<span class="syntax-punctuation">|-</span>');
    });

    it("highlights continuation lines as strings", () => {
      const yaml = "description: |\n  line 1\n  line 2";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-string">  line 1</span>');
      expect(result).toContain('<span class="syntax-string">  line 2</span>');
    });

    it("exits block scalar when indentation decreases", () => {
      const yaml = "desc: |\n  scalar line 1\n  scalar line 2\nname: John";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-string">  scalar line 1</span>');
      expect(result).toContain('<span class="syntax-key">name</span>');
      expect(result).toContain('<span class="syntax-string">John</span>');
    });

    it("highlights folded block scalar value as string due to HTML escaping", () => {
      const result = highlightYAML("description: >");
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('<span class="syntax-string">&gt;</span>');
    });
  });

  describe("multi-line quoted strings", () => {
    it("highlights double-quoted multi-line strings", () => {
      const yaml = 'msg: "hello\n  world"';
      const result = highlightYAML(yaml);
      expect(result).toContain('class="syntax-string"');
    });

    it("highlights single-quoted multi-line strings", () => {
      const yaml = "msg: 'first line\n  continuation\n  end'";
      const result = highlightYAML(yaml);
      expect(result).toContain('class="syntax-string"');
    });

    it("handles escaped quotes within multi-line strings", () => {
      const yaml = 'msg: "first line\n  escaped \\" still\n  end"';
      const result = highlightYAML(yaml);
      expect(result).toContain('class="syntax-string"');
    });

    it("handles continuation lines without closing quote", () => {
      const yaml = 'msg: "first line\n  middle no quote\n  end"';
      const result = highlightYAML(yaml);
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("multi-line unquoted strings", () => {
    it("highlights unquoted multi-line strings", () => {
      const yaml = "description: This is a long\n  continued line";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('class="syntax-string"');
    });

    it("handles empty lines within unquoted multiline", () => {
      const yaml = "description: first line\n  continuation\n\n  after empty\nother: val";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('<span class="syntax-key">other</span>');
    });

    it("handles empty line followed by more continuation", () => {
      const yaml = "msg: hello world\n  continued\n\n  still going\nnext: val";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-key">msg</span>');
      expect(result).toContain('<span class="syntax-key">next</span>');
    });
  });

  describe("mixed content", () => {
    it("handles multiple lines with different types", () => {
      const yaml = "name: John\nage: 30\nactive: true\ndata: null";
      const result = highlightYAML(yaml);
      expect(result).toContain('<span class="syntax-string">John</span>');
      expect(result).toContain('<span class="syntax-number">30</span>');
      expect(result).toContain('<span class="syntax-boolean">true</span>');
      expect(result).toContain('<span class="syntax-null">null</span>');
    });

    it("handles bare text line with no YAML pattern", () => {
      const yaml = "key: value\njust some bare text without colon";
      const result = highlightYAML(yaml);
      expect(result).toContain("just some bare text without colon");
    });
  });

  describe("nested JSON detection", () => {
    const opts = { isExpanded: () => true };

    it("wraps quoted string containing JSON object in nested-json markup", () => {
      const yaml = 'data: \'{"key":"value"}\'';
      const result = highlightYAML(yaml, opts);
      expect(result).toContain('class="nested-json"');
      expect(result).toContain('class="nested-json-toggle"');
      expect(result).toContain('class="nested-json-parsed"');
    });

    it("wraps unquoted JSON string value in nested-json markup", () => {
      const yaml = 'data: {"key":"value"}';
      const result = highlightYAML(yaml, opts);
      expect(result).toContain('class="nested-json"');
    });

    it("wraps unquoted JSON object value in nested-json markup", () => {
      const yaml = 'data: {"a":1,"b":2}';
      const result = highlightYAML(yaml, opts);
      expect(result).toContain('class="nested-json"');
      expect(result).toContain('class="nested-json-parsed"');
    });

    it("wraps unquoted JSON array value in nested-json markup", () => {
      const yaml = "items: [1,2,3]";
      const result = highlightYAML(yaml, opts);
      expect(result).toContain('class="nested-json"');
    });

    it("does not wrap normal strings as nested JSON", () => {
      const yaml = "name: John Doe";
      const result = highlightYAML(yaml, opts);
      expect(result).not.toContain('class="nested-json"');
      expect(result).toContain('class="syntax-string"');
    });

    it("shows raw view when isExpanded returns false", () => {
      const collapsedOpts = { isExpanded: () => false };
      const yaml = 'data: {"a":1}';
      const result = highlightYAML(yaml, collapsedOpts);
      expect(result).toContain('class="nested-json-raw"');
      expect(result).not.toContain('class="nested-json-parsed"');
    });

    it("shows raw view for quoted string when isExpanded returns false", () => {
      const collapsedOpts = { isExpanded: () => false };
      const yaml = "data: '{\"a\":1}'";
      const result = highlightYAML(yaml, collapsedOpts);
      expect(result).toContain('class="nested-json-raw"');
      expect(result).not.toContain('class="nested-json-parsed"');
    });

    it("does not add nested-json markup when options omitted", () => {
      const yaml = 'data: {"a":1}';
      const result = highlightYAML(yaml);
      expect(result).not.toContain('class="nested-json"');
      expect(result).toContain('class="syntax-string"');
    });

    it("detects nested JSON in array item values", () => {
      // Array item with JSON array (no colon, so YAML parser correctly sees it as array item)
      const yaml = "- [1,2,3]";
      const result = highlightYAML(yaml, opts);
      expect(result).toContain('class="nested-json"');
    });

    it("includes toggle indicator with triangle character", () => {
      const yaml = 'data: {"a":1}';
      const expanded = highlightYAML(yaml, { isExpanded: () => true });
      expect(expanded).toContain("\u25BC"); // down triangle

      const collapsed = highlightYAML(yaml, { isExpanded: () => false });
      expect(collapsed).toContain("\u25B6"); // right triangle
    });
  });
});
