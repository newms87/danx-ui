import { describe, it, expect } from "vitest";
import {
  htmlToMarkdown,
  escapeMarkdownChars,
  isHeadingElement,
  getHeadingLevel,
  convertHeading,
} from "../index";

describe("htmlToMarkdown", () => {
  describe("headings", () => {
    it("converts h1 to markdown", () => {
      expect(htmlToMarkdown("<h1>Title</h1>")).toBe("# Title");
    });

    it("converts h2 to markdown", () => {
      expect(htmlToMarkdown("<h2>Subtitle</h2>")).toBe("## Subtitle");
    });

    it("converts h3 to markdown", () => {
      expect(htmlToMarkdown("<h3>Section</h3>")).toBe("### Section");
    });

    it("converts h4 to markdown", () => {
      expect(htmlToMarkdown("<h4>Subsection</h4>")).toBe("#### Subsection");
    });

    it("converts h5 to markdown", () => {
      expect(htmlToMarkdown("<h5>Minor Section</h5>")).toBe("##### Minor Section");
    });

    it("converts h6 to markdown", () => {
      expect(htmlToMarkdown("<h6>Smallest Heading</h6>")).toBe("###### Smallest Heading");
    });

    it("handles empty headings", () => {
      expect(htmlToMarkdown("<h1></h1>")).toBe("");
    });

    it("handles headings with whitespace only", () => {
      expect(htmlToMarkdown("<h1>   </h1>")).toBe("");
    });
  });

  describe("paragraphs", () => {
    it("converts single paragraph", () => {
      expect(htmlToMarkdown("<p>Text</p>")).toBe("Text");
    });

    it("converts multiple paragraphs", () => {
      expect(htmlToMarkdown("<p>First paragraph</p><p>Second paragraph</p>")).toBe(
        "First paragraph\n\nSecond paragraph"
      );
    });

    it("handles empty paragraphs", () => {
      expect(htmlToMarkdown("<p></p>")).toBe("");
    });
  });

  describe("inline formatting", () => {
    it("converts strong to bold", () => {
      expect(htmlToMarkdown("<p><strong>bold</strong></p>")).toBe("**bold**");
    });

    it("converts b to bold", () => {
      expect(htmlToMarkdown("<p><b>bold</b></p>")).toBe("**bold**");
    });

    it("converts em to italic", () => {
      expect(htmlToMarkdown("<p><em>italic</em></p>")).toBe("*italic*");
    });

    it("converts i to italic", () => {
      expect(htmlToMarkdown("<p><i>italic</i></p>")).toBe("*italic*");
    });

    it("converts code to inline code", () => {
      expect(htmlToMarkdown("<p><code>code</code></p>")).toBe("`code`");
    });

    it("converts del to strikethrough", () => {
      expect(htmlToMarkdown("<p><del>strike</del></p>")).toBe("~~strike~~");
    });

    it("converts s to strikethrough", () => {
      expect(htmlToMarkdown("<p><s>strike</s></p>")).toBe("~~strike~~");
    });

    it("converts mark to highlight", () => {
      expect(htmlToMarkdown("<p><mark>highlight</mark></p>")).toBe("==highlight==");
    });

    it("converts sup to superscript", () => {
      expect(htmlToMarkdown("<p><sup>superscript</sup></p>")).toBe("^superscript^");
    });

    it("converts sub to subscript", () => {
      expect(htmlToMarkdown("<p><sub>subscript</sub></p>")).toBe("~subscript~");
    });

    it("handles nested bold and italic", () => {
      expect(htmlToMarkdown("<p><strong><em>bold italic</em></strong></p>")).toBe(
        "***bold italic***"
      );
    });

    it("handles italic inside bold", () => {
      expect(htmlToMarkdown("<p><strong>bold <em>and italic</em> text</strong></p>")).toBe(
        "**bold *and italic* text**"
      );
    });

    it("handles bold inside italic", () => {
      expect(htmlToMarkdown("<p><em>italic <strong>and bold</strong> text</em></p>")).toBe(
        "*italic **and bold** text*"
      );
    });

    it("handles mixed formatting in paragraph", () => {
      expect(htmlToMarkdown("<p>Normal <strong>bold</strong> and <em>italic</em> text</p>")).toBe(
        "Normal **bold** and *italic* text"
      );
    });

    it("skips empty formatting elements", () => {
      expect(htmlToMarkdown("<p><strong></strong></p>")).toBe("");
      expect(htmlToMarkdown("<p><em></em></p>")).toBe("");
      expect(htmlToMarkdown("<p><del></del></p>")).toBe("");
    });
  });

  describe("lists", () => {
    describe("unordered lists", () => {
      it("converts simple unordered list", () => {
        const result = htmlToMarkdown("<ul><li>item</li></ul>");
        expect(result).toBe("- item");
      });

      it("converts unordered list with multiple items", () => {
        const result = htmlToMarkdown("<ul><li>first</li><li>second</li><li>third</li></ul>");
        expect(result).toContain("- first");
        expect(result).toContain("- second");
        expect(result).toContain("- third");
      });

      it("handles list items with inline formatting", () => {
        const result = htmlToMarkdown("<ul><li><strong>bold</strong> item</li></ul>");
        expect(result).toBe("- **bold** item");
      });
    });

    describe("ordered lists", () => {
      it("converts simple ordered list", () => {
        const result = htmlToMarkdown("<ol><li>item</li></ol>");
        expect(result).toBe("1. item");
      });

      it("converts ordered list with multiple items", () => {
        const result = htmlToMarkdown("<ol><li>first</li><li>second</li><li>third</li></ol>");
        expect(result).toContain("1. first");
        expect(result).toContain("2. second");
        expect(result).toContain("3. third");
      });
    });

    describe("nested lists", () => {
      it("handles nested unordered list", () => {
        const html = "<ul><li>parent<ul><li>child</li></ul></li></ul>";
        const result = htmlToMarkdown(html);
        expect(result).toContain("- parent");
        expect(result).toContain("  - child");
      });

      it("handles nested ordered list inside unordered", () => {
        const html = "<ul><li>parent<ol><li>numbered child</li></ol></li></ul>";
        const result = htmlToMarkdown(html);
        expect(result).toContain("- parent");
        expect(result).toContain("  1. numbered child");
      });
    });
  });

  describe("links and images", () => {
    it("converts link with text", () => {
      expect(htmlToMarkdown('<p><a href="https://example.com">link text</a></p>')).toBe(
        "[link text](https://example.com)"
      );
    });

    it("handles link with empty href", () => {
      expect(htmlToMarkdown('<p><a href="">link text</a></p>')).toBe("[link text]()");
    });

    it("handles link with formatted text", () => {
      expect(
        htmlToMarkdown('<p><a href="https://example.com"><strong>bold link</strong></a></p>')
      ).toBe("[**bold link**](https://example.com)");
    });

    it("converts image with alt text", () => {
      expect(htmlToMarkdown('<img src="https://example.com/image.png" alt="alt text">')).toBe(
        "![alt text](https://example.com/image.png)"
      );
    });

    it("handles image with empty alt", () => {
      expect(htmlToMarkdown('<img src="https://example.com/image.png" alt="">')).toBe(
        "![](https://example.com/image.png)"
      );
    });

    it("handles image with no alt attribute", () => {
      expect(htmlToMarkdown('<img src="https://example.com/image.png">')).toBe(
        "![](https://example.com/image.png)"
      );
    });
  });

  describe("code blocks", () => {
    it("converts pre code block", () => {
      const result = htmlToMarkdown("<pre><code>const x = 1;</code></pre>");
      expect(result).toBe("```\nconst x = 1;\n```");
    });

    it("converts pre code block with language class", () => {
      const result = htmlToMarkdown(
        '<pre><code class="language-javascript">const x = 1;</code></pre>'
      );
      expect(result).toBe("```javascript\nconst x = 1;\n```");
    });

    it("handles multiline code block", () => {
      const result = htmlToMarkdown("<pre><code>line1\nline2\nline3</code></pre>");
      expect(result).toBe("```\nline1\nline2\nline3\n```");
    });

    it("handles pre without code element", () => {
      const result = htmlToMarkdown("<pre>plain preformatted text</pre>");
      expect(result).toBe("```\nplain preformatted text\n```");
    });
  });

  describe("blockquotes", () => {
    it("converts simple blockquote", () => {
      const result = htmlToMarkdown("<blockquote><p>quote text</p></blockquote>");
      expect(result).toContain("> quote text");
    });

    it("handles blockquote with multiple paragraphs", () => {
      const result = htmlToMarkdown("<blockquote><p>line 1</p><p>line 2</p></blockquote>");
      expect(result).toContain("> line 1");
      expect(result).toContain("> line 2");
    });
  });

  describe("horizontal rules", () => {
    it("converts hr element", () => {
      expect(htmlToMarkdown("<p>before</p><hr><p>after</p>")).toContain("---");
    });
  });

  describe("line breaks", () => {
    it("converts br to markdown line break", () => {
      const result = htmlToMarkdown("<p>line1<br>line2</p>");
      expect(result).toContain("line1");
      expect(result).toContain("line2");
    });
  });

  describe("tables", () => {
    it("converts simple table", () => {
      const html = `
				<table>
					<thead>
						<tr><th>Header 1</th><th>Header 2</th></tr>
					</thead>
					<tbody>
						<tr><td>Cell 1</td><td>Cell 2</td></tr>
					</tbody>
				</table>
			`;
      const result = htmlToMarkdown(html);
      expect(result).toContain("| Header 1 | Header 2 |");
      expect(result).toContain("| --- | --- |");
      expect(result).toContain("| Cell 1 | Cell 2 |");
    });

    it("handles table with center alignment", () => {
      const html = `
				<table>
					<thead>
						<tr><th style="text-align: center">Centered</th></tr>
					</thead>
					<tbody>
						<tr><td>Cell</td></tr>
					</tbody>
				</table>
			`;
      const result = htmlToMarkdown(html);
      expect(result).toContain(":---:");
    });

    it("handles table with right alignment", () => {
      const html = `
				<table>
					<thead>
						<tr><th style="text-align: right">Right</th></tr>
					</thead>
					<tbody>
						<tr><td>Cell</td></tr>
					</tbody>
				</table>
			`;
      const result = htmlToMarkdown(html);
      expect(result).toContain("---:");
    });

    it("handles table with inline formatting in cells", () => {
      const html = `
				<table>
					<thead>
						<tr><th><strong>Bold Header</strong></th></tr>
					</thead>
					<tbody>
						<tr><td><em>Italic cell</em></td></tr>
					</tbody>
				</table>
			`;
      const result = htmlToMarkdown(html);
      expect(result).toContain("**Bold Header**");
      expect(result).toContain("*Italic cell*");
    });
  });

  describe("zero-width space stripping", () => {
    it("removes zero-width spaces from text", () => {
      expect(htmlToMarkdown("<p>text\u200Bwith\u200Bspaces</p>")).toBe("textwithspaces");
    });

    it("removes zero-width spaces from formatted text", () => {
      expect(htmlToMarkdown("<p><strong>bold\u200B</strong> text</p>")).toBe("**bold** text");
    });
  });

  describe("div and span containers", () => {
    it("processes content inside div", () => {
      expect(htmlToMarkdown("<div><p>text in div</p></div>")).toBe("text in div");
    });

    it("processes content inside span", () => {
      expect(htmlToMarkdown("<p><span>text in span</span></p>")).toBe("text in span");
    });
  });

  describe("complex document structure", () => {
    it("handles mixed content types", () => {
      const html = `
				<h1>Document Title</h1>
				<p>Introduction paragraph with <strong>bold</strong> text.</p>
				<h2>Section</h2>
				<ul>
					<li>Item 1</li>
					<li>Item 2</li>
				</ul>
				<p>Conclusion.</p>
			`;
      const result = htmlToMarkdown(html);
      expect(result).toContain("# Document Title");
      expect(result).toContain("**bold**");
      expect(result).toContain("## Section");
      expect(result).toContain("- Item 1");
      expect(result).toContain("Conclusion");
    });

    it("normalizes excessive newlines", () => {
      const html = "<p>First</p><p></p><p></p><p>Second</p>";
      const result = htmlToMarkdown(html);
      // Should not have more than 2 consecutive newlines
      expect(result).not.toMatch(/\n{3,}/);
    });
  });

  describe("HTMLElement input", () => {
    it("accepts HTMLElement directly", () => {
      const container = document.createElement("div");
      container.innerHTML = "<p>Hello <strong>World</strong></p>";
      expect(htmlToMarkdown(container)).toBe("Hello **World**");
    });
  });
});

describe("escapeMarkdownChars", () => {
  it("escapes backslash", () => {
    expect(escapeMarkdownChars("test\\test")).toBe("test\\\\test");
  });

  it("escapes backtick", () => {
    expect(escapeMarkdownChars("test`test")).toBe("test\\`test");
  });

  it("escapes asterisk", () => {
    expect(escapeMarkdownChars("test*test")).toBe("test\\*test");
  });

  it("escapes underscore", () => {
    expect(escapeMarkdownChars("test_test")).toBe("test\\_test");
  });

  it("escapes square brackets", () => {
    expect(escapeMarkdownChars("[test]")).toBe("\\[test\\]");
  });

  it("escapes parentheses", () => {
    expect(escapeMarkdownChars("(test)")).toBe("\\(test\\)");
  });

  it("escapes hash", () => {
    expect(escapeMarkdownChars("#test")).toBe("\\#test");
  });

  it("escapes plus", () => {
    expect(escapeMarkdownChars("+test")).toBe("\\+test");
  });

  it("escapes hyphen", () => {
    expect(escapeMarkdownChars("-test")).toBe("\\-test");
  });

  it("escapes period", () => {
    expect(escapeMarkdownChars("1.test")).toBe("1\\.test");
  });

  it("escapes exclamation mark", () => {
    expect(escapeMarkdownChars("!test")).toBe("\\!test");
  });

  it("escapes curly braces", () => {
    expect(escapeMarkdownChars("{test}")).toBe("\\{test\\}");
  });

  it("handles multiple special characters", () => {
    expect(escapeMarkdownChars("*bold* and _italic_")).toBe("\\*bold\\* and \\_italic\\_");
  });

  it("handles text without special characters", () => {
    expect(escapeMarkdownChars("plain text")).toBe("plain text");
  });
});

describe("heading utilities", () => {
  describe("isHeadingElement", () => {
    it("returns true for h1-h6", () => {
      for (let i = 1; i <= 6; i++) {
        const el = document.createElement(`h${i}`);
        expect(isHeadingElement(el)).toBe(true);
      }
    });

    it("returns false for non-heading elements", () => {
      const elements = ["p", "div", "span", "h7", "header"];
      for (const tag of elements) {
        const el = document.createElement(tag);
        expect(isHeadingElement(el)).toBe(false);
      }
    });
  });

  describe("getHeadingLevel", () => {
    it("returns correct level for h1-h6", () => {
      for (let i = 1; i <= 6; i++) {
        const el = document.createElement(`h${i}`);
        expect(getHeadingLevel(el)).toBe(i);
      }
    });

    it("returns 0 for non-heading elements", () => {
      const el = document.createElement("p");
      expect(getHeadingLevel(el)).toBe(0);
    });
  });

  describe("convertHeading", () => {
    it("converts heading with proper prefix", () => {
      const h2 = document.createElement("h2");
      h2.textContent = "Test Heading";
      expect(convertHeading(h2)).toBe("## Test Heading\n\n");
    });

    it("returns empty string for non-heading", () => {
      const p = document.createElement("p");
      p.textContent = "Not a heading";
      expect(convertHeading(p)).toBe("");
    });

    it("returns empty string for empty heading", () => {
      const h1 = document.createElement("h1");
      h1.textContent = "";
      expect(convertHeading(h1)).toBe("");
    });

    it("trims whitespace from heading content", () => {
      const h1 = document.createElement("h1");
      h1.textContent = "  Trimmed  ";
      expect(convertHeading(h1)).toBe("# Trimmed\n\n");
    });
  });
});
