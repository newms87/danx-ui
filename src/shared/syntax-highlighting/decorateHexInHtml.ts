/**
 * Hex Color Swatch Decorator for HTML Strings
 *
 * Post-processes syntax-highlighted HTML to wrap hex color codes (#RGB, #RRGGBB)
 * in .color-preview spans with a --swatch-color CSS variable. Only decorates
 * text segments — HTML tags are left untouched.
 *
 * Safe with escapeHtml output because `#` is never escaped, and the HEX_PATTERN
 * lookbehind `(?<![&\w])` rejects hex-like patterns inside HTML entities
 * (e.g. `&#039;`).
 */

import { findHexMatches } from "../hexColor";

/** Splits HTML into tag segments and text segments */
const HTML_SEGMENT_PATTERN = /((?:<[^>]*>)|(?:[^<]+))/g;

/**
 * Wrap hex color codes in an HTML string with color-preview spans.
 * Only processes text segments (not inside HTML tags).
 */
export function decorateHexInHtml(html: string): string {
  if (!html) return html;

  return html.replace(HTML_SEGMENT_PATTERN, (segment) => {
    // Skip HTML tags
    if (segment.startsWith("<")) return segment;

    const matches = findHexMatches(segment);
    if (matches.length === 0) return segment;

    let result = "";
    let lastIndex = 0;

    for (const m of matches) {
      if (m.index > lastIndex) {
        result += segment.slice(lastIndex, m.index);
      }
      result += `<span class="color-preview" style="--swatch-color: ${m.fullMatch}">${m.fullMatch}</span>`;
      lastIndex = m.index + m.fullMatch.length;
    }

    if (lastIndex < segment.length) {
      result += segment.slice(lastIndex);
    }

    return result;
  });
}
