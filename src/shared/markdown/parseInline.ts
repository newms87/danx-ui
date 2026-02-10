/**
 * Inline markdown element parser
 * Handles: bold, italic, strikethrough, highlight, superscript, subscript,
 * links, images, reference-style links, footnotes, autolinks, code
 */

import { escapeHtml } from "../escapeHtml";
import { applyEscapes, revertEscapes } from "./escapeSequences";
import { getLinkRefs, getFootnotes } from "./state";

/**
 * Parse inline markdown elements within text
 * Order matters: more specific patterns first
 */
export function parseInline(text: string, sanitize: boolean = true): string {
  if (!text) return "";

  const currentLinkRefs = getLinkRefs();
  const currentFootnotes = getFootnotes();

  // Escape HTML if sanitizing (before applying markdown)
  let result = sanitize ? escapeHtml(text) : text;

  // 1. ESCAPE SEQUENCES - Pre-process backslash escapes to placeholders
  // Must be first so escaped characters aren't treated as markdown
  result = applyEscapes(result);

  // 2. HARD LINE BREAKS - Two trailing spaces + newline becomes <br />
  result = result.replace(/ {2,}\n/g, "<br />\n");

  // 3. HEX COLOR PREVIEW - Display color swatch before hex color codes
  // Match 6-digit hex colors first (more specific), then 3-digit
  // Use word boundary to avoid matching inside URLs or other contexts
  // The pattern must NOT match 4, 5, 7+ digit hex codes
  result = result.replace(
    /(?<![&\w])#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g,
    '<span class="color-preview"><span class="color-swatch" style="background-color: #$1"></span>#$1</span>'
  );
  result = result.replace(
    /(?<![&\w])#([0-9a-fA-F]{3})(?![0-9a-fA-F])/g,
    '<span class="color-preview"><span class="color-swatch" style="background-color: #$1"></span>#$1</span>'
  );

  // 4. AUTOLINKS - Must be before regular link parsing
  // URL autolinks: <https://example.com>
  result = result.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1">$1</a>');
  // Email autolinks: <user@example.com>
  result = result.replace(
    /&lt;([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})&gt;/g,
    '<a href="mailto:$1">$1</a>'
  );

  // 5. FOOTNOTE REFERENCES: [^id]
  // Must be before regular link/image parsing to avoid conflicts
  result = result.replace(/\[\^([^\]]+)\]/g, (match, fnId) => {
    const fn = currentFootnotes[fnId];
    if (fn) {
      return `<sup class="footnote-ref"><a href="#fn-${fnId}" id="fnref-${fnId}">[${fn.index}]</a></sup>`;
    }
    return match; // Keep original if footnote not defined
  });

  // 6. IMAGES: ![alt](url) - must be before links
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // 7. INLINE LINKS: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 8. REFERENCE-STYLE LINKS - Process after regular links
  // Full reference: [text][ref-id]
  result = result.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (match, text, refId) => {
    const ref = currentLinkRefs[refId.toLowerCase()];
    if (ref) {
      const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
      return `<a href="${ref.url}"${title}>${text}</a>`;
    }
    return match; // Keep original if ref not found
  });

  // Collapsed reference: [text][]
  result = result.replace(/\[([^\]]+)\]\[\]/g, (match, text) => {
    const ref = currentLinkRefs[text.toLowerCase()];
    if (ref) {
      const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
      return `<a href="${ref.url}"${title}>${text}</a>`;
    }
    return match;
  });

  // Shortcut reference: [ref] alone (must not match [text](url) or [text][ref])
  // Only match [word] not followed by ( or [
  result = result.replace(/\[([^\]]+)\](?!\(|\[)/g, (match, text) => {
    const ref = currentLinkRefs[text.toLowerCase()];
    if (ref) {
      const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
      return `<a href="${ref.url}"${title}>${text}</a>`;
    }
    return match;
  });

  // 9. INLINE CODE: `code`
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 10. STRIKETHROUGH: ~~text~~ - Must be before subscript (single tilde)
  result = result.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // 11. HIGHLIGHT: ==text==
  result = result.replace(/==([^=]+)==/g, "<mark>$1</mark>");

  // 12. SUPERSCRIPT: X^2^ - Must be before subscript
  result = result.replace(/\^([^\^]+)\^/g, "<sup>$1</sup>");

  // 13. SUBSCRIPT: H~2~O - Single tilde, use negative lookbehind/lookahead to avoid ~~
  result = result.replace(/(?<!~)~([^~]+)~(?!~)/g, "<sub>$1</sub>");

  // 14. BOLD + ITALIC: ***text*** or ___text___
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  result = result.replace(/___([^_]+)___/g, "<strong><em>$1</em></strong>");

  // 15. BOLD: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 16. ITALIC: *text* or _text_ (but not inside words for underscores)
  // For asterisks, match any single asterisk pairs
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // For underscores, only match at word boundaries
  result = result.replace(/(^|[^a-zA-Z0-9])_([^_]+)_([^a-zA-Z0-9]|$)/g, "$1<em>$2</em>$3");

  // LAST: Restore escaped characters from placeholders to literals
  result = revertEscapes(result);

  return result;
}
