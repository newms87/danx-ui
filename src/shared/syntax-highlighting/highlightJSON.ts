/**
 * Lightweight syntax highlighting for JSON
 *
 * Character-by-character tokenizer that identifies keys, string values,
 * numbers, booleans, null, and punctuation. Keys are distinguished from
 * string values by checking whether the closing quote is followed by a colon.
 */

import { escapeHtml } from "../escapeHtml";

/**
 * Highlight JSON syntax by tokenizing first, then applying highlights
 * This prevents issues with regex replacing content inside already-matched strings
 */
export function highlightJSON(code: string): string {
  // Parent highlightSyntax() already guards against empty code
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
