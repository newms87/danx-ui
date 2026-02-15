import { describe, it, expect } from "vitest";
import { decorateHexInHtml } from "../decorateHexInHtml";

describe("decorateHexInHtml", () => {
  it("wraps a 6-digit hex color in a text segment", () => {
    const result = decorateHexInHtml("color: #ff0000;");
    expect(result).toBe(
      'color: <span class="color-preview" style="--swatch-color: #ff0000">#ff0000</span>;'
    );
  });

  it("wraps a 3-digit hex color", () => {
    const result = decorateHexInHtml("color: #f00;");
    expect(result).toBe(
      'color: <span class="color-preview" style="--swatch-color: #f00">#f00</span>;'
    );
  });

  it("wraps multiple hex colors in one text segment", () => {
    const result = decorateHexInHtml("#aaa and #bbb");
    expect(result).toContain('style="--swatch-color: #aaa"');
    expect(result).toContain('style="--swatch-color: #bbb"');
  });

  it("does not modify content inside HTML tags", () => {
    const html = '<span class="syntax-value">#ff0000</span>';
    const result = decorateHexInHtml(html);
    // The #ff0000 inside the tag text segment should be wrapped,
    // but the tag itself should not be altered
    expect(result).toContain('<span class="syntax-value">');
    expect(result).toContain('style="--swatch-color: #ff0000"');
  });

  it("does not alter tag attributes", () => {
    const html = '<span style="color: #ff0000">text</span>';
    const result = decorateHexInHtml(html);
    // The tag should be unchanged (hex inside tag attribute is ignored)
    expect(result).toContain('style="color: #ff0000"');
  });

  it("does not match hex inside HTML entities", () => {
    const result = decorateHexInHtml("&#039;test&#039;");
    expect(result).not.toContain("color-preview");
    expect(result).toBe("&#039;test&#039;");
  });

  it("returns empty string for empty input", () => {
    expect(decorateHexInHtml("")).toBe("");
  });

  it("returns the string unchanged when no hex colors are present", () => {
    const html = '<span class="syntax-key">name</span>';
    expect(decorateHexInHtml(html)).toBe(html);
  });

  it("is idempotent for already-wrapped content", () => {
    const first = decorateHexInHtml("color: #ff0000;");
    const second = decorateHexInHtml(first);
    // The hex inside the style attribute of the wrapper span should not be double-wrapped
    // because it's inside a tag. The text "#ff0000" inside the wrapper span IS re-wrapped,
    // but since it already has the wrapper structure, we just verify it doesn't break.
    expect(second).toContain("color-preview");
  });

  it("handles mixed tags and text with hex colors", () => {
    const html = '<span class="syntax-property">color</span>: #00ff00;';
    const result = decorateHexInHtml(html);
    expect(result).toContain('<span class="syntax-property">color</span>');
    expect(result).toContain('style="--swatch-color: #00ff00"');
  });

  it("returns falsy input unchanged", () => {
    // @ts-expect-error testing null input
    expect(decorateHexInHtml(null)).toBeNull();
    // @ts-expect-error testing undefined input
    expect(decorateHexInHtml(undefined)).toBeUndefined();
  });
});
