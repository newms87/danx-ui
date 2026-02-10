/**
 * Shared block-level DOM utilities for the markdown editor.
 *
 * These functions handle detection and traversal of block-level elements
 * (paragraphs, headings, divs, list items, code blocks). They are used
 * by useCodeBlocks, useLists, useHeadings, useLinks, and MarkdownEditorContent.
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";

/**
 * Set of tag names that can be converted between paragraphs, headings,
 * lists, and code blocks.
 */
export const CONVERTIBLE_BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"]);

/**
 * Check if a tag name is a heading (H1-H6)
 */
export function isHeadingTag(tag: string): boolean {
  return /^H[1-6]$/.test(tag);
}

/**
 * Check if a tag name is a list container (UL or OL)
 */
export function isListTag(tag: string): boolean {
  return tag === "UL" || tag === "OL";
}

/**
 * Check if a tag name is a list item (LI)
 */
export function isListItemTag(tag: string): boolean {
  return tag === "LI";
}

/**
 * Check if an element is a block type that can be converted between
 * paragraphs, headings, lists, and code blocks.
 * Includes paragraphs, divs, and headings (H1-H6).
 */
export function isConvertibleBlock(element: Element): boolean {
  return CONVERTIBLE_BLOCK_TAGS.has(element.tagName);
}

/**
 * Get the block-level parent element containing the cursor.
 * Walks up the DOM tree from the current selection to find the nearest
 * convertible block, list item, or code block wrapper.
 *
 * @param contentRef - Reference to the contenteditable root element
 * @param selection - The markdown selection composable
 * @param options - Additional element types to recognize during traversal
 */
export function getTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn,
  options?: {
    /** Also recognize code block wrappers and PRE elements */
    includeCodeBlocks?: boolean;
    /** Also recognize list items */
    includeLists?: boolean;
  }
): Element | null {
  const currentBlock = selection.getCurrentBlock();
  if (!currentBlock) return null;

  const includeCodeBlocks = options?.includeCodeBlocks ?? false;
  const includeLists = options?.includeLists ?? false;

  // Check if the current block is a directly recognized type
  if (isConvertibleBlock(currentBlock)) {
    return currentBlock;
  }
  if (includeLists && currentBlock.tagName === "LI") {
    return currentBlock;
  }
  if (
    includeCodeBlocks &&
    (currentBlock.tagName === "PRE" || currentBlock.hasAttribute("data-code-block-id"))
  ) {
    return currentBlock;
  }

  // Walk up to find a recognized block element (contentRef.value is guaranteed
  // non-null here because getCurrentBlock already checked it)
  let current: Element | null = currentBlock;
  while (current && current.parentElement !== contentRef.value) {
    if (isConvertibleBlock(current)) return current;
    if (includeLists && current.tagName === "LI") return current;
    if (
      includeCodeBlocks &&
      (current.tagName === "PRE" ||
        current.tagName === "LI" ||
        current.hasAttribute("data-code-block-id"))
    ) {
      return current;
    }
    current = current.parentElement;
  }

  // Check if this direct child is a recognized block type
  if (current) {
    if (isConvertibleBlock(current)) return current;
    if (
      includeCodeBlocks &&
      (current.tagName === "PRE" || current.hasAttribute("data-code-block-id"))
    ) {
      return current;
    }
  }

  return null;
}

/**
 * Find the anchor element ancestor of a node within a container.
 * Used for Ctrl+Click link opening and link editing.
 */
export function findLinkAncestor(
  node: Node | null,
  container: HTMLElement
): HTMLAnchorElement | null {
  if (!node) return null;

  let current: Node | null = node;
  while (current && current !== container) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === "A") {
      return current as HTMLAnchorElement;
    }
    current = current.parentNode;
  }

  return null;
}
