/**
 * Heading parser
 * Handles both ATX-style (#) and setext-style (=== or ---) headings
 */

import type { ParseResult } from "../types";

/**
 * Parse an ATX-style heading (# through ######)
 */
export function parseAtxHeading(line: string, index: number): ParseResult | null {
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

  if (!headingMatch) {
    return null;
  }

  return {
    token: {
      type: "heading",
      level: headingMatch[1]!.length,
      content: headingMatch[2]!,
    },
    endIndex: index + 1,
  };
}

/**
 * Parse a setext-style heading (text followed by === or ---)
 */
export function parseSetextHeading(lines: string[], index: number): ParseResult | null {
  if (index + 1 >= lines.length) {
    return null;
  }

  const trimmedLine = lines[index]!.trim();
  const nextLine = lines[index + 1]!.trim();

  // Level 1: ===
  if (/^=+$/.test(nextLine) && trimmedLine.length > 0) {
    return {
      token: {
        type: "heading",
        level: 1,
        content: trimmedLine,
      },
      endIndex: index + 2,
    };
  }

  // Level 2: ---
  // Must not be a list item (starts with - followed by space)
  if (/^-+$/.test(nextLine) && trimmedLine.length > 0 && !/^[-*+]\s+/.test(trimmedLine)) {
    return {
      token: {
        type: "heading",
        level: 2,
        content: trimmedLine,
      },
      endIndex: index + 2,
    };
  }

  return null;
}
