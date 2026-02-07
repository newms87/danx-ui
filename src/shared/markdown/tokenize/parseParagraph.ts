/**
 * Paragraph parser
 * Collects consecutive non-block lines into paragraphs
 */

import type { ParseResult } from "../types";

/**
 * Check if a line starts a block-level element
 */
function isBlockStarter(trimmed: string): boolean {
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("```") ||
    trimmed.startsWith(">") ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
  );
}

/**
 * Parse a paragraph (consecutive non-empty, non-block lines)
 */
export function parseParagraph(lines: string[], index: number): ParseResult | null {
  const paragraphLines: string[] = [];
  let i = index;

  while (i < lines.length) {
    const pLine = lines[i]!;
    const pTrimmed = pLine.trim();

    // Stop on empty line or block-level element
    if (!pTrimmed) {
      i++;
      break;
    }

    // Check for block-level starters
    if (isBlockStarter(pTrimmed)) {
      break;
    }

    paragraphLines.push(pLine);
    i++;
  }

  if (paragraphLines.length === 0) {
    return null;
  }

  return {
    token: {
      type: "paragraph",
      content: paragraphLines.join("\n"),
    },
    endIndex: i,
  };
}
