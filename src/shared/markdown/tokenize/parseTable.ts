/**
 * Table parser
 * Handles markdown tables with alignment support
 */

import type { TableAlignment, ParseResult } from "../types";
import { parsePipeRow } from "./utils";

/**
 * Parse a markdown table
 * Format: | col | col | followed by |---|---| separator
 */
export function parseTable(lines: string[], index: number): ParseResult | null {
  const trimmedLine = lines[index]!.trim();

  // Must start with | or contain |
  if (!trimmedLine.startsWith("|") && !trimmedLine.includes(" | ")) {
    return null;
  }

  // Check if next line is a separator
  if (index + 1 >= lines.length) {
    return null;
  }

  const nextLine = lines[index + 1]!.trim();

  // Separator pattern: |---|---| or |:---|---:| etc
  if (!/^\|?[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)+\|?$/.test(nextLine)) {
    return null;
  }

  // Parse header row
  const headers = parsePipeRow(trimmedLine);

  // Parse separator to get alignments
  const separatorCells = parsePipeRow(nextLine);
  const alignments: TableAlignment[] = separatorCells.map((cell) => {
    const trimmed = cell.trim();
    const leftColon = trimmed.startsWith(":");
    const rightColon = trimmed.endsWith(":");
    if (leftColon && rightColon) return "center";
    if (rightColon) return "right";
    if (leftColon) return "left";
    return null;
  });

  // Collect body rows
  const rows: string[][] = [];
  let i = index + 2; // Skip header and separator

  while (i < lines.length) {
    const rowLine = lines[i]!.trim();
    if (!rowLine || (!rowLine.startsWith("|") && !rowLine.includes(" | "))) {
      break;
    }
    rows.push(parsePipeRow(rowLine));
    i++;
  }

  return {
    token: {
      type: "table",
      headers,
      alignments,
      rows,
    },
    endIndex: i,
  };
}
