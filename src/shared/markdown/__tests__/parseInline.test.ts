import { describe, it, expect, beforeEach } from "vitest";
import { parseInline } from "../parseInline";
import { resetParserState, setLinkRef, setFootnote } from "../state";

describe("parseInline", () => {
	beforeEach(() => {
		resetParserState();
	});

	describe("empty/falsy input", () => {
		it("returns empty string for empty string input", () => {
			expect(parseInline("")).toBe("");
		});

		it("returns empty string for undefined input", () => {
			// @ts-expect-error testing falsy input
			expect(parseInline(undefined)).toBe("");
		});

		it("returns empty string for null input", () => {
			// @ts-expect-error testing falsy input
			expect(parseInline(null)).toBe("");
		});
	});

	describe("HTML escaping", () => {
		it("escapes < > & \" ' when sanitize is true (default)", () => {
			expect(parseInline('<b>"hi"</b> & \'there\'')).toBe(
				"&lt;b&gt;&quot;hi&quot;&lt;/b&gt; &amp; &#039;there&#039;"
			);
		});

		it("does not escape HTML when sanitize is false", () => {
			expect(parseInline("<b>bold</b>", false)).toBe("<b>bold</b>");
		});
	});

	describe("bold", () => {
		it("converts **text** to <strong>text</strong>", () => {
			expect(parseInline("**bold**")).toBe("<strong>bold</strong>");
		});

		it("converts __text__ to <strong>text</strong>", () => {
			expect(parseInline("__bold__")).toBe("<strong>bold</strong>");
		});

		it("handles bold with surrounding text", () => {
			expect(parseInline("before **bold** after")).toBe("before <strong>bold</strong> after");
		});
	});

	describe("italic", () => {
		it("converts *text* to <em>text</em>", () => {
			expect(parseInline("*italic*")).toBe("<em>italic</em>");
		});

		it("converts _text_ to <em>text</em> at word boundaries", () => {
			expect(parseInline("_italic_")).toBe("<em>italic</em>");
		});

		it("converts _text_ with surrounding spaces", () => {
			expect(parseInline("before _italic_ after")).toBe("before <em>italic</em> after");
		});
	});

	describe("bold + italic", () => {
		it("converts ***text*** to <strong><em>text</em></strong>", () => {
			expect(parseInline("***bold italic***")).toBe("<strong><em>bold italic</em></strong>");
		});

		it("converts ___text___ to <strong><em>text</em></strong>", () => {
			expect(parseInline("___bold italic___")).toBe("<strong><em>bold italic</em></strong>");
		});
	});

	describe("inline code", () => {
		it("converts `code` to <code>code</code>", () => {
			expect(parseInline("`code`")).toBe("<code>code</code>");
		});

		it("preserves content inside inline code", () => {
			expect(parseInline("`var x = 1`")).toBe("<code>var x = 1</code>");
		});
	});

	describe("strikethrough", () => {
		it("converts ~~text~~ to <del>text</del>", () => {
			expect(parseInline("~~deleted~~")).toBe("<del>deleted</del>");
		});

		it("handles strikethrough with surrounding text", () => {
			expect(parseInline("before ~~deleted~~ after")).toBe("before <del>deleted</del> after");
		});
	});

	describe("highlight", () => {
		it("converts ==text== to <mark>text</mark>", () => {
			expect(parseInline("==highlighted==")).toBe("<mark>highlighted</mark>");
		});
	});

	describe("superscript", () => {
		it("converts X^2^ to X<sup>2</sup>", () => {
			expect(parseInline("X^2^")).toBe("X<sup>2</sup>");
		});

		it("handles superscript with text content", () => {
			expect(parseInline("E=mc^2^")).toBe("E=mc<sup>2</sup>");
		});
	});

	describe("subscript", () => {
		it("converts H~2~O to H<sub>2</sub>O", () => {
			expect(parseInline("H~2~O")).toBe("H<sub>2</sub>O");
		});
	});

	describe("links", () => {
		it("converts [text](url) to an anchor tag", () => {
			expect(parseInline("[click here](https://example.com)")).toBe(
				'<a href="https://example.com">click here</a>'
			);
		});

		it("handles links with surrounding text", () => {
			expect(parseInline("Visit [our site](https://example.com) today")).toBe(
				'Visit <a href="https://example.com">our site</a> today'
			);
		});
	});

	describe("images", () => {
		it("converts ![alt](url) to an img tag", () => {
			expect(parseInline("![logo](https://example.com/logo.png)")).toBe(
				'<img src="https://example.com/logo.png" alt="logo" />'
			);
		});

		it("handles images with empty alt text", () => {
			expect(parseInline("![](https://example.com/img.png)")).toBe(
				'<img src="https://example.com/img.png" alt="" />'
			);
		});
	});

	describe("hard line breaks", () => {
		it("converts two trailing spaces + newline to <br />", () => {
			expect(parseInline("line one  \nline two")).toBe("line one<br />\nline two");
		});

		it("converts more than two trailing spaces + newline to <br />", () => {
			expect(parseInline("line one    \nline two")).toBe("line one<br />\nline two");
		});

		it("does not convert single trailing space + newline", () => {
			expect(parseInline("line one \nline two")).toBe("line one \nline two");
		});
	});

	describe("autolinks", () => {
		it("converts <https://example.com> (HTML-escaped) to an anchor tag", () => {
			// When sanitize=true, < and > become &lt; and &gt; before parsing
			expect(parseInline("<https://example.com>")).toBe(
				'<a href="https://example.com">https://example.com</a>'
			);
		});

		it("converts <http://example.com> to an anchor tag", () => {
			expect(parseInline("<http://example.com>")).toBe(
				'<a href="http://example.com">http://example.com</a>'
			);
		});

		it("converts email autolinks to mailto anchor tags", () => {
			expect(parseInline("<user@example.com>")).toBe(
				'<a href="mailto:user@example.com">user@example.com</a>'
			);
		});
	});

	describe("escape sequences", () => {
		it("converts \\* to literal * without bold formatting", () => {
			expect(parseInline("\\*not bold\\*")).toBe("*not bold*");
		});

		it("converts \\_ to literal _", () => {
			expect(parseInline("\\_not italic\\_")).toBe("_not italic_");
		});

		it("converts \\~ to literal ~", () => {
			expect(parseInline("\\~not strikethrough\\~")).toBe("~not strikethrough~");
		});

		it("converts \\` to literal `", () => {
			expect(parseInline("\\`not code\\`")).toBe("`not code`");
		});

		it("converts \\[ to literal [", () => {
			expect(parseInline("\\[not a link")).toBe("[not a link");
		});
	});

	describe("hex color preview", () => {
		it("adds color-preview span for 6-digit hex color", () => {
			const result = parseInline("#ff0000");
			expect(result).toContain('class="color-preview"');
			expect(result).toContain('class="color-swatch"');
			expect(result).toContain('style="background-color: #ff0000"');
			expect(result).toContain("#ff0000");
		});

		it("adds color-preview span for 3-digit hex color", () => {
			const result = parseInline("#f00");
			expect(result).toContain('class="color-preview"');
			expect(result).toContain('style="background-color: #f00"');
		});

		it("does not add color-preview for non-hex strings after #", () => {
			const result = parseInline("#heading");
			expect(result).not.toContain("color-preview");
		});
	});

	describe("reference-style links", () => {
		it("resolves full reference [text][ref] when link ref is set", () => {
			setLinkRef("example", { url: "https://example.com" });
			expect(parseInline("[click here][example]")).toBe(
				'<a href="https://example.com">click here</a>'
			);
		});

		it("resolves full reference with title", () => {
			setLinkRef("example", { url: "https://example.com", title: "Example" });
			expect(parseInline("[click][example]")).toBe(
				'<a href="https://example.com" title="Example">click</a>'
			);
		});

		it("keeps original text when reference is not defined", () => {
			expect(parseInline("[text][undefined-ref]")).toBe("[text][undefined-ref]");
		});

		it("resolves collapsed reference [text][] using text as id", () => {
			setLinkRef("example", { url: "https://example.com" });
			expect(parseInline("[example][]")).toBe(
				'<a href="https://example.com">example</a>'
			);
		});

		it("resolves shortcut reference [ref] alone when link ref is set", () => {
			setLinkRef("example", { url: "https://example.com" });
			expect(parseInline("[example]")).toBe(
				'<a href="https://example.com">example</a>'
			);
		});

		it("resolves reference links case-insensitively", () => {
			setLinkRef("example", { url: "https://example.com" });
			expect(parseInline("[click][EXAMPLE]")).toBe(
				'<a href="https://example.com">click</a>'
			);
		});

		it("keeps shortcut reference unchanged when ref is not defined", () => {
			expect(parseInline("[no-ref]")).toBe("[no-ref]");
		});
	});

	describe("footnote references", () => {
		it("resolves [^id] when footnote is defined", () => {
			setFootnote("note1", "This is a footnote");
			const result = parseInline("[^note1]");
			expect(result).toContain('class="footnote-ref"');
			expect(result).toContain('href="#fn-note1"');
			expect(result).toContain('id="fnref-note1"');
			expect(result).toContain("[1]");
		});

		it("uses the correct footnote index", () => {
			setFootnote("first", "First footnote");
			setFootnote("second", "Second footnote");
			const result = parseInline("[^second]");
			expect(result).toContain("[2]");
		});

		it("keeps [^id] unchanged when footnote is not defined", () => {
			expect(parseInline("[^undefined]")).toBe("[^undefined]");
		});
	});

	describe("multiple inline elements", () => {
		it("handles bold and italic in one string", () => {
			expect(parseInline("**bold** and *italic*")).toBe(
				"<strong>bold</strong> and <em>italic</em>"
			);
		});

		it("handles code and link in one string", () => {
			expect(parseInline("`code` and [link](https://example.com)")).toBe(
				'<code>code</code> and <a href="https://example.com">link</a>'
			);
		});

		it("handles strikethrough and highlight in one string", () => {
			expect(parseInline("~~deleted~~ and ==highlighted==")).toBe(
				"<del>deleted</del> and <mark>highlighted</mark>"
			);
		});

		it("handles superscript and subscript in one string", () => {
			expect(parseInline("x^2^ + H~2~O")).toBe(
				"x<sup>2</sup> + H<sub>2</sub>O"
			);
		});
	});

	describe("plain text passthrough", () => {
		it("returns plain text unchanged", () => {
			expect(parseInline("hello world")).toBe("hello world");
		});

		it("returns numbers unchanged", () => {
			expect(parseInline("12345")).toBe("12345");
		});
	});
});
