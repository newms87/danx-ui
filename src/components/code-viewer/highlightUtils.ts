/**
 * Highlight Utilities
 *
 * Shared helper for applying syntax highlighting to a contenteditable code element.
 * Used by both useCodeViewerEditor and codeViewerDebounce to avoid repeating the
 * highlightSyntax + innerHTML assignment pattern.
 */

import { Ref } from "vue";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import type { CodeFormat } from "./types";

/**
 * Apply syntax highlighting to a code element's innerHTML.
 * Returns the highlighted HTML string. Safe to call when codeRef.value is null.
 */
export function applyHighlighting(
  codeRef: Ref<HTMLPreElement | null>,
  content: string,
  format: CodeFormat
): string {
  const highlighted = highlightSyntax(content, { format, colorSwatches: true });
  if (codeRef.value) {
    codeRef.value.innerHTML = highlighted;
  }
  return highlighted;
}
