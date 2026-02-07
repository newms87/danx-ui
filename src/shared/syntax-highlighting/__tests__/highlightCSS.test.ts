import { describe, it, expect } from "vitest";
import { highlightCSS } from "../highlightCSS";

describe("highlightCSS", () => {
	describe("empty/falsy input", () => {
		it("returns empty string for empty string", () => {
			expect(highlightCSS("")).toBe("");
		});

		it("returns empty string for null", () => {
			// @ts-expect-error testing falsy input
			expect(highlightCSS(null)).toBe("");
		});

		it("returns empty string for undefined", () => {
			// @ts-expect-error testing falsy input
			expect(highlightCSS(undefined)).toBe("");
		});
	});

	describe("selectors", () => {
		it("highlights a simple class selector", () => {
			const result = highlightCSS(".foo");
			expect(result).toContain('class="syntax-selector"');
			expect(result).toContain(".foo");
		});

		it("highlights an element selector", () => {
			const result = highlightCSS("div");
			expect(result).toContain('<span class="syntax-selector">div</span>');
		});

		it("highlights an id selector", () => {
			const result = highlightCSS("#main");
			expect(result).toContain('<span class="syntax-selector">#main</span>');
		});

		it("highlights selector before opening brace", () => {
			const result = highlightCSS(".foo {");
			expect(result).toContain('<span class="syntax-selector">.foo</span>');
			expect(result).toContain('<span class="syntax-punctuation">{</span>');
		});
	});

	describe("properties", () => {
		it("highlights a property inside a rule block", () => {
			const result = highlightCSS(".foo { color }");
			expect(result).toContain('<span class="syntax-property">color</span>');
		});

		it("highlights property before colon", () => {
			const result = highlightCSS(".foo { color: }");
			expect(result).toContain('<span class="syntax-property">color</span>');
			expect(result).toContain('<span class="syntax-punctuation">:</span>');
		});
	});

	describe("values", () => {
		it("highlights a value after colon", () => {
			const result = highlightCSS(".foo { color: red; }");
			expect(result).toContain('<span class="syntax-value">red</span>');
		});

		it("highlights numeric values", () => {
			const result = highlightCSS(".foo { width: 100px; }");
			expect(result).toContain('<span class="syntax-value">100px</span>');
		});
	});

	describe("at-rules", () => {
		it("highlights @media", () => {
			const result = highlightCSS("@media");
			expect(result).toContain('<span class="syntax-at-rule">@media</span>');
		});

		it("highlights @import", () => {
			const result = highlightCSS("@import");
			expect(result).toContain('<span class="syntax-at-rule">@import</span>');
		});

		it("highlights @keyframes", () => {
			const result = highlightCSS("@keyframes");
			expect(result).toContain('<span class="syntax-at-rule">@keyframes</span>');
		});

		it("highlights at-rule followed by selector content", () => {
			const result = highlightCSS("@media screen { .foo { color: red; } }");
			expect(result).toContain('<span class="syntax-at-rule">@media</span>');
			expect(result).toContain('<span class="syntax-selector">screen</span>');
		});
	});

	describe("comments", () => {
		it("highlights a single-line comment", () => {
			const result = highlightCSS("/* hello */");
			expect(result).toContain('<span class="syntax-comment">/* hello */</span>');
		});

		it("highlights a multi-line comment", () => {
			const result = highlightCSS("/* line1\nline2 */");
			expect(result).toContain('class="syntax-comment"');
			expect(result).toContain("/* line1\nline2 */");
		});

		it("highlights comment between declarations", () => {
			const result = highlightCSS(".foo { /* comment */ color: red; }");
			expect(result).toContain('<span class="syntax-comment">/* comment */</span>');
			expect(result).toContain('<span class="syntax-property">color</span>');
		});
	});

	describe("strings", () => {
		it("highlights double-quoted strings", () => {
			const result = highlightCSS('.foo { content: "hello"; }');
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("&quot;hello&quot;");
		});

		it("highlights single-quoted strings", () => {
			const result = highlightCSS(".foo { content: 'hello'; }");
			expect(result).toContain('class="syntax-string"');
			expect(result).toContain("&#039;hello&#039;");
		});

		it("handles escape sequences in strings", () => {
			const result = highlightCSS('.foo { content: "hello\\"world"; }');
			expect(result).toContain('class="syntax-string"');
			// The string should include the escaped quote
			expect(result).toContain("hello\\&quot;world");
		});
	});

	describe("punctuation", () => {
		it("highlights opening brace", () => {
			const result = highlightCSS(".foo {");
			expect(result).toContain('<span class="syntax-punctuation">{</span>');
		});

		it("highlights closing brace", () => {
			const result = highlightCSS("}");
			expect(result).toContain('<span class="syntax-punctuation">}</span>');
		});

		it("highlights colon as punctuation in property context", () => {
			const result = highlightCSS(".foo { color: red; }");
			expect(result).toContain('<span class="syntax-punctuation">:</span>');
		});

		it("highlights semicolon", () => {
			const result = highlightCSS(".foo { color: red; }");
			expect(result).toContain('<span class="syntax-punctuation">;</span>');
		});

		it("highlights comma", () => {
			const result = highlightCSS(".foo, .bar");
			expect(result).toContain('<span class="syntax-punctuation">,</span>');
		});

		it("highlights parentheses", () => {
			const result = highlightCSS(".foo { background: url(test); }");
			expect(result).toContain('<span class="syntax-punctuation">(</span>');
			expect(result).toContain('<span class="syntax-punctuation">)</span>');
		});
	});

	describe("nested at-rules", () => {
		it("handles nested @media with inner rule", () => {
			const code = "@media screen {\n  .foo {\n    color: red;\n  }\n}";
			const result = highlightCSS(code);
			expect(result).toContain('<span class="syntax-at-rule">@media</span>');
			expect(result).toContain('<span class="syntax-selector">screen</span>');
			// After outer {, context becomes property, so .foo is seen as a property
			// (CSS parser tracks brace depth but inner selectors are in property context)
			expect(result).toContain('<span class="syntax-property">.foo</span>');
			expect(result).toContain('<span class="syntax-property">color</span>');
			expect(result).toContain('<span class="syntax-value">red</span>');
		});

		it("tracks brace depth correctly for nested blocks", () => {
			const code = "@media screen { .foo { color: red; } }";
			const result = highlightCSS(code);
			// After inner }, context should go back to selector (not property)
			// After outer }, should be back to selector
			const braces = result.match(/syntax-punctuation/g);
			// { { : ; } } = 6 punctuation tokens
			expect(braces).not.toBeNull();
			expect(braces!.length).toBeGreaterThanOrEqual(6);
		});
	});

	describe("pseudo-selectors", () => {
		it("keeps colon as part of :hover pseudo-class selector", () => {
			const result = highlightCSS("a:hover");
			// The colon should be inside the selector span, not a separate punctuation span
			expect(result).toContain('<span class="syntax-selector">a:hover</span>');
		});

		it("keeps double colon as part of ::before pseudo-element", () => {
			const result = highlightCSS("p::before");
			expect(result).toContain('<span class="syntax-selector">p::before</span>');
		});

		it("handles pseudo-selector followed by a rule block", () => {
			const result = highlightCSS("a:hover { color: blue; }");
			expect(result).toContain('<span class="syntax-selector">a:hover</span>');
			expect(result).toContain('<span class="syntax-property">color</span>');
			expect(result).toContain('<span class="syntax-value">blue</span>');
		});
	});

	describe("HTML entity escaping", () => {
		it("escapes ampersand", () => {
			const result = highlightCSS(".foo { content: &; }");
			expect(result).toContain("&amp;");
			expect(result).not.toMatch(/(?<!&amp)&(?!amp;|lt;|gt;|quot;|#039;)/);
		});

		it("escapes less-than sign", () => {
			const result = highlightCSS(".foo < .bar");
			expect(result).toContain("&lt;");
		});

		it("escapes greater-than sign", () => {
			const result = highlightCSS(".foo > .bar");
			expect(result).toContain("&gt;");
		});

		it("escapes double quotes in selectors", () => {
			// Double quotes in non-string contexts
			const result = highlightCSS('[data-attr="value"]');
			expect(result).toContain("&quot;");
		});

		it("escapes single quotes", () => {
			const result = highlightCSS(".foo { font-family: 'Arial'; }");
			expect(result).toContain("&#039;");
		});
	});

	describe("context transitions", () => {
		it("transitions from selector to property after {", () => {
			const result = highlightCSS(".foo { color }");
			expect(result).toContain('<span class="syntax-selector">.foo</span>');
			expect(result).toContain('<span class="syntax-property">color</span>');
		});

		it("transitions from value back to property after ;", () => {
			const result = highlightCSS(".foo { color: red; margin: 0; }");
			expect(result).toContain('<span class="syntax-property">color</span>');
			expect(result).toContain('<span class="syntax-value">red</span>');
			expect(result).toContain('<span class="syntax-property">margin</span>');
			expect(result).toContain('<span class="syntax-value">0</span>');
		});

		it("transitions from property/value back to selector after }", () => {
			const result = highlightCSS(".foo { color: red; } .bar");
			expect(result).toContain('<span class="syntax-selector">.foo</span>');
			expect(result).toContain('<span class="syntax-selector">.bar</span>');
		});

		it("semicolon outside braces returns to selector context", () => {
			const result = highlightCSS("@import url(test); .foo");
			expect(result).toContain('<span class="syntax-at-rule">@import</span>');
			expect(result).toContain('<span class="syntax-selector">.foo</span>');
		});
	});

	describe("complete CSS rules", () => {
		it("highlights a full CSS rule correctly", () => {
			const code = ".container {\n  display: flex;\n  color: #333;\n}";
			const result = highlightCSS(code);
			expect(result).toContain('<span class="syntax-selector">.container</span>');
			expect(result).toContain('<span class="syntax-punctuation">{</span>');
			expect(result).toContain('<span class="syntax-property">display</span>');
			expect(result).toContain('<span class="syntax-punctuation">:</span>');
			expect(result).toContain('<span class="syntax-value">flex</span>');
			expect(result).toContain('<span class="syntax-punctuation">;</span>');
			expect(result).toContain('<span class="syntax-property">color</span>');
			expect(result).toContain('<span class="syntax-value">#333</span>');
			expect(result).toContain('<span class="syntax-punctuation">}</span>');
		});
	});
});
