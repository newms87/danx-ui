import { describe, it, expect, beforeEach } from "vitest";
import { renderFootnotesSection } from "../renderFootnotes";
import type { FootnoteDefinition } from "../../types";
import { resetParserState } from "../../state";

describe("renderFootnotesSection", () => {
  beforeEach(() => {
    resetParserState();
  });

  it("renders footnotes sorted by index", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      second: { content: "Second footnote", index: 2 },
      first: { content: "First footnote", index: 1 },
      third: { content: "Third footnote", index: 3 },
    };
    const result = renderFootnotesSection(footnotes, true);
    const firstPos = result.indexOf("First footnote");
    const secondPos = result.indexOf("Second footnote");
    const thirdPos = result.indexOf("Third footnote");
    expect(firstPos).toBeLessThan(secondPos);
    expect(secondPos).toBeLessThan(thirdPos);
  });

  it('assigns id="fn-{id}" to each footnote li', () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      abc: { content: "Footnote content", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain('id="fn-abc"');
  });

  it('includes backref link with href="#fnref-{id}"', () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      ref1: { content: "Some note", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain('href="#fnref-ref1"');
    expect(result).toContain('class="footnote-backref"');
  });

  it("renders footnote content with inline parsing", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      note1: { content: "This is **bold** content", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain("This is <strong>bold</strong> content");
  });

  it('wraps everything in section with class="footnotes"', () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      a: { content: "Note", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toMatch(/^<section class="footnotes">/);
    expect(result).toMatch(/<\/section>$/);
  });

  it("includes hr element inside section", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      a: { content: "Note", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain("<hr />");
    // hr should appear after opening section tag and before ol
    const hrPos = result.indexOf("<hr />");
    const sectionPos = result.indexOf('<section class="footnotes">');
    const olPos = result.indexOf('<ol class="footnote-list">');
    expect(hrPos).toBeGreaterThan(sectionPos);
    expect(hrPos).toBeLessThan(olPos);
  });

  it('uses ol with class="footnote-list"', () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      x: { content: "Content", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain('<ol class="footnote-list">');
    expect(result).toContain("</ol>");
  });

  it("wraps in section > hr > ol structure", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      fn1: { content: "Footnote one", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toMatch(
      /^<section class="footnotes"><hr \/><ol class="footnote-list">.*<\/ol><\/section>$/
    );
  });

  it("renders multiple footnotes in correct order", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      z: { content: "Last by alpha, first by index", index: 1 },
      a: { content: "First by alpha, last by index", index: 3 },
      m: { content: "Middle", index: 2 },
    };
    const result = renderFootnotesSection(footnotes, true);
    // Extract li elements to check order
    const liMatches = result.match(/<li[^>]*>.*?<\/li>/g);
    expect(liMatches).toHaveLength(3);
    expect(liMatches![0]).toContain('id="fn-z"');
    expect(liMatches![1]).toContain('id="fn-m"');
    expect(liMatches![2]).toContain('id="fn-a"');
  });

  it("includes the return arrow character in backref", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      note: { content: "A note", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    // U+21A9 is the leftwards arrow with hook (return symbol)
    expect(result).toContain("\u21a9");
  });

  it("has footnote-item class on each li", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      a: { content: "Note A", index: 1 },
      b: { content: "Note B", index: 2 },
    };
    const result = renderFootnotesSection(footnotes, true);
    const itemCount = (result.match(/class="footnote-item"/g) || []).length;
    expect(itemCount).toBe(2);
  });

  it("renders inline links within footnote content", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      link: { content: "See [example](http://example.com) for details", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain('<a href="http://example.com">example</a>');
  });

  it("escapes HTML in footnote content when sanitize is true", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      xss: { content: '<script>alert("xss")</script>', index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("renders footnote with numeric id", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      "1": { content: "Numbered footnote", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toContain('id="fn-1"');
    expect(result).toContain('href="#fnref-1"');
  });

  it("renders a complete single-footnote section", () => {
    const footnotes: Record<string, FootnoteDefinition> = {
      example: { content: "Example note", index: 1 },
    };
    const result = renderFootnotesSection(footnotes, true);
    expect(result).toBe(
      '<section class="footnotes"><hr /><ol class="footnote-list">' +
        '<li id="fn-example" class="footnote-item">' +
        "Example note" +
        ' <a href="#fnref-example" class="footnote-backref">\u21a9</a>' +
        "</li>" +
        "</ol></section>"
    );
  });
});
