/**
 * Horizontal rule parser
 * Handles ---, ***, ___ patterns
 */

import type { ParseResult } from "../types";

/**
 * Parse a horizontal rule
 */
export function parseHorizontalRule(line: string, index: number): ParseResult | null {
  const trimmedLine = line.trim();

  if (!/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
    return null;
  }

  return {
    token: { type: "hr" },
    endIndex: index + 1,
  };
}
