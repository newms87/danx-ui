/**
 * Definition list parser
 * Handles term/definition pairs with : prefix
 */

import type { ParseResult } from "../types";

/**
 * Parse a definition list section
 * Format: Term\n: Definition
 */
export function parseDefinitionList(lines: string[], index: number): ParseResult | null {
  const trimmedLine = lines[index]!.trim();

  // Check if current line could be a term (non-empty, doesn't start with special chars)
  // and next line starts with `: `
  if (
    !trimmedLine ||
    trimmedLine.startsWith(":") ||
    /^[-*+#>\d]/.test(trimmedLine) ||
    index + 1 >= lines.length
  ) {
    return null;
  }

  const nextLine = lines[index + 1]!.trim();
  if (!nextLine.startsWith(": ")) {
    return null;
  }

  // This is a definition list
  const items: Array<{ term: string; definitions: string[] }> = [];
  let i = index;

  while (i < lines.length) {
    const termLine = lines[i]!.trim();

    // Empty line ends the definition list
    if (!termLine) {
      i++;
      // Check if there's another term after empty line
      if (i < lines.length && lines[i]!.trim() && !lines[i]!.trim().startsWith(":")) {
        const afterEmpty = lines[i + 1]?.trim();
        if (afterEmpty?.startsWith(": ")) {
          continue; // Another term-definition pair follows
        }
      }
      break;
    }

    // If line starts with :, it's a definition for previous term
    if (termLine.startsWith(": ")) {
      // Add to last item's definitions if exists
      if (items.length > 0) {
        items[items.length - 1]!.definitions.push(termLine.slice(2));
      }
      i++;
      continue;
    }

    // Check if this could be a new term
    if (!termLine.startsWith(":") && i + 1 < lines.length) {
      const nextDef = lines[i + 1]!.trim();
      if (nextDef.startsWith(": ")) {
        // New term
        items.push({
          term: termLine,
          definitions: [],
        });
        i++;
        continue;
      }
    }

    // Not part of definition list anymore
    break;
  }

  // The initial guard (lines 17-28) ensures the first term has a `: ` definition
  // on the next line, so items always has at least one item with one definition
  return {
    token: { type: "dl", items },
    endIndex: i,
  };
}
