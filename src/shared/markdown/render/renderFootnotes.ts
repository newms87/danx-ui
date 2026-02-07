/**
 * Footnotes section renderer
 * Renders the footnotes section at the end of the document
 */

import type { FootnoteDefinition } from "../types";
import { parseInline } from "../parseInline";

/**
 * Render the footnotes section
 */
export function renderFootnotesSection(
  footnotes: Record<string, FootnoteDefinition>,
  sanitize: boolean
): string {
  const footnoteEntries = Object.entries(footnotes).sort((a, b) => a[1].index - b[1].index);

  let html = '<section class="footnotes"><hr /><ol class="footnote-list">';

  for (const [fnId, fn] of footnoteEntries) {
    html += `<li id="fn-${fnId}" class="footnote-item">`;
    html += parseInline(fn.content, sanitize);
    html += ` <a href="#fnref-${fnId}" class="footnote-backref">\u21a9</a>`;
    html += "</li>";
  }

  html += "</ol></section>";
  return html;
}
