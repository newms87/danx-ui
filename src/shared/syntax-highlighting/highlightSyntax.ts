/**
 * Lightweight syntax highlighting for JSON, YAML, HTML, CSS, and JavaScript
 * Returns HTML string with syntax highlighting spans
 */

import { highlightCSS } from "./highlightCSS";
import { highlightJavaScript } from "./highlightJavaScript";
import { highlightHTML } from "./highlightHTML";

export type HighlightFormat = "json" | "yaml" | "text" | "markdown" | "html" | "css" | "javascript";

export interface HighlightOptions {
  format: HighlightFormat;
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Highlight JSON syntax by tokenizing first, then applying highlights
 * This prevents issues with regex replacing content inside already-matched strings
 */
function highlightJSON(code: string): string {
  if (!code) return "";

  const result: string[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // String (starts with ")
    if (char === '"') {
      const startIndex = i;
      i++; // skip opening quote

      // Find the closing quote, handling escape sequences
      while (i < code.length) {
        if (code[i] === "\\" && i + 1 < code.length) {
          i += 2; // skip escaped character
        } else if (code[i] === '"') {
          i++; // include closing quote
          break;
        } else {
          i++;
        }
      }

      const str = code.slice(startIndex, i);
      const escapedStr = escapeHtml(str);

      // Check if this is a key (followed by colon)
      const afterString = code.slice(i).match(/^(\s*):/);
      if (afterString) {
        result.push(`<span class="syntax-key">${escapedStr}</span>`);
        // Add the whitespace and colon
        result.push(`<span class="syntax-punctuation">${escapeHtml(afterString[1]!)}:</span>`);
        i += afterString[0].length;
      } else {
        // It's a string value
        result.push(`<span class="syntax-string">${escapedStr}</span>`);
      }
      continue;
    }

    // Number (starts with digit or minus followed by digit)
    if (/[-\d]/.test(char!)) {
      const numMatch = code.slice(i).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
      if (numMatch) {
        result.push(`<span class="syntax-number">${escapeHtml(numMatch[0]!)}</span>`);
        i += numMatch[0].length;
        continue;
      }
    }

    // Boolean true
    if (code.slice(i, i + 4) === "true") {
      result.push(`<span class="syntax-boolean">true</span>`);
      i += 4;
      continue;
    }

    // Boolean false
    if (code.slice(i, i + 5) === "false") {
      result.push(`<span class="syntax-boolean">false</span>`);
      i += 5;
      continue;
    }

    // Null
    if (code.slice(i, i + 4) === "null") {
      result.push(`<span class="syntax-null">null</span>`);
      i += 4;
      continue;
    }

    // Punctuation
    if (/[{}\[\],:]/.test(char!)) {
      result.push(`<span class="syntax-punctuation">${escapeHtml(char!)}</span>`);
      i++;
      continue;
    }

    // Whitespace and other characters
    result.push(escapeHtml(char!));
    i++;
  }

  return result.join("");
}

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
  const match = line.match(/^(\s*)/);
  return match ? match[1]!.length : 0;
}

/**
 * Highlight YAML syntax with multi-line string support
 */
function highlightYAML(code: string): string {
  if (!code) return "";

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

/**
 * Highlight code based on format
 */
export function highlightSyntax(code: string, options: HighlightOptions): string {
  if (!code) return "";

  switch (options.format) {
    case "json":
      return highlightJSON(code);
    case "yaml":
      return highlightYAML(code);
    case "html":
      return highlightHTML(code);
    case "css":
      return highlightCSS(code);
    case "javascript":
      return highlightJavaScript(code);
    case "text":
    case "markdown":
    default:
      return escapeHtml(code);
  }
}
