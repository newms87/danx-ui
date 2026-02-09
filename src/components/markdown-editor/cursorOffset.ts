/**
 * Cursor Offset Utilities
 *
 * Functions for getting and setting cursor offset within an element's
 * text content. Supports filtering out text nodes inside specified
 * ancestor tags (used by list indentation to ignore nested lists).
 */

import { positionCursorAtEnd } from "./cursorPosition";

/** Options for cursor offset functions */
export interface CursorOffsetOptions {
  /** Tag names whose descendant text nodes should be excluded from offset counting */
  skipAncestorTags?: string[];
}

/**
 * Check if a node is inside an ancestor with one of the given tag names,
 * stopping the search at the container boundary.
 */
function isInsideSkippedAncestor(node: Node, container: Node, tags: string[]): boolean {
  let parent: Node | null = node.parentNode;
  while (parent && parent !== container) {
    if (parent.nodeType === Node.ELEMENT_NODE && tags.includes((parent as Element).tagName)) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

/**
 * Get the cursor offset within an element's text content.
 * Walks text nodes and counts characters up to the cursor position.
 *
 * When `skipAncestorTags` is provided, text nodes inside elements with
 * those tag names are excluded from the count.
 */
export function getCursorOffset(element: HTMLElement, options?: CursorOffsetOptions): number {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return 0;

  const skipTags = options?.skipAncestorTags;

  if (!skipTags || skipTags.length === 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = document.createRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }

  const range = selection.getRangeAt(0);

  let offset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    if (isInsideSkippedAncestor(node, element, skipTags)) continue;

    if (node === range.startContainer) {
      offset += range.startOffset;
      break;
    }

    if (element.contains(range.startContainer)) {
      const position = node.compareDocumentPosition(range.startContainer);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        offset += node.textContent?.length || 0;
      } else {
        break;
      }
    } else {
      offset += node.textContent?.length || 0;
    }
  }

  return offset;
}

/**
 * Set cursor to a specific offset within an element's text content.
 * Walks text nodes to find the correct position.
 *
 * When `skipAncestorTags` is provided, text nodes inside elements with
 * those tag names are excluded from offset traversal.
 */
export function setCursorOffset(
  element: HTMLElement,
  targetOffset: number,
  options?: CursorOffsetOptions
): void {
  const selection = window.getSelection();
  if (!selection) return;

  const skipTags = options?.skipAncestorTags;

  let currentOffset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (skipTags && skipTags.length > 0 && isInsideSkippedAncestor(node, element, skipTags)) {
      node = walker.nextNode();
      continue;
    }

    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= targetOffset) {
      const range = document.createRange();
      range.setStart(node, targetOffset - currentOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset += nodeLength;
    node = walker.nextNode();
  }

  positionCursorAtEnd(element);
}
