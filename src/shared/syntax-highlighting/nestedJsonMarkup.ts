/**
 * Nested JSON Markup Builder
 *
 * Generates the HTML toggle markup for nested JSON strings detected
 * during syntax highlighting. Shared by the JSON and YAML highlighters
 * to avoid duplication.
 */

import { highlightJSON } from "./highlightJSON";

export interface NestedJsonMarkupOptions {
  id: string;
  parsed: object | unknown[];
  rawEscapedValue: string;
  isExpanded: boolean;
  /** Optional pre-formatted JSON string (e.g. with custom indentation). Overrides default pretty-print. */
  formattedJson?: string;
}

/**
 * Build toggle markup for a nested JSON string value.
 * Returns an HTML span wrapping the toggle indicator and either the
 * pretty-printed (expanded) or raw (collapsed) content.
 */
export function buildNestedJsonMarkup(options: NestedJsonMarkupOptions): string {
  const { id, parsed, rawEscapedValue, isExpanded, formattedJson } = options;

  const toggleChar = isExpanded ? "\u25BC" : "\u25B6";
  const toggleSpan = `<span class="nested-json-toggle" data-nested-json-toggle="${id}">${toggleChar}</span>`;

  if (isExpanded) {
    const jsonStr = formattedJson ?? JSON.stringify(parsed, null, 2);
    const highlighted = highlightJSON(jsonStr);
    return `<span class="nested-json" data-nested-json-id="${id}">${toggleSpan}<span class="nested-json-parsed">${highlighted}</span></span>`;
  }

  return `<span class="nested-json" data-nested-json-id="${id}">${toggleSpan}<span class="nested-json-raw">${rawEscapedValue}</span></span>`;
}
