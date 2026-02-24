/**
 * Block tokenizer orchestrator
 * Coordinates all block-level parsers to tokenize markdown
 */

import type { BlockToken } from "../types";
import { extractDefinitions } from "./extractDefinitions";
import { parseFencedCodeBlock, parseIndentedCodeBlock } from "./parseCodeBlock";
import { parseAtxHeading, parseSetextHeading } from "./parseHeading";
import { parseList } from "./parseList";
import { parseTable } from "./parseTable";
import { parseBlockquote } from "./parseBlockquote";
import { parseTaskList } from "./parseTaskList";
import { parseDefinitionList } from "./parseDefinitionList";
import { parseHorizontalRule } from "./parseHorizontalRule";
import { parseParagraph } from "./parseParagraph";
import { parseStructuredData } from "./parseStructuredData";
import { getIndent } from "./utils";

/**
 * Tokenize markdown into block-level elements
 */
export function tokenizeBlocks(markdown: string): BlockToken[] {
  const tokens: BlockToken[] = [];
  const rawLines = markdown.split("\n");

  // First pass: Extract link reference and footnote definitions
  const lines = extractDefinitions(rawLines);

  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmedLine = line.trim();

    // Skip empty lines between blocks
    if (!trimmedLine) {
      i++;
      continue;
    }

    // Try parsers in priority order
    let result;

    // 1. Fenced code blocks: ```language ... ```
    result = parseFencedCodeBlock(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 2. ATX-style headings: # through ######
    result = parseAtxHeading(line!, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 3. Setext-style headings: text followed by === or ---
    // Must check BEFORE hr detection since --- could be either
    result = parseSetextHeading(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 4. Horizontal rules: ---, ***, ___
    result = parseHorizontalRule(line!, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 5. Blockquotes: > text
    result = parseBlockquote(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 6. Task lists: - [ ] or - [x]
    // Must be before regular unordered list detection
    result = parseTaskList(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 7. Lists: unordered (-, *, +) and ordered (1., 2., etc.)
    if (/^[-*+]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine)) {
      const listResult = parseList(lines, i, getIndent(line!));
      tokens.push(...listResult.tokens);
      i = listResult.endIndex;
      continue;
    }

    // 8. Indented code blocks: 4+ spaces or tab at start
    result = parseIndentedCodeBlock(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 9. Tables: | col | col |
    result = parseTable(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 10. Definition lists: Term\n: Definition
    result = parseDefinitionList(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 11. Structured data: unfenced JSON or YAML blocks
    result = parseStructuredData(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // 12. Paragraphs (fallback): collect consecutive non-empty lines
    result = parseParagraph(lines, i);
    if (result) {
      tokens.push(result.token);
      i = result.endIndex;
      continue;
    }

    // Should never reach here, but advance to prevent infinite loop
    i++;
  }

  return tokens;
}
