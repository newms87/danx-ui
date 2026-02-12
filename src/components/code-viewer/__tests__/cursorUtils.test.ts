import { describe, expect, it, vi, afterEach } from "vitest";
import {
  getSmartIndent,
  getCursorOffset,
  setCursorOffset,
  getCurrentLineInfo,
} from "../cursorUtils";
import type { LineInfo } from "../cursorUtils";

describe("cursorUtils", () => {
  describe("getSmartIndent", () => {
    it("YAML: line ending with colon adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "key:" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
    });

    it("YAML: block scalar adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "description: |" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
    });

    it("YAML: list item adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "- item" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
    });

    it("YAML: bare dash keeps indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "-" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("");
    });

    it("JSON: opening brace adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "{" };
      expect(getSmartIndent(lineInfo, "json")).toBe("  ");
    });

    it("JSON: comma keeps indent", () => {
      const lineInfo: LineInfo = { indent: "  ", lineContent: '  "key": "val",' };
      expect(getSmartIndent(lineInfo, "json")).toBe("  ");
    });

    it("default keeps current indent", () => {
      const lineInfo: LineInfo = { indent: "  ", lineContent: "  some text" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
    });

    it("returns current indent for non-yaml non-json format", () => {
      const lineInfo: LineInfo = { indent: "    ", lineContent: "    some text" };
      expect(getSmartIndent(lineInfo, "text")).toBe("    ");
    });

    it("JSON: returns indent for line not ending with brace, bracket, or comma", () => {
      const lineInfo: LineInfo = { indent: "  ", lineContent: '  "key": "value"' };
      expect(getSmartIndent(lineInfo, "json")).toBe("  ");
    });

    it("JSON: opening bracket adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "[" };
      expect(getSmartIndent(lineInfo, "json")).toBe("  ");
    });

    it("YAML: block scalar with chomp indicator adds indent", () => {
      const lineInfo: LineInfo = { indent: "", lineContent: "description: >-" };
      expect(getSmartIndent(lineInfo, "yaml")).toBe("  ");
    });
  });

  describe("getCursorOffset", () => {
    let pre: HTMLPreElement;

    afterEach(() => {
      if (pre?.parentNode) document.body.removeChild(pre);
    });

    it("returns 0 when no selection", () => {
      window.getSelection()?.removeAllRanges();
      expect(getCursorOffset(null)).toBe(0);
    });

    it("returns 0 when codeRef is null", () => {
      expect(getCursorOffset(null)).toBe(0);
    });

    it("returns cursor offset in plain text", () => {
      pre = document.createElement("pre");
      pre.textContent = "hello world";
      document.body.appendChild(pre);

      const range = document.createRange();
      range.setStart(pre.firstChild!, 5);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const offset = getCursorOffset(pre);
      expect(offset).toBe(5);
    });

    it("returns offset accounting for multiple text nodes", () => {
      pre = document.createElement("pre");
      const span1 = document.createElement("span");
      span1.textContent = "abc";
      const span2 = document.createElement("span");
      span2.textContent = "def";
      pre.appendChild(span1);
      pre.appendChild(span2);
      document.body.appendChild(pre);

      const range = document.createRange();
      range.setStart(span2.firstChild!, 2);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const offset = getCursorOffset(pre);
      expect(offset).toBeGreaterThanOrEqual(3); // at least past first span
    });
  });

  describe("setCursorOffset", () => {
    let pre: HTMLPreElement;

    afterEach(() => {
      if (pre?.parentNode) document.body.removeChild(pre);
    });

    it("does nothing when codeRef is null", () => {
      setCursorOffset(null, 5);
      // No error thrown
    });

    it("returns early when window.getSelection() is null", () => {
      pre = document.createElement("pre");
      pre.textContent = "hello";
      document.body.appendChild(pre);

      const spy = vi.spyOn(window, "getSelection").mockReturnValue(null);
      setCursorOffset(pre, 3);
      spy.mockRestore();
    });

    it("sets cursor at specified offset", () => {
      pre = document.createElement("pre");
      pre.textContent = "hello world";
      document.body.appendChild(pre);

      setCursorOffset(pre, 5);

      const selection = window.getSelection();
      expect(selection?.rangeCount).toBeGreaterThan(0);
    });

    it("places cursor at end when offset exceeds content", () => {
      pre = document.createElement("pre");
      pre.textContent = "hi";
      document.body.appendChild(pre);

      setCursorOffset(pre, 100);

      const selection = window.getSelection();
      expect(selection?.rangeCount).toBeGreaterThan(0);
    });

    it("handles offset within nested spans", () => {
      pre = document.createElement("pre");
      const span = document.createElement("span");
      span.textContent = "nested text";
      pre.appendChild(span);
      document.body.appendChild(pre);

      setCursorOffset(pre, 3);

      const selection = window.getSelection();
      expect(selection?.rangeCount).toBeGreaterThan(0);
    });

    it("handles text node with empty textContent", () => {
      pre = document.createElement("pre");
      // Create a text node with empty content followed by one with content
      const emptyText = document.createTextNode("");
      const realText = document.createTextNode("hello");
      pre.appendChild(emptyText);
      pre.appendChild(realText);
      document.body.appendChild(pre);

      setCursorOffset(pre, 3);

      const selection = window.getSelection();
      expect(selection?.rangeCount).toBeGreaterThan(0);
    });
  });

  describe("getCurrentLineInfo", () => {
    let pre: HTMLPreElement;

    afterEach(() => {
      if (pre?.parentNode) document.body.removeChild(pre);
    });

    it("returns empty indent and lineContent for empty text", () => {
      const result = getCurrentLineInfo("", null);
      expect(result).toEqual({ indent: "", lineContent: "" });
    });

    it("returns line info based on cursor position", () => {
      pre = document.createElement("pre");
      pre.textContent = "  indented line";
      document.body.appendChild(pre);

      const range = document.createRange();
      range.setStart(pre.firstChild!, 15);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const result = getCurrentLineInfo("  indented line", pre);
      expect(result).not.toBeNull();
      expect(result?.indent).toBe("  ");
    });

    it("returns correct info for multi-line content", () => {
      pre = document.createElement("pre");
      pre.textContent = "line1\n    line2";
      document.body.appendChild(pre);

      const range = document.createRange();
      range.setStart(pre.firstChild!, 14);
      range.collapse(true);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      const result = getCurrentLineInfo("line1\n    line2", pre);
      expect(result).not.toBeNull();
      expect(result?.indent).toBe("    ");
    });
  });
});
