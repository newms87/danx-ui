/**
 * Lightweight syntax highlighting for YAML
 *
 * Line-by-line parser with state tracking for multi-line constructs:
 * block scalars (| and >), quoted strings spanning lines, and unquoted
 * multi-line values. Highlights keys, string/number/boolean/null values,
 * comments, and array item dashes.
 */

import { escapeHtml } from "../escapeHtml";

/**
 * Highlight a YAML value based on its type
 */
function highlightYAMLValue(value: string): string {
  if (!value) return value;

  // Quoted string (complete)
  if (/^(&quot;.*&quot;|&#039;.*&#039;)$/.test(value) || /^["'].*["']$/.test(value)) {
    return `<span class="syntax-string">${value}</span>`;
  }
  // Number (strict format: integers, decimals, scientific notation)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
    return `<span class="syntax-number">${value}</span>`;
  }
  // Boolean
  if (/^(true|false)$/i.test(value)) {
    return `<span class="syntax-boolean">${value}</span>`;
  }
  // Null
  if (/^(null|~)$/i.test(value)) {
    return `<span class="syntax-null">${value}</span>`;
  }
  // Block scalar indicators - don't wrap, handle continuation separately
  if (/^[|>][-+]?\d*$/.test(value)) {
    return `<span class="syntax-punctuation">${value}</span>`;
  }
  // Unquoted string
  return `<span class="syntax-string">${value}</span>`;
}

/**
 * Check if a line is a continuation of a multi-line string
 * (indented content following a block scalar or inside a quoted string)
 */
function getIndentLevel(line: string): number {
  // /^(\s*)/ always matches any string — capture group 1 is the leading whitespace
  return line.match(/^(\s*)/)![1]!.length;
}

/**
 * Highlight YAML syntax with multi-line string support
 */
export function highlightYAML(code: string): string {
  // Parent highlightSyntax() already guards against empty code
  const lines = code.split("\n");
  const highlightedLines: string[] = [];

  // State tracking for multi-line constructs
  let inBlockScalar = false;
  let blockScalarIndent = 0;
  let inQuotedString = false;
  let quoteChar = "";
  let inUnquotedMultiline = false;
  let unquotedMultilineKeyIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const escaped = escapeHtml(line);
    const currentIndent = getIndentLevel(line);
    const trimmedLine = line.trim();

    // Handle block scalar continuation (| or > style)
    if (inBlockScalar) {
      // Block scalar ends when we hit a line with less or equal indentation (and content)
      if (trimmedLine && currentIndent <= blockScalarIndent) {
        inBlockScalar = false;
        // Fall through to normal processing
      } else {
        // This is a continuation line - highlight as string
        highlightedLines.push(`<span class="syntax-string">${escaped}</span>`);
        continue;
      }
    }

    // Handle quoted string continuation
    if (inQuotedString) {
      // Check if this line closes the quote
      const escapedQuote = quoteChar === '"' ? "&quot;" : "&#039;";

      // Count unescaped quotes in this line
      let closed = false;
      let searchLine = escaped;
      while (searchLine.includes(escapedQuote)) {
        const idx = searchLine.indexOf(escapedQuote);
        // Check if preceded by backslash (escaped)
        if (idx > 0 && searchLine[idx - 1]! === "\\") {
          searchLine = searchLine.slice(idx + escapedQuote.length);
          continue;
        }
        closed = true;
        break;
      }

      if (closed) {
        // Find position of closing quote
        const closeIdx = escaped.indexOf(escapedQuote);
        const beforeClose = escaped.slice(0, closeIdx + escapedQuote.length);
        const afterClose = escaped.slice(closeIdx + escapedQuote.length);

        highlightedLines.push(`<span class="syntax-string">${beforeClose}</span>${afterClose}`);
        inQuotedString = false;
      } else {
        // Still in quoted string
        highlightedLines.push(`<span class="syntax-string">${escaped}</span>`);
      }
      continue;
    }

    // Handle unquoted multi-line string continuation
    if (inUnquotedMultiline) {
      // Unquoted multiline ends when we hit a line with <= indentation to the key
      // or when the line contains a colon (new key-value pair)
      if (trimmedLine && currentIndent <= unquotedMultilineKeyIndent) {
        inUnquotedMultiline = false;
        // Fall through to normal processing
      } else if (trimmedLine) {
        // This is a continuation line - highlight as string
        highlightedLines.push(`<span class="syntax-string">${escaped}</span>`);
        continue;
      } else {
        // Empty line within multiline - keep it
        highlightedLines.push(escaped);
        continue;
      }
    }

    // Comments
    if (/^\s*#/.test(line)) {
      highlightedLines.push(`<span class="syntax-punctuation">${escaped}</span>`);
      continue;
    }

    // Key-value pairs
    const keyValueMatch = escaped.match(/^(\s*)([^:]+?)(:)(\s*)(.*)$/);
    if (keyValueMatch) {
      const [, indent, key, colon, space, value] = keyValueMatch!;

      // Check for block scalar start
      if (/^[|>][-+]?\d*$/.test(value!.trim())) {
        inBlockScalar = true;
        blockScalarIndent = currentIndent;
        const highlightedValue = `<span class="syntax-punctuation">${value}</span>`;
        highlightedLines.push(
          `${indent}<span class="syntax-key">${key}</span><span class="syntax-punctuation">${colon}</span>${space}${highlightedValue}`
        );
        continue;
      }

      // Check for start of multi-line quoted string
      const startsWithQuote = /^(&quot;|&#039;|"|')/.test(value!);
      const endsWithQuote = /(&quot;|&#039;|"|')$/.test(value!);

      if (startsWithQuote && !endsWithQuote && value!.length > 1) {
        // Multi-line quoted string starts here
        inQuotedString = true;
        quoteChar = value!.startsWith("&quot;") || value!.startsWith('"') ? '"' : "'";
        highlightedLines.push(
          `${indent}<span class="syntax-key">${key}</span><span class="syntax-punctuation">${colon}</span>${space}<span class="syntax-string">${value}</span>`
        );
        continue;
      }

      // Check for start of unquoted multi-line string
      // If value is an unquoted string and next line is more indented, it's a multiline
      if (value && !startsWithQuote && i + 1 < lines.length) {
        const nextLine = lines[i + 1]!;
        const nextIndent = getIndentLevel(nextLine);
        const nextTrimmed = nextLine.trim();
        // Next line must be more indented than current key and not be a new key-value or array item
        if (
          nextTrimmed &&
          nextIndent > currentIndent &&
          !nextTrimmed.includes(":") &&
          !nextTrimmed.startsWith("-")
        ) {
          inUnquotedMultiline = true;
          unquotedMultilineKeyIndent = currentIndent;
          highlightedLines.push(
            `${indent}<span class="syntax-key">${key}</span><span class="syntax-punctuation">${colon}</span>${space}<span class="syntax-string">${value}</span>`
          );
          continue;
        }
      }

      // Normal single-line value
      const highlightedValue = highlightYAMLValue(value!);
      highlightedLines.push(
        `${indent}<span class="syntax-key">${key}</span><span class="syntax-punctuation">${colon}</span>${space}${highlightedValue}`
      );
      continue;
    }

    // Array items (lines starting with -)
    const arrayMatch = escaped.match(/^(\s*)(-)(\s*)(.*)$/);
    if (arrayMatch) {
      const [, indent, dash, space, value] = arrayMatch!;
      const highlightedValue = value! ? highlightYAMLValue(value!) : "";
      highlightedLines.push(
        `${indent}<span class="syntax-punctuation">${dash}</span>${space}${highlightedValue}`
      );
      continue;
    }

    highlightedLines.push(escaped);
  }

  return highlightedLines.join("\n");
}
