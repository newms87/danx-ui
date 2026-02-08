/**
 * Unified list parser for ordered and unordered lists
 * DRY implementation handling both list types with nested content support
 */

import type { BlockToken, ListItem } from "../types";
import { getIndent } from "./utils";

type ListType = "ul" | "ol";

interface ListParseResult {
  tokens: BlockToken[];
  endIndex: number;
}

/**
 * Detect if a line is a list item and return its type and content
 */
function detectListItem(
  trimmed: string
): { type: ListType; content: string; start?: number } | null {
  // Unordered: -, *, +
  const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
  if (ulMatch) {
    return { type: "ul", content: ulMatch[1]! };
  }

  // Ordered: 1., 2., etc.
  const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
  if (olMatch) {
    return { type: "ol", content: olMatch[2]!, start: parseInt(olMatch[1]!, 10) };
  }

  return null;
}

/**
 * Parse a list starting at current position, supporting nested lists
 * Unified implementation for both ul and ol
 */
export function parseList(
  lines: string[],
  startIndex: number,
  baseIndent: number
): ListParseResult {
  const tokens: BlockToken[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();
    const indent = getIndent(line);

    // Empty line - could be end of list or spacing within
    if (!trimmed) {
      i++;
      continue;
    }

    // If indent is less than base, we've exited this list level
    if (indent < baseIndent && trimmed) {
      break;
    }

    const itemInfo = detectListItem(trimmed);

    // Check if this is a list item at our indent level
    if (itemInfo && indent === baseIndent) {
      // Collect all items of the same type
      const items: ListItem[] = [];
      const listType = itemInfo.type;
      const startNum = itemInfo.start || 1;

      while (i < lines.length) {
        const itemLine = lines[i]!;
        const itemTrimmed = itemLine.trim();
        const itemIndent = getIndent(itemLine);

        // Empty lines between items are consumed by the recursive parseList call (line 95),
        // so this inner loop only sees non-empty lines or end-of-input

        if (!itemTrimmed || itemIndent < baseIndent) break;

        const currentItem = detectListItem(itemTrimmed);

        // Must be same list type and at base indent
        if (currentItem && currentItem.type === listType && itemIndent === baseIndent) {
          const content = currentItem.content;
          i++;

          // Check for nested content (items indented more than base)
          const nestedIndent = baseIndent + 2;
          const nested = parseList(lines, i, nestedIndent);

          items.push({
            content,
            children: nested.tokens.length > 0 ? nested.tokens : undefined,
          });
          i = nested.endIndex;
        } else if (itemIndent > baseIndent) {
          // This is nested content, let recursion handle it
          break;
        } else {
          break;
        }
      }

      if (items.length > 0) {
        if (listType === "ul") {
          tokens.push({ type: "ul", items });
        } else {
          tokens.push({ type: "ol", items, start: startNum });
        }
      }
      continue;
    }

    // Not a list item at this level
    break;
  }

  return { tokens, endIndex: i };
}
