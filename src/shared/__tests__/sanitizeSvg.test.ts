import { describe, it, expect } from "vitest";
import { sanitizeSvg } from "../sanitizeSvg";

describe("sanitizeSvg", () => {
  describe("valid SVG", () => {
    it("renders a valid SVG string correctly", () => {
      const svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).toContain("<svg");
      expect(result).toContain("<circle");
    });

    it("preserves attributes on the svg root", () => {
      const svg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).toContain('viewBox="0 0 24 24"');
      expect(result).toContain('fill="currentColor"');
    });
  });

  describe("dangerous content stripped", () => {
    it("strips <script> elements", () => {
      const svg = '<svg viewBox="0 0 24 24"><script>alert(1)</script><circle r="10"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("<script");
      expect(result).toContain("<circle");
    });

    it("strips <style> elements", () => {
      const svg = '<svg viewBox="0 0 24 24"><style>*{color:red}</style><circle r="10"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("<style");
    });

    it("strips <foreignObject> elements", () => {
      const svg =
        '<svg viewBox="0 0 24 24"><foreignObject><div>hi</div></foreignObject><circle r="10"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("foreignObject");
      expect(result).not.toContain("<div");
    });

    it("strips on* event attributes", () => {
      const svg = '<svg viewBox="0 0 24 24"><circle onclick="alert(1)" r="10"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("onclick");
    });

    it("neutralizes javascript: URI in href attribute", () => {
      const svg =
        '<svg viewBox="0 0 24 24"><a href="javascript:alert(1)"><circle r="10"/></a></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("javascript:");
    });

    it("neutralizes javascript: URI in xlink:href attribute", () => {
      const svg =
        '<svg viewBox="0 0 24 24" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="javascript:alert(1)"/></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("javascript:");
    });

    it("neutralizes data: URI in href attribute", () => {
      const svg =
        '<svg viewBox="0 0 24 24"><a href="data:text/html;base64,YWxlcnQoMSk="><circle r="10"/></a></svg>';
      const result = sanitizeSvg(svg);

      expect(result).not.toContain("data:");
    });
  });

  describe("rejection of non-SVG input", () => {
    it("rejects arbitrary non-SVG HTML", () => {
      expect(sanitizeSvg("<div>hello</div>")).toBeNull();
    });

    it("rejects a bare img tag with an event handler", () => {
      expect(sanitizeSvg('<img src=x onerror="alert(1)">')).toBeNull();
    });

    it("rejects plain text", () => {
      expect(sanitizeSvg("not an svg at all")).toBeNull();
    });

    it("rejects an empty string", () => {
      expect(sanitizeSvg("")).toBeNull();
    });

    it("rejects malformed markup", () => {
      expect(sanitizeSvg("<svg><circle></svg>")).toBeNull();
    });

    it("rejects multiple sibling top-level elements", () => {
      const svg = '<svg viewBox="0 0 24 24"><circle r="10"/></svg><svg><circle r="5"/></svg>';
      expect(sanitizeSvg(svg)).toBeNull();
    });
  });
});
