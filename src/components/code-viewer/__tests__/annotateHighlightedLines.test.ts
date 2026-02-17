import { describe, it, expect } from "vitest";
import { annotateHighlightedLines } from "../annotateHighlightedLines";
import type { CodeAnnotation } from "../types";

describe("annotateHighlightedLines", () => {
  it("returns HTML unchanged when lineAnnotations map is empty", () => {
    const html = '<span class="syntax-key">name</span>: test';
    const result = annotateHighlightedLines(html, new Map());
    expect(result).toBe(html);
  });

  it("wraps annotated lines with correct classes and data attributes", () => {
    const html = "line0\nline1\nline2";
    const annotations: CodeAnnotation[] = [
      { path: "key", message: "Something wrong", type: "error" },
    ];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(1, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    const lines = result.split("\n");

    expect(lines[0]).toBe("line0");
    expect(lines[1]).toContain('class="dx-annotation dx-annotation--error');
    expect(lines[1]).toContain('data-annotation-msg="Something wrong"');
    expect(lines[1]).toContain(">line1</span>");
    expect(lines[2]).toBe("line2");
  });

  it("uses first annotation's type when multiple annotations on same line", () => {
    const html = "line0";
    const annotations: CodeAnnotation[] = [
      { path: "a", message: "First", type: "warning" },
      { path: "b", message: "Second", type: "error" },
    ];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(0, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    expect(result).toContain("dx-annotation--warning");
    expect(result).not.toContain("dx-annotation--error");
  });

  it("joins multiple annotation messages with newline", () => {
    const html = "line0";
    const annotations: CodeAnnotation[] = [
      { path: "a", message: "First msg" },
      { path: "b", message: "Second msg" },
    ];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(0, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    // Newline is escaped as part of attribute, but the raw joined string should be present
    expect(result).toContain("First msg");
    expect(result).toContain("Second msg");
  });

  it("adds dx-annotation-start and dx-annotation-end classes for range boundaries", () => {
    const html = "line0\nline1\nline2\nline3";
    const annotations: CodeAnnotation[] = [{ path: "key", message: "err" }];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(1, annotations);
    lineMap.set(2, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    const lines = result.split("\n");

    // Line 1 is the start (no previous annotation)
    expect(lines[1]).toContain("dx-annotation-start");
    expect(lines[1]).not.toContain("dx-annotation-end");

    // Line 2 is the end (no next annotation)
    expect(lines[2]).toContain("dx-annotation-end");
    expect(lines[2]).not.toContain("dx-annotation-start");
  });

  it("escapes HTML entities in data-annotation-msg attribute", () => {
    const html = "line0";
    const annotations: CodeAnnotation[] = [{ path: "key", message: 'Use <div> & "quotes"' }];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(0, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    expect(result).toContain("&lt;div&gt;");
    expect(result).toContain("&amp;");
    expect(result).toContain("&quot;quotes&quot;");
  });

  it("handles single-line annotations with both start and end classes", () => {
    const html = "line0\nline1\nline2";
    const annotations: CodeAnnotation[] = [{ path: "key", message: "err" }];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(1, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    const lines = result.split("\n");

    expect(lines[1]).toContain("dx-annotation-start");
    expect(lines[1]).toContain("dx-annotation-end");
  });

  it("defaults to error type when annotation has no type", () => {
    const html = "line0";
    const annotations: CodeAnnotation[] = [{ path: "key", message: "err" }];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(0, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    expect(result).toContain("dx-annotation--error");
  });

  it("applies info type class", () => {
    const html = "line0";
    const annotations: CodeAnnotation[] = [{ path: "key", message: "info", type: "info" }];
    const lineMap = new Map<number, CodeAnnotation[]>();
    lineMap.set(0, annotations);

    const result = annotateHighlightedLines(html, lineMap);
    expect(result).toContain("dx-annotation--info");
  });
});
