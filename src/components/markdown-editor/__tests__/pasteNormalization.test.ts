import { describe, it, expect } from "vitest";
import { normalizePastedHtml } from "../pasteNormalization";

describe("normalizePastedHtml", () => {
  it("strips Word conditional comments", () => {
    const html = "<!--[if gte mso 9]><xml>ignored</xml><![endif]--><p>Hello</p>";
    expect(normalizePastedHtml(html)).toBe("<p>Hello</p>");
  });

  it("strips regular HTML comments", () => {
    const html = "<p>Hello<!-- a note --></p>";
    expect(normalizePastedHtml(html)).toBe("<p>Hello</p>");
  });

  it("strips inline style and class attributes", () => {
    const html = '<p class="MsoNormal" style="margin:0in;font-family:Calibri">Text</p>';
    expect(normalizePastedHtml(html)).toBe("<p>Text</p>");
  });

  it("strips script, style, meta, and link tags", () => {
    const html =
      '<meta charset="utf-8"><style>.x{color:red}</style><script>alert(1)</script>' +
      "<link><p>Text</p>";
    const result = normalizePastedHtml(html);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("<style");
    expect(result).not.toContain("<meta");
    expect(result).not.toContain("<link");
    expect(result).toContain("<p>Text</p>");
  });

  it("unwraps MS Office namespaced elements while keeping their text", () => {
    const html = "<p>Before <o:p>Office text</o:p> After</p>";
    expect(normalizePastedHtml(html)).toBe("<p>Before Office text After</p>");
  });

  it("strips on* event handler attributes", () => {
    const html = '<p onclick="alert(1)">Text</p>';
    const result = normalizePastedHtml(html);
    expect(result).not.toContain("onclick");
    expect(result).toContain("<p>Text</p>");
  });

  it("preserves semantic formatting tags", () => {
    const html =
      '<p>This is <b>bold</b> and <i>italic</i> and <a href="https://example.com">a link</a></p>';
    const result = normalizePastedHtml(html);
    expect(result).toContain("<b>bold</b>");
    expect(result).toContain("<i>italic</i>");
    expect(result).toContain('href="https://example.com"');
  });

  it("returns empty markup for plain-text-only input with no tags", () => {
    const result = normalizePastedHtml("just plain text");
    expect(result).toContain("just plain text");
  });
});
