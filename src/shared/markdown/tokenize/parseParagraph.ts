/**
 * Paragraph parser
 * Collects consecutive non-block lines into paragraphs
 */

import type { ParseResult } from "../types";
import { parseStructuredData } from "./parseStructuredData";

/**
 * Check if a line starts a block-level element.
 *
 * Note: `{` is included because no standard markdown syntax starts with it —
 * it is a non-standard extension for auto-detecting unfenced JSON objects.
 * `[` is NOT included here because it conflicts with markdown links;
 * instead, `[` lines are handled via a `parseStructuredData` lookahead
 * in the paragraph collection loop.
 */
function isBlockStarter(trimmed: string): boolean {
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("```") ||
    trimmed.startsWith(">") ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed) ||
    trimmed.startsWith("{")
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

    // Break before [ lines that are valid JSON arrays (not markdown links)
    if (pTrimmed.startsWith("[") && parseStructuredData(lines, i)) {
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
