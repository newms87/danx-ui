/**
 * Heading Utilities
 *
 * Constants and pure DOM functions for heading operations.
 * Maps between heading levels and tag names, and converts
 * block elements between heading types.
 *
 * @see useHeadings.ts for composable orchestration
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectHeadingPattern } from "../../shared/markdown";
import { getTargetBlock as getTargetBlockShared } from "./blockUtils";

/**
 * Heading level hierarchy
 * Level 0 = paragraph (P)
 * Level 1-6 = H1-H6
 */
export type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Map tag names to heading levels
 */
export const TAG_TO_LEVEL: Record<string, HeadingLevel> = {
  P: 0,
  DIV: 0,
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

/**
 * Map heading levels to tag names
 */
export const LEVEL_TO_TAG: Record<HeadingLevel, string> = {
  0: "P",
  1: "H1",
  2: "H2",
  3: "H3",
  4: "H4",
  5: "H5",
  6: "H6",
};

/**
 * Convert a block element to a different heading level.
 * Preserves the element's content and attributes.
 */
export function convertElement(element: Element, newTagName: string): Element {
  const newElement = document.createElement(newTagName);

  while (element.firstChild) {
    newElement.appendChild(element.firstChild);
  }

  for (const attr of Array.from(element.attributes)) {
    if (attr.name !== "id") {
      newElement.setAttribute(attr.name, attr.value);
    }
  }

  element.parentNode?.replaceChild(newElement, element);

  return newElement;
}

/**
 * Get the heading/paragraph element containing the cursor.
 * Returns null if the cursor is in a list item, code block, or other non-heading block.
 */
export function getHeadingTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn
): Element | null {
  const block = getTargetBlockShared(contentRef, selection);
  if (!block) return null;

  return block.tagName in TAG_TO_LEVEL ? block : null;
}

/**
 * Detect a heading pattern in a paragraph/div block and convert it.
 * Returns the new heading element if converted, null otherwise.
 */
export function convertHeadingPattern(block: Element): Element | null {
  if (block.tagName !== "P" && block.tagName !== "DIV") return null;

  const textContent = block.textContent || "";
  const pattern = detectHeadingPattern(textContent);
  if (!pattern) return null;

  const level = pattern.level as HeadingLevel;
  const newTagName = LEVEL_TO_TAG[level];
  const newElement = document.createElement(newTagName);

  newElement.textContent = pattern.content;

  for (const attr of Array.from(block.attributes)) {
    if (attr.name !== "id") {
      newElement.setAttribute(attr.name, attr.value);
    }
  }

  block.parentNode?.replaceChild(newElement, block);

  const sel = window.getSelection();
  if (sel && newElement.firstChild) {
    const range = document.createRange();
    const textNode = newElement.firstChild;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const offset = textNode.textContent?.length || 0;
      range.setStart(textNode, offset);
      range.collapse(true);
    } else {
      range.selectNodeContents(newElement);
      range.collapse(false);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  }

  return newElement;
}
