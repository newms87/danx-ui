/**
 * Structured data parser
 * Auto-detects unfenced JSON and YAML blocks and produces code_block tokens
 */

import type { ParseResult } from "../types";
import { isJSON, isStructuredData } from "../../dataFormat";

/**
 * YAML key-value line: `key: value` or `- key: value`.
 * Plain list items (`- value`) are excluded because they are consumed by the
 * list parser (step 7) before this parser runs (step 11).
 */
const YAML_LINE_PATTERN = /^-?\s*\w[\w\s]*:\s+.+/;

/** Minimum consecutive YAML-pattern lines required to trigger detection */
const YAML_MIN_LINES = 2;

/**
 * Count unescaped bracket depth changes in a line, skipping characters inside JSON strings.
 * Returns the net depth change (positive for openers, negative for closers).
 */
function countBracketDepth(line: string): number {
  let depth = 0;
  let inString = false;

  for (let c = 0; c < line.length; c++) {
    const ch = line[c]!;

    if (inString) {
      if (ch === "\\") {
        c++; // skip escaped character
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{" || ch === "[") {
      depth++;
    } else if (ch === "}" || ch === "]") {
      depth--;
    }
  }

  return depth;
}

/**
 * Try to parse an unfenced JSON block starting at `index`.
 * Uses bracket-tracking to find the end of the structure.
 */
function tryParseJSON(lines: string[], index: number): ParseResult | null {
  const trimmed = lines[index]!.trim();
  if (trimmed[0] !== "{" && trimmed[0] !== "[") return null;

  const collected: string[] = [];
  let depth = 0;
  let i = index;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmedLine = line.trim();

    // Stop at empty lines — the JSON block has ended (possibly incomplete)
    if (!trimmedLine && depth > 0) break;

    depth += countBracketDepth(line);
    collected.push(line);
    i++;

    // Depth returned to zero — we consumed a complete structure
    if (depth === 0) break;
  }

  // Depth must be zero (complete structure) and content must be valid JSON
  if (depth !== 0) return null;

  const content = collected.join("\n");
  if (!isJSON(content)) return null;

  return {
    token: { type: "code_block", language: "json", content },
    endIndex: i,
  };
}

/**
 * Try to parse an unfenced YAML block starting at `index`.
 * Collects consecutive non-empty lines that look like YAML, then validates.
 */
function tryParseYAML(lines: string[], index: number): ParseResult | null {
  const trimmed = lines[index]!.trim();
  if (!YAML_LINE_PATTERN.test(trimmed)) return null;

  const collected: string[] = [];
  let i = index;

  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) break; // stop at empty line
    collected.push(line);
    i++;
  }

  // Require multiple lines to avoid false positives on prose like "Note: this is important"
  if (collected.length < YAML_MIN_LINES) return null;

  const content = collected.join("\n");
  if (!isStructuredData(content)) return null;

  return {
    token: { type: "code_block", language: "yaml", content },
    endIndex: i,
  };
}

/**
 * Parse unfenced structured data (JSON or YAML) at the current line.
 * Returns a code_block token with the appropriate language, or null if
 * the content is not valid structured data.
 */
export function parseStructuredData(lines: string[], index: number): ParseResult | null {
  return tryParseJSON(lines, index) ?? tryParseYAML(lines, index);
}
