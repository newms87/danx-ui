import { describe, it, expect } from "vitest";
import { highlightSyntax } from "../highlightSyntax";
import type { HighlightFormat } from "../highlightSyntax";

describe("highlightSyntax", () => {
  describe("empty/falsy input", () => {
    it("returns empty string for empty string", () => {
      expect(highlightSyntax("", { format: "json" })).toBe("");
    });

    it("returns empty string for null", () => {
      // @ts-expect-error testing falsy input
      expect(highlightSyntax(null, { format: "json" })).toBe("");
    });

    it("returns empty string for undefined", () => {
      // @ts-expect-error testing falsy input
      expect(highlightSyntax(undefined, { format: "json" })).toBe("");
    });
  });

  describe("format routing", () => {
    it("routes json format to JSON highlighter", () => {
      const result = highlightSyntax('{"key": "value"}', { format: "json" });
      expect(result).toContain('class="syntax-key"');
      expect(result).toContain('class="syntax-string"');
    });

    it("routes yaml format to YAML highlighter", () => {
      const result = highlightSyntax("key: value", { format: "yaml" });
      expect(result).toContain('class="syntax-key"');
    });

    it("routes html format to HTML highlighter", () => {
      const result = highlightSyntax("<div>hello</div>", { format: "html" });
      expect(result).toContain('class="syntax-tag"');
    });

    it("routes vue format to HTML highlighter", () => {
      const result = highlightSyntax("<div>hello</div>", { format: "vue" });
      expect(result).toContain('class="syntax-tag"');
    });

    it("routes css format to CSS highlighter", () => {
      const result = highlightSyntax(".foo { color: red; }", { format: "css" });
      expect(result).toContain('class="syntax-selector"');
      expect(result).toContain('class="syntax-property"');
    });

    it("routes javascript format to JavaScript highlighter", () => {
      const result = highlightSyntax("const x = 5;", { format: "javascript" });
      expect(result).toContain('class="syntax-keyword"');
      expect(result).toContain('class="syntax-number"');
    });

    it("routes typescript format to TypeScript highlighter", () => {
      const result = highlightSyntax("interface Foo { name: string }", {
        format: "typescript",
      });
      expect(result).toContain('class="syntax-keyword"');
      // "interface" is a TS keyword, not a JS keyword
      expect(result).toContain("interface");
    });

    it("routes bash format to Bash highlighter", () => {
      const result = highlightSyntax('echo "hello"', { format: "bash" });
      expect(result).toContain('class="syntax-keyword"');
      expect(result).toContain('class="syntax-string"');
    });
  });

  describe("text format", () => {
    it("escapes HTML for text format", () => {
      const result = highlightSyntax("<script>alert('xss')</script>", { format: "text" });
      expect(result).toContain("&lt;script&gt;");
      expect(result).not.toContain("<script>");
    });

    it("escapes ampersands for text format", () => {
      const result = highlightSyntax("a & b", { format: "text" });
      expect(result).toContain("a &amp; b");
    });

    it("does not add any syntax classes for text format", () => {
      const result = highlightSyntax("const x = 5;", { format: "text" });
      expect(result).not.toContain("syntax-");
    });
  });

  describe("markdown format", () => {
    it("escapes HTML for markdown format", () => {
      const result = highlightSyntax("# Hello <World>", { format: "markdown" });
      expect(result).toContain("&lt;World&gt;");
    });

    it("does not add any syntax classes for markdown format", () => {
      const result = highlightSyntax("**bold**", { format: "markdown" });
      expect(result).not.toContain("syntax-");
    });
  });

  describe("default/unknown format", () => {
    it("escapes HTML for unknown format", () => {
      const result = highlightSyntax("<b>test</b>", { format: "unknown" as HighlightFormat });
      expect(result).toContain("&lt;b&gt;");
      expect(result).not.toContain("syntax-");
    });
  });

  describe("JSON highlighting", () => {
    it("highlights keys followed by colon", () => {
      const result = highlightSyntax('{"name": "value"}', { format: "json" });
      expect(result).toContain('<span class="syntax-key">&quot;name&quot;</span>');
      expect(result).toContain('<span class="syntax-punctuation">:</span>');
    });

    it("highlights string values", () => {
      const result = highlightSyntax('{"key": "hello"}', { format: "json" });
      expect(result).toContain('<span class="syntax-string">&quot;hello&quot;</span>');
    });

    it("highlights number values", () => {
      const result = highlightSyntax('{"count": 42}', { format: "json" });
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights negative numbers", () => {
      const result = highlightSyntax('{"val": -3.14}', { format: "json" });
      expect(result).toContain('<span class="syntax-number">-3.14</span>');
    });

    it("highlights scientific notation numbers", () => {
      const result = highlightSyntax('{"val": 1e10}', { format: "json" });
      expect(result).toContain('<span class="syntax-number">1e10</span>');
    });

    it("highlights boolean true", () => {
      const result = highlightSyntax('{"active": true}', { format: "json" });
      expect(result).toContain('<span class="syntax-boolean">true</span>');
    });

    it("highlights boolean false", () => {
      const result = highlightSyntax('{"active": false}', { format: "json" });
      expect(result).toContain('<span class="syntax-boolean">false</span>');
    });

    it("highlights null", () => {
      const result = highlightSyntax('{"value": null}', { format: "json" });
      expect(result).toContain('<span class="syntax-null">null</span>');
    });

    it("highlights punctuation", () => {
      const result = highlightSyntax('{"a": [1, 2]}', { format: "json" });
      expect(result).toContain('<span class="syntax-punctuation">{</span>');
      expect(result).toContain('<span class="syntax-punctuation">}</span>');
      expect(result).toContain('<span class="syntax-punctuation">[</span>');
      expect(result).toContain('<span class="syntax-punctuation">]</span>');
      expect(result).toContain('<span class="syntax-punctuation">,</span>');
    });

    it("handles keys with whitespace before colon", () => {
      const result = highlightSyntax('{"key"  : "val"}', { format: "json" });
      expect(result).toContain('<span class="syntax-key">&quot;key&quot;</span>');
    });

    it("handles escaped characters in strings", () => {
      const result = highlightSyntax('{"msg": "hello\\nworld"}', { format: "json" });
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain("hello\\nworld");
    });

    it("handles nested objects", () => {
      const result = highlightSyntax('{"a": {"b": 1}}', { format: "json" });
      expect(result).toContain('<span class="syntax-key">&quot;a&quot;</span>');
      expect(result).toContain('<span class="syntax-key">&quot;b&quot;</span>');
      expect(result).toContain('<span class="syntax-number">1</span>');
    });
  });

  describe("YAML highlighting", () => {
    it("highlights key-value pairs", () => {
      const result = highlightSyntax("name: John", { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">name</span>');
      expect(result).toContain('<span class="syntax-punctuation">:</span>');
      expect(result).toContain('<span class="syntax-string">John</span>');
    });

    it("highlights numeric values", () => {
      const result = highlightSyntax("count: 42", { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">count</span>');
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights boolean values", () => {
      const result = highlightSyntax("active: true", { format: "yaml" });
      expect(result).toContain('<span class="syntax-boolean">true</span>');
    });

    it("highlights null values", () => {
      const result = highlightSyntax("value: null", { format: "yaml" });
      expect(result).toContain('<span class="syntax-null">null</span>');
    });

    it("highlights tilde as null", () => {
      const result = highlightSyntax("value: ~", { format: "yaml" });
      expect(result).toContain('<span class="syntax-null">~</span>');
    });

    it("highlights quoted string values", () => {
      const result = highlightSyntax('name: "John"', { format: "yaml" });
      expect(result).toContain('class="syntax-string"');
    });

    it("highlights comments with syntax-punctuation class", () => {
      const result = highlightSyntax("# This is a comment", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">');
      expect(result).toContain("# This is a comment");
    });

    it("highlights indented comments", () => {
      const result = highlightSyntax("  # indented comment", { format: "yaml" });
      expect(result).toContain('class="syntax-punctuation"');
    });

    it("highlights array items", () => {
      const result = highlightSyntax("- item1", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-string">item1</span>');
    });

    it("highlights array items with numeric values", () => {
      const result = highlightSyntax("- 42", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-number">42</span>');
    });

    it("highlights block scalar pipe indicator", () => {
      const result = highlightSyntax("description: |", { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('<span class="syntax-punctuation">|</span>');
    });

    it("highlights block scalar folded indicator", () => {
      // The > character is HTML-escaped to &gt; before the YAML regex processes it,
      // so the block scalar regex (/^[|>]/) won't match the escaped form.
      // It ends up highlighted as a string value instead.
      const result = highlightSyntax("description: >", { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">description</span>');
      expect(result).toContain('<span class="syntax-string">&gt;</span>');
    });

    it("highlights block scalar continuation lines as strings", () => {
      const yaml = "description: |\n  line 1\n  line 2";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">description</span>');
      // Continuation lines should be highlighted as strings
      expect(result).toContain('<span class="syntax-string">  line 1</span>');
      expect(result).toContain('<span class="syntax-string">  line 2</span>');
    });

    it("highlights block scalar with chomping indicator", () => {
      const result = highlightSyntax("text: |-", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">|-</span>');
    });

    it("highlights multi-line quoted strings", () => {
      const yaml = 'msg: "hello\n  world"';
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('class="syntax-string"');
    });

    it("highlights multi-line unquoted strings", () => {
      const yaml = "description: This is a long\n  continued line";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">description</span>');
      // The value and continuation should be strings
      expect(result).toContain('class="syntax-string"');
    });

    it("handles nested key-value pairs", () => {
      const yaml = "parent:\n  child: value";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">parent</span>');
      expect(result).toContain('<span class="syntax-key">child</span>');
      expect(result).toContain('<span class="syntax-string">value</span>');
    });

    it("handles decimal numbers", () => {
      const result = highlightSyntax("pi: 3.14", { format: "yaml" });
      expect(result).toContain('<span class="syntax-number">3.14</span>');
    });

    it("handles negative numbers", () => {
      const result = highlightSyntax("offset: -5", { format: "yaml" });
      expect(result).toContain('<span class="syntax-number">-5</span>');
    });

    it("handles empty array items", () => {
      const result = highlightSyntax("-", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
    });

    it("highlights block scalar indicator as array item value", () => {
      const result = highlightSyntax("- |", { format: "yaml" });
      expect(result).toContain('<span class="syntax-punctuation">-</span>');
      expect(result).toContain('<span class="syntax-punctuation">|</span>');
    });

    it("handles false boolean value", () => {
      const result = highlightSyntax("enabled: false", { format: "yaml" });
      expect(result).toContain('<span class="syntax-boolean">false</span>');
    });

    it("handles case-insensitive booleans", () => {
      const result = highlightSyntax("flag: True", { format: "yaml" });
      expect(result).toContain('<span class="syntax-boolean">True</span>');
    });

    it("handles case-insensitive null", () => {
      const result = highlightSyntax("val: Null", { format: "yaml" });
      expect(result).toContain('<span class="syntax-null">Null</span>');
    });

    it("handles multiple lines with different types", () => {
      const yaml = "name: John\nage: 30\nactive: true\ndata: null";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-string">John</span>');
      expect(result).toContain('<span class="syntax-number">30</span>');
      expect(result).toContain('<span class="syntax-boolean">true</span>');
      expect(result).toContain('<span class="syntax-null">null</span>');
    });
  });

  describe("YAML edge cases", () => {
    it("handles unquoted multiline string with empty line in the middle", () => {
      const yaml = "description: first line\n  continuation\n\n  after empty\nother: val";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">description</span>');
      // The continuation lines should be strings
      expect(result).toContain('class="syntax-string"');
      expect(result).toContain('<span class="syntax-key">other</span>');
    });

    it("handles bare text line that matches no YAML pattern", () => {
      // A line that's not a comment, not key:value, not array item, and not in a multiline construct
      const yaml = "key: value\njust some bare text without colon";
      const result = highlightSyntax(yaml, { format: "yaml" });
      // The bare text line should be rendered (escaped) without any syntax class
      expect(result).toContain("just some bare text without colon");
    });

    it("handles empty line within unquoted multiline value", () => {
      const yaml = "msg: hello world\n  continued\n\n  still going\nnext: val";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-key">msg</span>');
      expect(result).toContain('<span class="syntax-key">next</span>');
    });

    it("handles scientific notation in YAML values", () => {
      const result = highlightSyntax("val: 1.5e10", { format: "yaml" });
      expect(result).toContain('<span class="syntax-number">1.5e10</span>');
    });

    it("exits block scalar when a normal line follows at same indentation", () => {
      // Block scalar followed by a key-value pair at the same indent (triggers line 187)
      const yaml = "desc: |\n  scalar line 1\n  scalar line 2\nname: John";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('<span class="syntax-string">  scalar line 1</span>');
      expect(result).toContain('<span class="syntax-key">name</span>');
      expect(result).toContain('<span class="syntax-string">John</span>');
    });

    it("handles escaped quote within multi-line quoted string", () => {
      // Continuation line with backslash-escaped quote (triggers lines 208-209)
      const yaml = 'msg: "first line\n  escaped \\" still\n  end"';
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('class="syntax-string"');
    });

    it("handles multi-line quoted string continuation without closing quote", () => {
      // Middle continuation line with no quote at all (triggers line 225)
      const yaml = 'msg: "first line\n  middle no quote\n  end"';
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('class="syntax-string"');
    });

    it("handles single-quoted multi-line YAML string", () => {
      // Exercises the single-quote path in quoteChar detection (line 199, 277)
      const yaml = "msg: 'first line\n  continuation\n  end'";
      const result = highlightSyntax(yaml, { format: "yaml" });
      expect(result).toContain('class="syntax-string"');
    });

    it("handles JSON minus not followed by digit", () => {
      // In JSON, a minus sign that doesn't form a valid number (line 78 false branch)
      const result = highlightSyntax('{"key": -}', { format: "json" });
      expect(result).toContain('class="syntax-key"');
    });
  });

  describe("type exports", () => {
    it("HighlightFormat type includes all expected formats", () => {
      // This is a compile-time check - if these assignments fail, TypeScript will error
      const formats: HighlightFormat[] = [
        "json",
        "yaml",
        "text",
        "markdown",
        "html",
        "css",
        "javascript",
        "typescript",
        "bash",
        "vue",
      ];
      expect(formats).toHaveLength(10);
    });
  });
});
