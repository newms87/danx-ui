/**
 * Cursor and Indentation Utilities
 *
 * Pure DOM/string utilities for managing cursor position within contenteditable
 * elements and calculating smart indentation based on format context (JSON/YAML).
 * Extracted from useCodeViewerEditor to keep the composable focused on editor state.
 */

import type { CodeFormat } from "./types";

export interface LineInfo {
  /** The whitespace prefix of the current line */
  indent: string;
  /** The full content of the current line (from last newline to cursor) */
  lineContent: string;
}

/** Get cursor offset in plain text within a contenteditable element */
export function getCursorOffset(codeRef: HTMLPreElement | null): number {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || !codeRef) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = document.createRange();
  preCaretRange.selectNodeContents(codeRef);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  let offset = 0;
  const walker = document.createTreeWalker(
    preCaretRange.commonAncestorContainer,
    NodeFilter.SHOW_TEXT
  );
  let node = walker.nextNode();
  while (node) {
    if (preCaretRange.intersectsNode(node)) {
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      if (preCaretRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0) {
        offset += node.textContent?.length || 0;
      } else {
        offset += range.startOffset;
        break;
      }
    }
    node = walker.nextNode();
  }
  return offset;
}

/** Set cursor to offset in plain text within a contenteditable element */
export function setCursorOffset(codeRef: HTMLPreElement | null, targetOffset: number): void {
  if (!codeRef) return;

  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  const walker = document.createTreeWalker(codeRef, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= targetOffset) {
      const range = document.createRange();
      range.setStart(node, targetOffset - currentOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset += nodeLength;
    node = walker.nextNode();
  }

  // If offset not found, place at end
  const range = document.createRange();
  range.selectNodeContents(codeRef);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Get current line info from cursor position */
export function getCurrentLineInfo(
  editingContent: string,
  codeRef: HTMLPreElement | null
): LineInfo | null {
  const text = editingContent;
  if (!text) return { indent: "", lineContent: "" };

  const cursorOffset = getCursorOffset(codeRef);
  const textBeforeCursor = text.substring(0, cursorOffset);
  const lastNewlineIndex = textBeforeCursor.lastIndexOf("\n");
  const lineStart = lastNewlineIndex + 1;
  const lineContent = textBeforeCursor.substring(lineStart);

  const indentMatch = lineContent.match(/^[\t ]*/);
  const indent = indentMatch ? indentMatch[0] : "";

  return { indent, lineContent };
}

/**
 * Calculate smart indentation based on the current line content and format.
 *
 * For YAML: indents after colons, block scalars (`: |`, `: >`), and list items (`- `).
 * For JSON: indents after opening braces/brackets, maintains indent after commas.
 * Otherwise: maintains the current line's indentation.
 */
export function getSmartIndent(lineInfo: LineInfo, format: CodeFormat): string {
  const { indent, lineContent } = lineInfo;
  const trimmedLine = lineContent.trim();
  const indentUnit = "  ";

  if (format === "yaml") {
    if (trimmedLine.endsWith(":") || trimmedLine.match(/:\s*[|>][-+]?\s*$/)) {
      return indent + indentUnit;
    }
    if (trimmedLine.startsWith("- ")) {
      return indent + indentUnit;
    }
    if (trimmedLine === "-") {
      return indent;
    }
  } else if (format === "json") {
    if (trimmedLine.endsWith("{") || trimmedLine.endsWith("[")) {
      return indent + indentUnit;
    }
    if (trimmedLine.endsWith(",")) {
      return indent;
    }
  }

  return indent;
}

/**
 * Get available formats that can be cycled through based on current format.
 * YAML/JSON formats cycle between each other only.
 * Text/Markdown formats cycle between each other only.
 * Other formats don't cycle.
 */
export function getAvailableFormats(format: CodeFormat): CodeFormat[] {
  if (format === "json" || format === "yaml") {
    return ["yaml", "json"];
  }
  if (format === "text" || format === "markdown") {
    return ["text", "markdown"];
  }
  return [format];
}
