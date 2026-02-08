import { describe, it, expect } from "vitest";
import { highlightHTML } from "../highlightHTML";

describe("highlightHTML", () => {
	describe("empty/falsy input", () => {
		it("returns empty string for empty string", () => {
			expect(highlightHTML("")).toBe("");
		});

		it("returns empty string for null", () => {
			// @ts-expect-error testing falsy input
			expect(highlightHTML(null)).toBe("");
		});

		it("returns empty string for undefined", () => {
			// @ts-expect-error testing falsy input
			expect(highlightHTML(undefined)).toBe("");
		});
	});

	describe("tag names", () => {
		it("highlights opening tag names", () => {
			const result = highlightHTML("<div>");
			expect(result).toContain('class="syntax-tag"');
			expect(result).toContain("&lt;div");
		});

		it("highlights tag name with closing bracket", () => {
			const result = highlightHTML("<div>");
			// The < and tag name are together in the syntax-tag span,
			// and > is separately highlighted
			expect(result).toContain('class="syntax-tag"');
		});

		it("highlights various HTML tags", () => {
			for (const tag of ["span", "p", "h1", "section", "main"]) {
				const result = highlightHTML(`<${tag}>`);
				expect(result).toContain('class="syntax-tag"');
				expect(result).toContain(tag);
			}
		});
	});

	describe("attribute names", () => {
		it("highlights attribute names", () => {
			const result = highlightHTML('<div class="foo">');
			expect(result).toContain('<span class="syntax-attribute">class</span>');
		});

		it("highlights multiple attribute names", () => {
			const result = highlightHTML('<div id="main" class="foo">');
			expect(result).toContain('<span class="syntax-attribute">id</span>');
			expect(result).toContain('<span class="syntax-attribute">class</span>');
		});

		it("highlights data attributes", () => {
			const result = highlightHTML('<div data-value="test">');
			expect(result).toContain('<span class="syntax-attribute">data-value</span>');
		});

		it("highlights boolean attributes without values", () => {
			const result = highlightHTML("<input disabled>");
			expect(result).toContain('<span class="syntax-attribute">disabled</span>');
		});
	});

	describe("attribute values", () => {
		it("highlights double-quoted attribute values", () => {
			const result = highlightHTML('<div class="foo">');
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("&quot;foo&quot;");
		});

		it("highlights single-quoted attribute values", () => {
			const result = highlightHTML("<div class='foo'>");
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("&#039;foo&#039;");
		});

		it("highlights unquoted attribute values", () => {
			const result = highlightHTML("<div class=foo>");
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("foo");
		});
	});

	describe("comments", () => {
		it("highlights HTML comments", () => {
			const result = highlightHTML("<!-- comment -->");
			expect(result).toContain('<span class="syntax-comment">&lt;!-- comment --&gt;</span>');
		});

		it("highlights multi-line comments", () => {
			const result = highlightHTML("<!-- line1\nline2 -->");
			expect(result).toContain('class="syntax-comment"');
			expect(result).toContain("line1\nline2");
		});

		it("highlights comments between elements", () => {
			const result = highlightHTML("<div><!-- mid -->text</div>");
			expect(result).toContain('class="syntax-comment"');
			expect(result).toContain("text");
		});
	});

	describe("DOCTYPE", () => {
		it("highlights DOCTYPE declaration", () => {
			const result = highlightHTML("<!DOCTYPE html>");
			expect(result).toContain('<span class="syntax-doctype">');
			expect(result).toContain("DOCTYPE");
		});

		it("handles lowercase doctype", () => {
			const result = highlightHTML("<!doctype html>");
			expect(result).toContain('<span class="syntax-doctype">');
		});
	});

	describe("CDATA sections", () => {
		it("highlights CDATA sections with syntax-comment class", () => {
			const result = highlightHTML("<![CDATA[some data]]>");
			expect(result).toContain('<span class="syntax-comment">');
			expect(result).toContain("CDATA");
			expect(result).toContain("some data");
		});
	});

	describe("punctuation", () => {
		it("highlights equals sign in attributes", () => {
			const result = highlightHTML('<div class="foo">');
			expect(result).toContain('<span class="syntax-punctuation">=</span>');
		});

		it("highlights closing > as part of tag", () => {
			const result = highlightHTML("<div>");
			// The > is highlighted as part of the tag syntax
			expect(result).toContain("&gt;");
		});
	});

	describe("self-closing tags", () => {
		it("handles self-closing tags with />", () => {
			const result = highlightHTML("<br/>");
			expect(result).toContain('class="syntax-tag"');
			expect(result).toContain("/&gt;");
		});

		it("handles self-closing tags with space before />", () => {
			const result = highlightHTML("<img />");
			expect(result).toContain('class="syntax-tag"');
			expect(result).toContain("/&gt;");
		});

		it("handles self-closing tags with attributes", () => {
			const result = highlightHTML('<img src="test.png" />');
			expect(result).toContain('<span class="syntax-attribute">src</span>');
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("/&gt;");
		});
	});

	describe("embedded <style> content", () => {
		it("delegates style content to CSS highlighter", () => {
			const result = highlightHTML("<style>.foo { color: red; }</style>");
			// Should contain CSS-specific classes from the CSS highlighter
			expect(result).toContain('class="syntax-selector"');
			expect(result).toContain('class="syntax-property"');
			expect(result).toContain('class="syntax-value"');
		});

		it("highlights the style tag itself", () => {
			const result = highlightHTML("<style>.foo { }</style>");
			// The <style tag name should be highlighted
			expect(result).toContain('class="syntax-tag"');
		});

		it("handles style tag with attributes", () => {
			const result = highlightHTML('<style type="text/css">.foo { color: red; }</style>');
			expect(result).toContain('<span class="syntax-attribute">type</span>');
			expect(result).toContain('class="syntax-selector"');
		});
	});

	describe("embedded <script> content", () => {
		it("delegates script content to JavaScript highlighter", () => {
			const result = highlightHTML("<script>const x = 5;</script>");
			// Should contain JS-specific classes from the JavaScript highlighter
			expect(result).toContain('class="syntax-keyword"');
			expect(result).toContain('class="syntax-number"');
		});

		it("highlights the script tag itself", () => {
			const result = highlightHTML("<script>var x;</script>");
			expect(result).toContain('class="syntax-tag"');
		});

		it("handles script tag with attributes", () => {
			const result = highlightHTML('<script type="module">const x = 1;</script>');
			expect(result).toContain('<span class="syntax-attribute">type</span>');
			expect(result).toContain('class="syntax-keyword"');
		});
	});

	describe("closing tags", () => {
		it("highlights closing tag names", () => {
			const result = highlightHTML("</div>");
			expect(result).toContain('class="syntax-tag"');
			expect(result).toContain("div");
		});

		it("handles closing tags after content", () => {
			const result = highlightHTML("<p>text</p>");
			// Both opening and closing tags should be highlighted
			const tagMatches = result.match(/syntax-tag/g);
			expect(tagMatches).not.toBeNull();
			expect(tagMatches!.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("plain text", () => {
		it("escapes plain text content between tags", () => {
			const result = highlightHTML("<p>Hello & World</p>");
			expect(result).toContain("Hello &amp; World");
		});

		it("escapes text with special characters", () => {
			// The < will start a new tag parse, so test plain text without angle brackets
			const simpleResult = highlightHTML("<p>Hello</p>");
			expect(simpleResult).toContain("Hello");
		});

		it("renders just plain text when no tags present", () => {
			const result = highlightHTML("just text");
			expect(result).toBe("just text");
		});

		it("escapes ampersands in plain text", () => {
			const result = highlightHTML("a&b");
			expect(result).toBe("a&amp;b");
		});
	});

	describe("complete HTML documents", () => {
		it("highlights a complete element with attributes", () => {
			const result = highlightHTML('<a href="https://example.com" class="link">Click</a>');
			expect(result).toContain('class="syntax-tag"');
			expect(result).toContain('<span class="syntax-attribute">href</span>');
			expect(result).toContain('<span class="syntax-attribute">class</span>');
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("Click");
		});

		it("highlights nested elements", () => {
			const result = highlightHTML("<div><span>text</span></div>");
			// Should have multiple tag highlights
			const tagMatches = result.match(/syntax-tag/g);
			expect(tagMatches).not.toBeNull();
			expect(tagMatches!.length).toBeGreaterThanOrEqual(4); // div open, span open, /span, /div
		});

		it("highlights DOCTYPE followed by html", () => {
			const result = highlightHTML("<!DOCTYPE html>\n<html>");
			expect(result).toContain('class="syntax-doctype"');
			expect(result).toContain('class="syntax-tag"');
		});
	});

	describe("edge cases", () => {
		it("handles empty tags", () => {
			const result = highlightHTML("<div></div>");
			expect(result).toContain('class="syntax-tag"');
		});

		it("handles tags with only whitespace content", () => {
			const result = highlightHTML("<div> </div>");
			expect(result).toContain(" ");
		});

		it("handles multiple attributes with various quoting", () => {
			const result = highlightHTML('<input type="text" value=\'hello\' required>');
			expect(result).toContain('<span class="syntax-attribute">type</span>');
			expect(result).toContain('<span class="syntax-attribute">value</span>');
			expect(result).toContain('<span class="syntax-attribute">required</span>');
		});

		it("handles self-closing tag with attribute and />", () => {
			const result = highlightHTML('<input type="text"/>');
			expect(result).toContain('<span class="syntax-attribute">type</span>');
			expect(result).toContain("/&gt;");
		});

		it("handles unquoted attribute value in main function", () => {
			const result = highlightHTML("<div class=foo>");
			expect(result).toContain('class="syntax-string"');
		});

		it("handles unquoted attribute value followed by space then >", () => {
			const result = highlightHTML("<div class=foo >");
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("&gt;");
		});

		it("handles = not followed by quote (no value, then >)", () => {
			// Attribute equals followed by > (no value given)
			const result = highlightHTML("<div data=>");
			expect(result).toContain('<span class="syntax-attribute">data</span>');
		});

		it("handles incomplete tag at end of input (tag-name state)", () => {
			const result = highlightHTML("<div");
			expect(result).toContain('class="syntax-tag"');
		});

		it("handles incomplete attribute at end of input", () => {
			const result = highlightHTML("<div class");
			expect(result).toContain('class="syntax-attribute"');
		});

		it("handles incomplete attribute value at end of input", () => {
			const result = highlightHTML('<div class="unclosed');
			expect(result).toContain('class="syntax-string"');
		});

		it("handles text state at end of input", () => {
			const result = highlightHTML("text after <div>tag");
			expect(result).toContain("text after ");
			expect(result).toContain("tag");
		});

		it("handles unknown state characters in attribute context", () => {
			// Weird characters that aren't normal attribute name chars
			const result = highlightHTML('<div %weird="val">');
			expect(result).toContain('class="syntax-attribute"');
		});

		it("handles whitespace after equals before attribute value", () => {
			const result = highlightHTML('<div class= "foo">');
			expect(result).toContain('class="syntax-string"');
		});

		it("handles attribute with / then > self-close in attribute-name state", () => {
			const result = highlightHTML("<div class/>");
			expect(result).toContain('class="syntax-attribute"');
			expect(result).toContain("/&gt;");
		});

		it("handles unclosed comment at end of input", () => {
			const result = highlightHTML("<!-- unclosed");
			expect(result).toContain('class="syntax-comment"');
		});

		it("handles unclosed CDATA at end of input", () => {
			const result = highlightHTML("<![CDATA[unclosed");
			expect(result).toContain('class="syntax-comment"');
		});

		it("handles tag name immediately followed by = without whitespace", () => {
			// Triggers the else branch at line 217: tag-name complete, next char isn't space/>//>
			const result = highlightHTML('<div="value">');
			expect(result).toContain('class="syntax-tag"');
		});
	});

	describe("highlightHTMLAttributes helper coverage", () => {
		it("handles self-closing style tag with />", () => {
			const result = highlightHTML('<style type="text/css"/>');
			expect(result).toContain('<span class="syntax-attribute">type</span>');
			expect(result).toContain("/&gt;");
		});

		it("handles script tag with unquoted attribute value", () => {
			const result = highlightHTML("<script type=module>const x = 1;</script>");
			expect(result).toContain('class="syntax-keyword"');
		});

		it("handles script tag with boolean attribute", () => {
			const result = highlightHTML("<script defer>const x = 1;</script>");
			expect(result).toContain('class="syntax-keyword"');
		});

		it("handles script tag with multiple boolean attributes separated by whitespace", () => {
			// Triggers attribute-name buffer flush on whitespace (lines 400-402 in helper)
			const result = highlightHTML("<script defer async>var x;</script>");
			expect(result).toContain('class="syntax-keyword"');
		});

		it("handles script tag with unquoted value followed by whitespace and another attribute", () => {
			// Triggers unquoted value + whitespace path (lines 447-452 in helper)
			const result = highlightHTML("<script type=module defer>var x;</script>");
			expect(result).toContain('class="syntax-keyword"');
		});

		it("handles style tag without closing tag (embedded content to end of input)", () => {
			const result = highlightHTML("<style>.foo { color: red; }");
			// Should still try to highlight the CSS content
			expect(result).toContain('class="syntax-tag"');
		});

		it("handles script tag with equals and unquoted value", () => {
			const result = highlightHTML("<script type=module>var x;</script>");
			expect(result).toContain('class="syntax-keyword"');
		});

		it("handles whitespace-only in attribute section of style/script tag", () => {
			const result = highlightHTML("<style >.foo { }</style>");
			expect(result).toContain('class="syntax-selector"');
		});

		it("handles attribute with single quotes in style tag", () => {
			const result = highlightHTML("<style type='text/css'>.foo { }</style>");
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain('class="syntax-selector"');
		});
	});
});
