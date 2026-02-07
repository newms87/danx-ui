import { describe, it, expect } from "vitest";
import { isHeadingElement, getHeadingLevel, convertHeading } from "../convertHeadings";

describe("convertHeadings", () => {
	describe("isHeadingElement", () => {
		it("returns true for h1 through h6 elements", () => {
			for (let i = 1; i <= 6; i++) {
				const el = document.createElement(`h${i}`);
				expect(isHeadingElement(el), `h${i} should be a heading`).toBe(true);
			}
		});

		it("returns false for common non-heading elements", () => {
			for (const tag of ["p", "div", "span"]) {
				const el = document.createElement(tag);
				expect(isHeadingElement(el), `${tag} should not be a heading`).toBe(false);
			}
		});

		it("returns false for h7 element", () => {
			const el = document.createElement("h7");
			expect(isHeadingElement(el)).toBe(false);
		});

		it("returns false for header element", () => {
			const el = document.createElement("header");
			expect(isHeadingElement(el)).toBe(false);
		});

		it("returns false for h0 element", () => {
			const el = document.createElement("h0");
			expect(isHeadingElement(el)).toBe(false);
		});

		it("returns false for heading-like semantic elements", () => {
			for (const tag of ["hgroup", "section", "article", "nav", "aside", "footer"]) {
				const el = document.createElement(tag);
				expect(isHeadingElement(el), `${tag} should not be a heading`).toBe(false);
			}
		});

		it("returns false for list and table elements", () => {
			for (const tag of ["ul", "ol", "li", "table", "tr", "td", "th"]) {
				const el = document.createElement(tag);
				expect(isHeadingElement(el), `${tag} should not be a heading`).toBe(false);
			}
		});

		it("returns false for inline formatting elements", () => {
			for (const tag of ["strong", "em", "b", "i", "code", "a"]) {
				const el = document.createElement(tag);
				expect(isHeadingElement(el), `${tag} should not be a heading`).toBe(false);
			}
		});

		it("works regardless of tagName case (DOM always uppercases)", () => {
			// DOM elements always have uppercase tagName, but the function lowercases it
			const el = document.createElement("H3");
			expect(isHeadingElement(el)).toBe(true);
		});
	});

	describe("getHeadingLevel", () => {
		it("returns 1 for h1", () => {
			expect(getHeadingLevel(document.createElement("h1"))).toBe(1);
		});

		it("returns 2 for h2", () => {
			expect(getHeadingLevel(document.createElement("h2"))).toBe(2);
		});

		it("returns 3 for h3", () => {
			expect(getHeadingLevel(document.createElement("h3"))).toBe(3);
		});

		it("returns 4 for h4", () => {
			expect(getHeadingLevel(document.createElement("h4"))).toBe(4);
		});

		it("returns 5 for h5", () => {
			expect(getHeadingLevel(document.createElement("h5"))).toBe(5);
		});

		it("returns 6 for h6", () => {
			expect(getHeadingLevel(document.createElement("h6"))).toBe(6);
		});

		it("returns 0 for p element", () => {
			expect(getHeadingLevel(document.createElement("p"))).toBe(0);
		});

		it("returns 0 for div element", () => {
			expect(getHeadingLevel(document.createElement("div"))).toBe(0);
		});

		it("returns 0 for span element", () => {
			expect(getHeadingLevel(document.createElement("span"))).toBe(0);
		});

		it("returns 0 for h0 element", () => {
			expect(getHeadingLevel(document.createElement("h0"))).toBe(0);
		});

		it("returns 0 for h7 element", () => {
			expect(getHeadingLevel(document.createElement("h7"))).toBe(0);
		});

		it("returns 0 for h8 and h9 elements", () => {
			expect(getHeadingLevel(document.createElement("h8"))).toBe(0);
			expect(getHeadingLevel(document.createElement("h9"))).toBe(0);
		});

		it("returns 0 for header element", () => {
			expect(getHeadingLevel(document.createElement("header"))).toBe(0);
		});

		it("returns 0 for hgroup element", () => {
			expect(getHeadingLevel(document.createElement("hgroup"))).toBe(0);
		});
	});

	describe("convertHeading", () => {
		it("converts h1 with text to single hash prefix", () => {
			const el = document.createElement("h1");
			el.textContent = "Main Title";
			expect(convertHeading(el)).toBe("# Main Title\n\n");
		});

		it("converts h2 with text to double hash prefix", () => {
			const el = document.createElement("h2");
			el.textContent = "Subtitle";
			expect(convertHeading(el)).toBe("## Subtitle\n\n");
		});

		it("converts h3 with text to triple hash prefix", () => {
			const el = document.createElement("h3");
			el.textContent = "Section";
			expect(convertHeading(el)).toBe("### Section\n\n");
		});

		it("converts h4 with text to quadruple hash prefix", () => {
			const el = document.createElement("h4");
			el.textContent = "Subsection";
			expect(convertHeading(el)).toBe("#### Subsection\n\n");
		});

		it("converts h5 with text to five hash prefix", () => {
			const el = document.createElement("h5");
			el.textContent = "Detail";
			expect(convertHeading(el)).toBe("##### Detail\n\n");
		});

		it("converts h6 with text to six hash prefix", () => {
			const el = document.createElement("h6");
			el.textContent = "Minor";
			expect(convertHeading(el)).toBe("###### Minor\n\n");
		});

		it("returns empty string for non-heading elements with content", () => {
			for (const tag of ["p", "div", "span", "li", "td"]) {
				const el = document.createElement(tag);
				el.textContent = "Some content";
				expect(convertHeading(el), `${tag} should return empty`).toBe("");
			}
		});

		it("returns empty string for heading with empty textContent", () => {
			const el = document.createElement("h1");
			el.textContent = "";
			expect(convertHeading(el)).toBe("");
		});

		it("returns empty string for heading with whitespace-only content", () => {
			const el = document.createElement("h2");
			el.textContent = "   ";
			expect(convertHeading(el)).toBe("");
		});

		it("returns empty string for heading with tabs and newlines only", () => {
			const el = document.createElement("h3");
			el.textContent = "\t\n\r\n\t";
			expect(convertHeading(el)).toBe("");
		});

		it("trims leading whitespace from heading content", () => {
			const el = document.createElement("h1");
			el.textContent = "   Leading spaces";
			expect(convertHeading(el)).toBe("# Leading spaces\n\n");
		});

		it("trims trailing whitespace from heading content", () => {
			const el = document.createElement("h1");
			el.textContent = "Trailing spaces   ";
			expect(convertHeading(el)).toBe("# Trailing spaces\n\n");
		});

		it("trims both leading and trailing whitespace", () => {
			const el = document.createElement("h1");
			el.textContent = "  Both sides  ";
			expect(convertHeading(el)).toBe("# Both sides\n\n");
		});

		it("preserves internal whitespace in heading content", () => {
			const el = document.createElement("h2");
			el.textContent = "Multiple   internal   spaces";
			expect(convertHeading(el)).toBe("## Multiple   internal   spaces\n\n");
		});

		it("always appends two newlines after the heading", () => {
			const el = document.createElement("h4");
			el.textContent = "Test";
			const result = convertHeading(el);
			expect(result.endsWith("\n\n")).toBe(true);
		});

		it("uses textContent which flattens nested child elements", () => {
			const el = document.createElement("h2");
			const strong = document.createElement("strong");
			strong.textContent = "Bold";
			const span = document.createElement("span");
			span.textContent = " and plain";
			el.appendChild(strong);
			el.appendChild(span);
			// textContent extracts raw text from all children
			expect(convertHeading(el)).toBe("## Bold and plain\n\n");
		});

		it("handles heading with only a child element containing text", () => {
			const el = document.createElement("h1");
			const em = document.createElement("em");
			em.textContent = "Emphasized title";
			el.appendChild(em);
			expect(convertHeading(el)).toBe("# Emphasized title\n\n");
		});

		it("handles heading with special characters in text", () => {
			const el = document.createElement("h1");
			el.textContent = "Title with * and # characters";
			expect(convertHeading(el)).toBe("# Title with * and # characters\n\n");
		});

		it("handles heading with unicode characters", () => {
			const el = document.createElement("h2");
			el.textContent = "Unicode heading: cafe\u0301";
			expect(convertHeading(el)).toBe("## Unicode heading: cafe\u0301\n\n");
		});

		it("handles heading with numeric content", () => {
			const el = document.createElement("h3");
			el.textContent = "123";
			expect(convertHeading(el)).toBe("### 123\n\n");
		});

		it("returns empty string for heading with null-like textContent", () => {
			const el = document.createElement("h1");
			// textContent is "" by default for an empty element
			expect(convertHeading(el)).toBe("");
		});

		it("handles heading containing a single character", () => {
			const el = document.createElement("h6");
			el.textContent = "X";
			expect(convertHeading(el)).toBe("###### X\n\n");
		});

		it("handles heading with very long content", () => {
			const el = document.createElement("h1");
			const longText = "A".repeat(500);
			el.textContent = longText;
			expect(convertHeading(el)).toBe(`# ${longText}\n\n`);
		});

		it("returns correct number of hash characters for each level", () => {
			for (let level = 1; level <= 6; level++) {
				const el = document.createElement(`h${level}`);
				el.textContent = "Test";
				const result = convertHeading(el);
				const prefix = "#".repeat(level);
				expect(result).toBe(`${prefix} Test\n\n`);
			}
		});
	});
});
