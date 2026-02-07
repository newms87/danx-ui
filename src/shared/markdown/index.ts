/**
 * Lightweight markdown to HTML renderer
 * Zero external dependencies, XSS-safe by default
 *
 * Supports:
 * - Headings (# through ###### and setext-style with === or ---)
 * - Paragraphs (double newlines)
 * - Code blocks (```language ... ``` and indented with 4 spaces or tab)
 * - Blockquotes (> text)
 * - Unordered lists (-, *, +)
 * - Ordered lists (1., 2., etc.)
 * - Task lists (- [ ] unchecked, - [x] checked)
 * - Definition lists (Term followed by : Definition)
 * - Tables (| col | col | with alignment support)
 * - Horizontal rules (---, ***, ___)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold+Italic (***text***)
 * - Inline code (`code`)
 * - Links [text](url)
 * - Reference-style links ([text][ref], [text][], [ref] with [ref]: url definitions)
 * - Images ![alt](url)
 * - Escape sequences (\* \_ \~ etc.)
 * - Hard line breaks (two trailing spaces)
 * - Autolinks (<https://...> and <email@...>)
 * - Strikethrough (~~text~~)
 * - Highlight (==text==)
 * - Superscript (X^2^)
 * - Subscript (H~2~O)
 * - Footnotes ([^id] with [^id]: content definitions)
 */

// Re-export HTML to Markdown converter
export { htmlToMarkdown, escapeMarkdownChars } from "./htmlToMarkdown";
export {
  convertHeading,
  isHeadingElement,
  getHeadingLevel,
} from "./htmlToMarkdown/convertHeadings";

// Re-export line pattern detection
export * from "./linePatterns";

// Re-export types
export type {
  MarkdownRenderOptions,
  LinkReference,
  FootnoteDefinition,
  ListItem,
  BlockToken,
  TableAlignment,
  ParseResult,
} from "./types";

// Re-export state management
export { getFootnotes, resetParserState } from "./state";

// Re-export parsers
export { parseInline } from "./parseInline";
export { tokenizeBlocks } from "./tokenize";

// Re-export renderers
export { renderTokens } from "./render";

// Import for main function
import type { MarkdownRenderOptions } from "./types";
import { getFootnotes, resetParserState } from "./state";
import { tokenizeBlocks } from "./tokenize";
import { renderTokens } from "./render";
import { renderFootnotesSection } from "./render/renderFootnotes";

/**
 * Convert markdown text to HTML
 */
export function renderMarkdown(markdown: string, options?: MarkdownRenderOptions): string {
  if (!markdown) return "";

  const sanitize = options?.sanitize ?? true;
  const preserveState = options?.preserveState ?? false;

  // Reset state for fresh document parse (unless preserving for nested rendering)
  if (!preserveState) {
    resetParserState();
  }

  const tokens = tokenizeBlocks(markdown);
  let html = renderTokens(tokens, sanitize);

  // Append footnotes section if any exist (only for top-level rendering)
  const footnotes = getFootnotes();
  if (!preserveState && Object.keys(footnotes).length > 0) {
    html += renderFootnotesSection(footnotes, sanitize);
  }

  return html;
}
