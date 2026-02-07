/**
 * Parser state management for markdown rendering
 * Handles link references and footnotes across tokenization and rendering phases
 */

import type { LinkReference, FootnoteDefinition } from "./types";

/**
 * Module-level storage for link references extracted during tokenization
 * Used to share link definitions between tokenizeBlocks and parseInline
 */
let currentLinkRefs: Record<string, LinkReference> = {};

/**
 * Module-level storage for footnotes extracted during tokenization
 * Used to share footnote definitions between tokenizeBlocks and renderMarkdown
 */
let currentFootnotes: Record<string, FootnoteDefinition> = {};
let footnoteCounter = 0;

/**
 * Get the current footnotes (useful for Vue component rendering)
 */
export function getFootnotes(): Record<string, FootnoteDefinition> {
  return currentFootnotes;
}

/**
 * Get the current link references
 */
export function getLinkRefs(): Record<string, LinkReference> {
  return currentLinkRefs;
}

/**
 * Set a link reference
 */
export function setLinkRef(id: string, ref: LinkReference): void {
  currentLinkRefs[id] = ref;
}

/**
 * Set a footnote definition
 */
export function setFootnote(id: string, content: string): void {
  footnoteCounter++;
  currentFootnotes[id] = { content, index: footnoteCounter };
}

/**
 * Reset the parser state (link refs and footnotes)
 * Call this before starting a new document parse
 */
export function resetParserState(): void {
  currentLinkRefs = {};
  currentFootnotes = {};
  footnoteCounter = 0;
}
