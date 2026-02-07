/**
 * Code block parser
 * Handles both fenced (```) and indented (4 spaces) code blocks
 */

import type { ParseResult } from "../types";

/**
 * Parse a fenced code block (``` ... ```)
 */
export function parseFencedCodeBlock(lines: string[], index: number): ParseResult | null {
  const trimmedLine = lines[index]!.trim();

  if (!trimmedLine.startsWith("```")) {
    return null;
  }

  const language = trimmedLine.slice(3).trim();
  const contentLines: string[] = [];
  let i = index + 1;

  while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
    contentLines.push(lines[i]!);
    i++;
  }

  // Skip closing ```
  if (i < lines.length) i++;

  return {
    token: {
      type: "code_block",
      language,
      content: contentLines.join("\n"),
    },
    endIndex: i,
  };
}

/**
 * Parse an indented code block (4+ spaces or tab at start)
 */
export function parseIndentedCodeBlock(lines: string[], index: number): ParseResult | null {
  const line = lines[index]!;

  if (!/^( {4}|\t)/.test(line)) {
    return null;
  }

  const contentLines: string[] = [];
  let i = index;

  while (i < lines.length) {
    const codeLine = lines[i]!;
    if (/^( {4}|\t)/.test(codeLine)) {
      // Remove the 4 spaces or tab prefix
      contentLines.push(codeLine.replace(/^( {4}|\t)/, ""));
      i++;
    } else if (codeLine.trim() === "") {
      // Empty lines within indented block are kept
      contentLines.push("");
      i++;
    } else {
      break;
    }
  }

  // Remove trailing empty lines
  while (contentLines.length > 0 && contentLines[contentLines.length - 1] === "") {
    contentLines.pop();
  }

  if (contentLines.length === 0) {
    return null;
  }

  return {
    token: {
      type: "code_block",
      language: "",
      content: contentLines.join("\n"),
    },
    endIndex: i,
  };
}
