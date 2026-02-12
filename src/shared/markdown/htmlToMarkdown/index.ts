/**
 * HTML to Markdown converter
 * Converts HTML content back to markdown source
 */

import { processNode } from "./convertBlocks";
import { stripZeroWidthSpaces } from "./convertInline";

/**
 * Custom element processor for extending htmlToMarkdown.
 * If the processor returns a string, that string is used as the markdown for the element.
 * If it returns null, the default processing is used.
 */
export type CustomElementProcessor = (element: Element) => string | null;

/**
 * Options for htmlToMarkdown
 */
export interface HtmlToMarkdownOptions {
  /** Optional processor for custom element types (e.g., code block wrappers, token wrappers) */
  customElementProcessor?: CustomElementProcessor;
}

/**
 * Characters that have special meaning in markdown and may need escaping
 */
const MARKDOWN_SPECIAL_CHARS = /([\\`*_{}[\]()#+\-.!])/g;

/**
 * Escape markdown special characters in text
 * @param text - Plain text that may contain special characters
 * @returns Text with special characters escaped
 */
export function escapeMarkdownChars(text: string): string {
  return text.replace(MARKDOWN_SPECIAL_CHARS, "\\$1");
}

/**
 * Convert HTML content to markdown.
 * Supports custom element processing via options.customElementProcessor for
 * handling application-specific elements (e.g., code block wrappers with reactive state,
 * custom token wrappers).
 * @param html - HTML string or HTMLElement
 * @param options - Optional configuration
 * @returns Markdown string
 */
export function htmlToMarkdown(
  html: string | HTMLElement,
  options?: HtmlToMarkdownOptions
): string {
  let container: HTMLElement;

  if (typeof html === "string") {
    // Create a temporary element to parse the HTML
    container = document.createElement("div");
    container.innerHTML = html;
  } else {
    container = html;
  }

  const markdown = processNode(container, options?.customElementProcessor);

  // Clean up extra whitespace - normalize multiple newlines to max 2
  // Also strip any remaining zero-width spaces as a safety net
  return stripZeroWidthSpaces(markdown)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Re-export heading utilities
export { convertHeading, isHeadingElement, getHeadingLevel } from "./convertHeadings";
