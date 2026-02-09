/**
 * Table Cell Utilities
 *
 * Pure DOM utility functions for cell-level cursor and selection operations
 * within table cells. These handle cursor positioning, text node traversal,
 * and selection management with no composable closure dependency.
 *
 * Used by useTables and its sub-modules (useTableNavigation) for cell-level
 * cursor operations during table navigation.
 */

/**
 * Get the cursor offset (character position) within a cell.
 * Measures the text length from the start of the cell to the cursor position.
 */
export function getCursorOffsetInCell(cell: HTMLTableCellElement): number {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return 0;

  const range = selection.getRangeAt(0);

  // Create a range from cell start to cursor position
  const preCaretRange = document.createRange();
  preCaretRange.selectNodeContents(cell);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // Get text length up to cursor
  return preCaretRange.toString().length;
}

/**
 * Set the cursor at a specific character offset within a cell.
 * If the offset exceeds the cell's text length, places cursor at the end.
 */
export function setCursorOffsetInCell(cell: HTMLTableCellElement, targetOffset: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  const textContent = cell.textContent || "";
  const maxOffset = textContent.length;
  const offset = Math.min(targetOffset, maxOffset);

  // Find the text node and position for this offset
  let currentOffset = 0;
  const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
  let node: Text | null = null;

  while ((node = walker.nextNode() as Text | null)) {
    const nodeLength = node.textContent?.length || 0;
    if (currentOffset + nodeLength >= offset) {
      // Found the right node
      const range = document.createRange();
      range.setStart(node, offset - currentOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset += nodeLength;
  }

  // Fallback: place at end of cell
  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Get the first text node with actual content in an element
 */
export function getFirstTextNode(node: Node): Text | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // Return the text node even if it's empty/whitespace - we can position at offset 0
    return node as Text;
  }
  for (const child of Array.from(node.childNodes)) {
    // Skip BR elements - they're placeholders for empty cells
    if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === "BR") {
      continue;
    }
    const found = getFirstTextNode(child);
    if (found) return found;
  }
  return null;
}

/**
 * Place cursor at the start of a cell without selecting text
 */
export function focusCell(cell: HTMLTableCellElement): void {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();

  // Find first text node
  const firstTextNode = getFirstTextNode(cell);

  if (firstTextNode) {
    // Place cursor at start of text node
    range.setStart(firstTextNode, 0);
    range.collapse(true); // Collapse to start, no selection
  } else {
    // Empty cell or only has BR - position at start of cell contents
    range.selectNodeContents(cell);
    range.collapse(true); // Collapse to start, no selection
  }

  selection.removeAllRanges();
  selection.addRange(range);

  // Ensure the cell element itself has focus for keyboard events
  cell.focus();
}

/**
 * Select all content in a cell
 */
export function selectCellContent(cell: HTMLTableCellElement): void {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(cell);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Get the current selection range if valid
 */
export function getCurrentSelectionRange(): Range | null {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  return selection.getRangeAt(0);
}
