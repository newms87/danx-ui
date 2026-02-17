/**
 * Annotate Highlighted Lines
 *
 * Post-processes syntax-highlighted HTML to wrap annotated lines with
 * highlight markup. Each annotated line gets a <span> with annotation
 * CSS classes and data attributes for tooltip display.
 */

import type { CodeAnnotation } from "./types";

/**
 * Wraps annotated lines in the highlighted HTML with annotation markup.
 *
 * The highlighted HTML preserves newline boundaries (one \n per source line).
 * Lines covered by annotations get wrapped in a <span> with:
 * - Class: dx-annotation dx-annotation--{type}
 * - Data attributes: data-annotation-msg for tooltip text
 * - dx-annotation-start on the first line of a multi-line range
 * - dx-annotation-end on the last line of a multi-line range
 */
export function annotateHighlightedLines(
  html: string,
  lineAnnotations: Map<number, CodeAnnotation[]>
): string {
  if (!lineAnnotations.size) return html;

  const lines = html.split("\n");
  const annotatedLines = lines.map((line, idx) => {
    const annotations = lineAnnotations.get(idx);
    if (!annotations?.length) return line;

    // Use the first annotation's type for styling (multiple annotations on same line use first)
    const annotation = annotations[0]!;
    const type = annotation.type || "error";
    const message = escapeAttr(annotations.map((a) => a.message).join("\n"));

    // Determine if this is start/end of a multi-line range
    const classes = [`dx-annotation`, `dx-annotation--${type}`];

    const hasPrev = lineAnnotations.has(idx - 1);
    const hasNext = lineAnnotations.has(idx + 1);

    if (!hasPrev) classes.push("dx-annotation-start");
    if (!hasNext) classes.push("dx-annotation-end");

    return `<span class="${classes.join(" ")}" data-annotation-msg="${message}">${line}</span>`;
  });

  return annotatedLines.join("\n");
}

/**
 * Escape a string for use in an HTML attribute value.
 */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
