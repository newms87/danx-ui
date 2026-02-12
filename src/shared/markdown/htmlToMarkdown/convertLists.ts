/**
 * HTML list to markdown converter
 * Converts ul/ol elements with nested list support to markdown syntax
 */

import type { CustomElementProcessor } from "./index";
import { processInlineContent } from "./convertInline";

/**
 * Process list items with proper markers.
 * Handles nested lists by recursively processing ul/ol children with indentation.
 */
export function processListItems(
  listElement: Element,
  marker: string,
  customProcessor?: CustomElementProcessor
): string {
  const items: string[] = [];
  let index = 1;

  for (const child of Array.from(listElement.children)) {
    if (child.tagName.toLowerCase() === "li") {
      const prefix = marker === "1." ? `${index}. ` : `${marker} `;
      const content = processInlineContent(child, customProcessor);

      // Check for nested lists
      const nestedUl = child.querySelector("ul");
      const nestedOl = child.querySelector("ol");

      if (nestedUl || nestedOl) {
        // Get text content before nested list
        const textParts: string[] = [];
        for (const node of Array.from(child.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            textParts.push(node.textContent || "");
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.tagName.toLowerCase() !== "ul" && el.tagName.toLowerCase() !== "ol") {
              textParts.push(processInlineContent(el, customProcessor));
            }
          }
        }
        items.push(`${prefix}${textParts.join("").trim()}`);

        // Process nested list with indentation
        if (nestedUl) {
          const nestedItems = processListItems(nestedUl, "-", customProcessor)
            .split("\n")
            .filter(Boolean);
          items.push(...nestedItems.map((item) => `  ${item}`));
        }
        if (nestedOl) {
          const nestedItems = processListItems(nestedOl, "1.", customProcessor)
            .split("\n")
            .filter(Boolean);
          items.push(...nestedItems.map((item) => `  ${item}`));
        }
      } else {
        items.push(`${prefix}${content}`);
      }

      index++;
    }
  }

  return items.join("\n") + "\n\n";
}
