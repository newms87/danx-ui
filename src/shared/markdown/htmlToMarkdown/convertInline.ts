/**
 * Inline content to markdown converter
 * Handles text with inline formatting: bold, italic, code, links, images,
 * strikethrough, highlight, superscript, subscript, and line breaks
 */

import type { CustomElementProcessor } from "./index";

/**
 * Strip zero-width spaces from text content.
 * These are inserted by the inline formatting toggle to break out of formatting context.
 */
export function stripZeroWidthSpaces(text: string): string {
  return text.replace(/\u200B/g, "");
}

/**
 * Process inline content (text with inline formatting).
 * Handles nested inline elements like bold, italic, code, links.
 */
export function processInlineContent(
  element: Element,
  customProcessor?: CustomElementProcessor
): string {
  const parts: string[] = [];

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      // Strip zero-width spaces from text nodes
      parts.push(stripZeroWidthSpaces(child.textContent || ""));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      // Try custom processor first for token wrappers and other custom elements
      if (customProcessor) {
        const result = customProcessor(el);
        if (result !== null) {
          parts.push(result);
          continue;
        }
      }

      // Handle color-preview spans — return only the hex code text
      if (tagName === "span" && el.classList.contains("color-preview")) {
        parts.push(el.textContent || "");
        continue;
      }

      const content = processInlineContent(el, customProcessor);

      // Skip empty formatting elements
      if (
        !content &&
        ["strong", "b", "em", "i", "code", "del", "s", "mark", "sup", "sub"].includes(tagName)
      ) {
        continue;
      }

      switch (tagName) {
        case "strong":
        case "b":
          parts.push(`**${content}**`);
          break;
        case "em":
        case "i":
          parts.push(`*${content}*`);
          break;
        case "code":
          parts.push(`\`${el.textContent || ""}\``);
          break;
        case "a": {
          const href = el.getAttribute("href") || "";
          parts.push(`[${content}](${href})`);
          break;
        }
        case "img": {
          const src = el.getAttribute("src") || "";
          const alt = el.getAttribute("alt") || "";
          parts.push(`![${alt}](${src})`);
          break;
        }
        case "del":
        case "s":
          parts.push(`~~${content}~~`);
          break;
        case "mark":
          parts.push(`==${content}==`);
          break;
        case "sup":
          parts.push(`^${content}^`);
          break;
        case "sub":
          parts.push(`~${content}~`);
          break;
        case "br":
          parts.push("  \n");
          break;
        default:
          parts.push(content);
      }
    }
  }

  return parts.join("");
}
