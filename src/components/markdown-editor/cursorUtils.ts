/**
 * Shared cursor and selection utilities for the markdown editor.
 *
 * These functions handle DOM cursor positioning, selection save/restore,
 * and viewport coordinate calculation. They are used across multiple
 * feature composables (useCodeBlocks, useLists, useBlockquotes,
 * useLinks, useTables, useMarkdownSelection).
 */

/**
 * Zero-width space character used as cursor anchor in empty elements.
 * This is necessary because contenteditable doesn't position the cursor
 * correctly in empty elements - subsequent typing ends up as sibling nodes.
 */
export const CURSOR_ANCHOR = "\u200B";

/**
 * Position for popover display (viewport coordinates)
 */
export interface CursorViewportPosition {
  x: number;
  y: number;
}

/**
 * Position cursor at end of element by finding the last text node.
 */
export function positionCursorAtEnd(element: Element): void {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();

  // Find last text node
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let lastTextNode: Text | null = null;
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    lastTextNode = node;
  }

  if (lastTextNode) {
    range.setStart(lastTextNode, lastTextNode.length);
    range.collapse(true);
  } else {
    range.selectNodeContents(element);
    range.collapse(false);
  }

  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Position cursor at start of element.
 * If the element contains a zero-width space cursor anchor, positions after it
 * so typing replaces/follows the anchor rather than creating sibling nodes.
 */
export function positionCursorAtStart(element: Element): void {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();

  // Find first text node
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const firstTextNode = walker.nextNode() as Text | null;

  if (firstTextNode) {
    // If there's a cursor anchor (zero-width space), position after it
    // so typing goes into the element rather than creating siblings
    if (firstTextNode.textContent === CURSOR_ANCHOR) {
      range.setStart(firstTextNode, firstTextNode.length);
    } else {
      range.setStart(firstTextNode, 0);
    }
    range.collapse(true);
  } else {
    range.selectNodeContents(element);
    range.collapse(true);
  }

  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Get the cursor offset within an element's text content.
 * Walks text nodes and counts characters up to the cursor position.
 */
export function getCursorOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = document.createRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  return preCaretRange.toString().length;
}

/**
 * Set cursor to a specific offset within an element's text content.
 * Walks text nodes to find the correct position.
 */
export function setCursorOffset(element: HTMLElement, targetOffset: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
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

  // If offset not found, place cursor at end
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Get the cursor position in viewport coordinates.
 * Used to position popovers near the cursor.
 */
export function getCursorViewportPosition(): CursorViewportPosition {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // If rect has no dimensions (collapsed cursor), use the start position
  if (rect.width === 0 && rect.height === 0) {
    return {
      x: rect.left || window.innerWidth / 2,
      y: rect.bottom || window.innerHeight / 2,
    };
  }

  // Center horizontally on the selection, position below
  return {
    x: rect.left + rect.width / 2,
    y: rect.bottom,
  };
}

/**
 * Dispatch an input event to trigger content sync.
 * Used after programmatic DOM changes to notify the editor.
 */
export function dispatchInputEvent(element: HTMLElement): void {
  element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/**
 * Save and restore selection state for operations that lose focus
 * (e.g., popover interactions).
 */
export function createSelectionManager(): {
  save: () => void;
  restore: () => void;
} {
  let savedRange: Range | null = null;

  function save(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  function restore(): void {
    if (savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    }
  }

  return { save, restore };
}
