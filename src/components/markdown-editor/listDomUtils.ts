/**
 * List DOM Utilities
 *
 * Pure DOM query functions for list operations. Handles list item traversal,
 * parent list detection, list type identification, and content inspection.
 * No composable closure dependency - all functions take explicit parameters.
 *
 * Used by useLists and its sub-modules (listConversions, listIndentation)
 * for shared list DOM operations.
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { isListTag, getTargetBlock as getTargetBlockShared } from "./blockUtils";

/**
 * Get the block-level parent element for list operations.
 * Delegates to the shared getTargetBlock with list recognition enabled.
 */
export function getTargetBlock(
  contentRef: Ref<HTMLElement | null>,
  selection: UseMarkdownSelectionReturn
): Element | null {
  return getTargetBlockShared(contentRef, selection, { includeLists: true });
}

/**
 * Get the list item element containing the cursor
 */
export function getListItem(selection: UseMarkdownSelectionReturn): HTMLLIElement | null {
  const currentBlock = selection.getCurrentBlock();
  if (!currentBlock) return null;

  let current: Element | null = currentBlock;
  while (current) {
    if (current.tagName === "LI") {
      return current as HTMLLIElement;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * Get the parent list element (UL or OL) of a list item
 */
export function getParentList(li: HTMLLIElement): HTMLUListElement | HTMLOListElement | null {
  const parent = li.parentElement;
  if (parent && isListTag(parent.tagName)) {
    return parent as HTMLUListElement | HTMLOListElement;
  }
  return null;
}

/**
 * Check what type of list the cursor is in
 */
export function getListType(selection: UseMarkdownSelectionReturn): "ul" | "ol" | null {
  const li = getListItem(selection);
  if (!li) return null;

  const parentList = getParentList(li);
  if (!parentList) return null;

  return parentList.tagName.toLowerCase() as "ul" | "ol";
}

/**
 * Get direct text content of an element, excluding nested lists
 */
export function getDirectTextContent(element: Element): string {
  let text = "";
  const children = Array.from(element.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent || "";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      if (!isListTag(el.tagName)) {
        text += getDirectTextContent(el);
      }
    }
  }
  return text.trim();
}

/**
 * Check if cursor is at the end of an element
 */
export function isCursorAtEndOfElement(element: Element, range: Range): boolean {
  const testRange = document.createRange();
  testRange.setStart(range.endContainer, range.endOffset);
  testRange.setEndAfter(element.lastChild || element);
  return testRange.toString().trim() === "";
}
