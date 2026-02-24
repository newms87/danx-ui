import { describe, it, expect, beforeEach } from "vitest";
import { renderTokens } from "../index";
import type { BlockToken } from "../../types";
import { resetParserState } from "../../state";

describe("renderTokens", () => {
  beforeEach(() => {
    resetParserState();
  });

  describe("headings", () => {
    it("renders h1 through h6", () => {
      for (let level = 1; level <= 6; level++) {
        const tokens: BlockToken[] = [{ type: "heading", level, content: `Heading ${level}` }];
        expect(renderTokens(tokens, true)).toBe(`<h${level}>Heading ${level}</h${level}>`);
      }
    });

    it("parses inline markdown within heading content", () => {
      const tokens: BlockToken[] = [{ type: "heading", level: 2, content: "Hello **world**" }];
      expect(renderTokens(tokens, true)).toBe("<h2>Hello <strong>world</strong></h2>");
    });
  });

  describe("code blocks", () => {
    it("renders code_block tokens to pre/code", () => {
      const tokens: BlockToken[] = [{ type: "code_block", language: "", content: "const x = 1;" }];
      expect(renderTokens(tokens, true)).toBe("<pre><code>const x = 1;</code></pre>");
    });

    it("renders code_block with language as class attribute", () => {
      const tokens: BlockToken[] = [
        { type: "code_block", language: "typescript", content: "const x: number = 1;" },
      ];
      expect(renderTokens(tokens, true)).toBe(
        '<pre><code class="language-typescript">const x: number = 1;</code></pre>'
      );
    });

    it("escapes HTML entities in code block content", () => {
      const tokens: BlockToken[] = [
        { type: "code_block", language: "", content: '<div class="test">&amp;</div>' },
      ];
      expect(renderTokens(tokens, true)).toBe(
        "<pre><code>&lt;div class=&quot;test&quot;&gt;&amp;amp;&lt;/div&gt;</code></pre>"
      );
    });

    it("escapes HTML in the language attribute", () => {
      const tokens: BlockToken[] = [
        { type: "code_block", language: 'js"onload="alert(1)', content: "code" },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toContain('class="language-js&quot;onload=&quot;alert(1)"');
    });

    it("does not add class attribute when language is empty", () => {
      const tokens: BlockToken[] = [{ type: "code_block", language: "", content: "plain code" }];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<pre><code>plain code</code></pre>");
      expect(result).not.toContain("class=");
    });

    it("adds autodetected attribute when token has autoDetected: true", () => {
      const tokens: BlockToken[] = [
        { type: "code_block", language: "json", content: '{"a": 1}', autoDetected: true },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe(
        '<pre><code class="language-json" autodetected>{&quot;a&quot;: 1}</code></pre>'
      );
    });

    it("does not add autodetected attribute on fenced code blocks", () => {
      const tokens: BlockToken[] = [{ type: "code_block", language: "json", content: '{"a": 1}' }];
      const result = renderTokens(tokens, true);
      expect(result).not.toContain("autodetected");
    });
  });

  describe("blockquotes", () => {
    it("renders blockquote tokens by recursively parsing content", () => {
      const tokens: BlockToken[] = [{ type: "blockquote", content: "A quoted paragraph" }];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<blockquote><p>A quoted paragraph</p></blockquote>");
    });

    it("renders nested block elements inside blockquotes", () => {
      const tokens: BlockToken[] = [{ type: "blockquote", content: "# Heading\n\nParagraph text" }];
      const result = renderTokens(tokens, true);
      expect(result).toContain("<blockquote>");
      expect(result).toContain("<h1>Heading</h1>");
      expect(result).toContain("<p>Paragraph text</p>");
      expect(result).toContain("</blockquote>");
    });
  });

  describe("unordered lists", () => {
    it("renders ul tokens to ul/li elements", () => {
      const tokens: BlockToken[] = [
        {
          type: "ul",
          items: [{ content: "Item one" }, { content: "Item two" }, { content: "Item three" }],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>");
    });
  });

  describe("ordered lists", () => {
    it("renders ol tokens to ol/li elements", () => {
      const tokens: BlockToken[] = [
        {
          type: "ol",
          start: 1,
          items: [{ content: "First" }, { content: "Second" }],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<ol><li>First</li><li>Second</li></ol>");
    });

    it("renders ordered list with start != 1 using start attribute", () => {
      const tokens: BlockToken[] = [
        {
          type: "ol",
          start: 5,
          items: [{ content: "Fifth item" }, { content: "Sixth item" }],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe('<ol start="5"><li>Fifth item</li><li>Sixth item</li></ol>');
    });
  });

  describe("task lists", () => {
    it("renders task_list tokens with checkboxes", () => {
      const tokens: BlockToken[] = [
        {
          type: "task_list",
          items: [
            { checked: false, content: "Unchecked task" },
            { checked: true, content: "Checked task" },
          ],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toContain('class="task-list"');
      expect(result).toContain('<input type="checkbox" disabled />');
      expect(result).toContain('<input type="checkbox" checked disabled />');
    });
  });

  describe("tables", () => {
    it("renders table tokens with thead/tbody structure", () => {
      const tokens: BlockToken[] = [
        {
          type: "table",
          headers: ["Name", "Value"],
          alignments: [null, null],
          rows: [["foo", "bar"]],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toContain("<table>");
      expect(result).toContain("<thead><tr>");
      expect(result).toContain("<th>Name</th>");
      expect(result).toContain("<th>Value</th>");
      expect(result).toContain("</tr></thead>");
      expect(result).toContain("<tbody>");
      expect(result).toContain("<td>foo</td>");
      expect(result).toContain("<td>bar</td>");
      expect(result).toContain("</tbody></table>");
    });

    it("renders table with alignment styles", () => {
      const tokens: BlockToken[] = [
        {
          type: "table",
          headers: ["Left", "Center", "Right"],
          alignments: ["left", "center", "right"],
          rows: [["a", "b", "c"]],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toContain('style="text-align: left"');
      expect(result).toContain('style="text-align: center"');
      expect(result).toContain('style="text-align: right"');
    });
  });

  describe("definition lists", () => {
    it("renders dl tokens to dl/dt/dd elements", () => {
      const tokens: BlockToken[] = [
        {
          type: "dl",
          items: [
            { term: "Term 1", definitions: ["Definition 1a", "Definition 1b"] },
            { term: "Term 2", definitions: ["Definition 2"] },
          ],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe(
        "<dl>" +
          "<dt>Term 1</dt><dd>Definition 1a</dd><dd>Definition 1b</dd>" +
          "<dt>Term 2</dt><dd>Definition 2</dd>" +
          "</dl>"
      );
    });

    it("parses inline markdown in definition list terms and definitions", () => {
      const tokens: BlockToken[] = [
        {
          type: "dl",
          items: [{ term: "**Bold term**", definitions: ["*italic def*"] }],
        },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toContain("<dt><strong>Bold term</strong></dt>");
      expect(result).toContain("<dd><em>italic def</em></dd>");
    });
  });

  describe("horizontal rules", () => {
    it("renders hr tokens to self-closing hr tag", () => {
      const tokens: BlockToken[] = [{ type: "hr" }];
      expect(renderTokens(tokens, true)).toBe("<hr />");
    });
  });

  describe("paragraphs", () => {
    it("renders paragraph tokens to p elements with inline parsing", () => {
      const tokens: BlockToken[] = [{ type: "paragraph", content: "Hello **world**" }];
      expect(renderTokens(tokens, true)).toBe("<p>Hello <strong>world</strong></p>");
    });

    it("converts newlines to br within paragraph content", () => {
      const tokens: BlockToken[] = [
        { type: "paragraph", content: "Line one\nLine two\nLine three" },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<p>Line one<br />Line two<br />Line three</p>");
    });

    it("renders plain text paragraph without modification", () => {
      const tokens: BlockToken[] = [{ type: "paragraph", content: "Just plain text" }];
      expect(renderTokens(tokens, true)).toBe("<p>Just plain text</p>");
    });
  });

  describe("multiple tokens", () => {
    it("joins multiple tokens with newline separators", () => {
      const tokens: BlockToken[] = [
        { type: "heading", level: 1, content: "Title" },
        { type: "paragraph", content: "Body text" },
      ];
      const result = renderTokens(tokens, true);
      expect(result).toBe("<h1>Title</h1>\n<p>Body text</p>");
    });

    it("renders a complex document with various token types", () => {
      const tokens: BlockToken[] = [
        { type: "heading", level: 1, content: "Title" },
        { type: "paragraph", content: "Intro paragraph" },
        { type: "hr" },
        {
          type: "ul",
          items: [{ content: "Item A" }, { content: "Item B" }],
        },
      ];
      const result = renderTokens(tokens, true);
      const parts = result.split("\n");
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe("<h1>Title</h1>");
      expect(parts[1]).toBe("<p>Intro paragraph</p>");
      expect(parts[2]).toBe("<hr />");
      expect(parts[3]).toBe("<ul><li>Item A</li><li>Item B</li></ul>");
    });

    it("returns empty string for empty token array", () => {
      expect(renderTokens([], true)).toBe("");
    });
  });

  describe("sanitization", () => {
    it("escapes HTML in paragraph content when sanitize is true", () => {
      const tokens: BlockToken[] = [
        { type: "paragraph", content: '<script>alert("xss")</script>' },
      ];
      const result = renderTokens(tokens, true);
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("does not escape HTML in paragraph content when sanitize is false", () => {
      const tokens: BlockToken[] = [{ type: "paragraph", content: "<b>bold</b>" }];
      const result = renderTokens(tokens, false);
      expect(result).toContain("<b>bold</b>");
    });
  });
});
