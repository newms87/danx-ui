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
 * Consecutive annotated lines are merged into a single <span> so the background
 * and left border render as one continuous block with no gaps between lines.
 */
export function annotateHighlightedLines(
  html: string,
  lineAnnotations: Map<number, CodeAnnotation[]>
): string {
  if (!lineAnnotations.size) return html;

  const lines = html.split("\n");
  const result: string[] = [];
  let groupLines: string[] = [];
  let groupAnnotations: CodeAnnotation[] = [];

  function flushGroup(): void {
    if (!groupLines.length) return;

    const type = groupAnnotations[0]!.type || "error";
    const message = escapeAttr(groupAnnotations.map((a) => a.message).join("\n"));
    const content = groupLines.join("\n");

    result.push(
      `<span class="dx-annotation dx-annotation--${type}" data-annotation-msg="${message}">${content}</span>`
    );
    groupLines = [];
    groupAnnotations = [];
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const annotations = lineAnnotations.get(idx);

    if (!annotations?.length) {
      flushGroup();
      result.push(lines[idx]!);
      continue;
    }

    // Check if this line continues the same annotation group
    const sameGroup =
      groupLines.length > 0 &&
      groupAnnotations.length === annotations.length &&
      groupAnnotations.every((a, i) => a === annotations[i]);

    if (sameGroup) {
      groupLines.push(lines[idx]!);
    } else {
      // Different annotation — flush previous group first
      flushGroup();
      groupAnnotations = annotations;
      groupLines.push(lines[idx]!);
    }
  }

  flushGroup();
  return result.join("\n");
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
