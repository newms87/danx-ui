/**
 * Blockquote parser
 * Handles > prefixed content
 */

import type { ParseResult } from "../types";

/**
 * Parse a blockquote section
 */
export function parseBlockquote(lines: string[], index: number): ParseResult | null {
  const trimmedLine = lines[index]!.trim();

  if (!trimmedLine.startsWith(">")) {
    return null;
  }

  const quoteLines: string[] = [];
  let i = index;

  while (i < lines.length && lines[i]!.trim().startsWith(">")) {
    // Remove the leading > and optional space
    quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ""));
    i++;
  }

  return {
    token: {
      type: "blockquote",
      content: quoteLines.join("\n"),
    },
    endIndex: i,
  };
}
