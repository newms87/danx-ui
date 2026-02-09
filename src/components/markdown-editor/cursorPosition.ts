/**
 * Cursor Position Utilities
 *
 * Functions for positioning the cursor, getting viewport coordinates,
 * dispatching input events, and saving/restoring selection state.
 */

/**
 * Zero-width space character used as cursor anchor in empty elements.
 * Necessary because contenteditable doesn't position the cursor
 * correctly in empty elements.
 */
export const CURSOR_ANCHOR = "\u200B";

/** Position for popover display (viewport coordinates) */
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
 * If the element contains a zero-width space cursor anchor, positions after it.
 */
export function positionCursorAtStart(element: Element): void {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const firstTextNode = walker.nextNode() as Text | null;

  if (firstTextNode) {
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

  if (rect.width === 0 && rect.height === 0) {
    return {
      x: rect.left || window.innerWidth / 2,
      y: rect.bottom || window.innerHeight / 2,
    };
  }

  return {
    x: rect.left + rect.width / 2,
    y: rect.bottom,
  };
}

/**
 * Dispatch an input event to trigger content sync.
 */
export function dispatchInputEvent(element: HTMLElement): void {
  element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/**
 * Save and restore selection state for operations that lose focus.
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
