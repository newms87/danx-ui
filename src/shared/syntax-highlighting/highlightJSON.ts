/**
 * Lightweight syntax highlighting for JSON
 *
 * Character-by-character tokenizer that identifies keys, string values,
 * numbers, booleans, null, and punctuation. Keys are distinguished from
 * string values by checking whether the closing quote is followed by a colon.
 *
 * When nestedJsonOptions is provided, string values containing valid JSON
 * objects/arrays are wrapped in toggleable markup with expanded (pretty-printed)
 * and raw (escaped string) views.
 */

import { escapeHtml } from "../escapeHtml";
import { isNestedJson, parseNestedJson } from "../nestedJson";
import type { NestedJsonOptions } from "./highlightSyntax";
import { buildNestedJsonMarkup } from "./nestedJsonMarkup";

/**
 * Unescape a JSON string value (strip surrounding quotes and process escape sequences).
 * Input is the raw JSON string token including quotes, e.g. "\"hello\\nworld\""
 */
function unescapeJsonString(jsonStr: string): string {
  try {
    return JSON.parse(jsonStr) as string;
  } catch {
    // If parsing fails, strip quotes manually
    return jsonStr.slice(1, -1);
  }
}

/**
 * Calculate the current column position (characters since last newline)
 * from the accumulated result array, for indentation of expanded nested JSON.
 */
function getCurrentColumn(result: string[]): number {
  const joined = result.join("");
  // Strip HTML tags to get visual text length
  const text = joined.replace(/<[^>]*>/g, "");
  const lastNewline = text.lastIndexOf("\n");
  return lastNewline === -1 ? text.length : text.length - lastNewline - 1;
}

/**
 * Highlight JSON syntax by tokenizing first, then applying highlights.
 * This prevents issues with regex replacing content inside already-matched strings.
 *
 * @param code - The JSON source code to highlight
 * @param nestedJsonOptions - Optional nested JSON toggle support. When provided,
 *   string values containing valid JSON objects/arrays get wrapped in toggle markup.
 */
export function highlightJSON(code: string, nestedJsonOptions?: NestedJsonOptions): string {
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
        // It's a string value — check for nested JSON
        const unescaped = unescapeJsonString(str);
        if (nestedJsonOptions && isNestedJson(unescaped)) {
          const parsed = parseNestedJson(unescaped)!;
          const id = `nj-${startIndex}`;
          const expanded = nestedJsonOptions.isExpanded(id);

          // Compute custom indentation for expanded view
          let formattedJson: string | undefined;
          if (expanded) {
            const prettyJson = JSON.stringify(parsed, null, 2);
            const column = getCurrentColumn(result);
            const indent = " ".repeat(column);
            formattedJson = prettyJson
              .split("\n")
              .map((line, idx) => (idx === 0 ? line : indent + line))
              .join("\n");
          }

          result.push(
            buildNestedJsonMarkup({
              id,
              parsed,
              rawEscapedValue: escapedStr,
              isExpanded: expanded,
              formattedJson,
            })
          );
        } else {
          result.push(`<span class="syntax-string">${escapedStr}</span>`);
        }
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
