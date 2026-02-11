/**
 * Blockquote Composable
 *
 * Provides toggle and detection for blockquote elements in the markdown editor.
 * Handles wrapping/unwrapping the current block in a <blockquote>, preserving
 * cursor position across transformations via cursorOffset helpers.
 */

import { Ref } from "vue";
import { getCursorOffset, setCursorOffset } from "./cursorOffset";
import { CONVERTIBLE_BLOCK_TAGS, findAncestorByTag } from "./blockUtils";

/**
 * Options for useBlockquotes composable
 */
export interface UseBlockquotesOptions {
  contentRef: Ref<HTMLElement | null>;
  onContentChange: () => void;
}

/**
 * Return type for useBlockquotes composable
 */
export interface UseBlockquotesReturn {
  /** Toggle blockquote on the current block */
  toggleBlockquote: () => void;
  /** Check if cursor is inside a blockquote */
  isInBlockquote: () => boolean;
}

/** Tags recognized as the current block in blockquote context */
const BLOCKQUOTE_BLOCK_TAGS = new Set([...CONVERTIBLE_BLOCK_TAGS, "BLOCKQUOTE"]);

const BLOCKQUOTE_ONLY = new Set(["BLOCKQUOTE"]);

/**
 * Find the nearest block-level element containing the cursor
 */
function findCurrentBlock(node: Node, contentRef: HTMLElement): Element | null {
  return findAncestorByTag(node, contentRef, BLOCKQUOTE_BLOCK_TAGS);
}

/**
 * Find the blockquote ancestor if one exists
 */
function findBlockquoteAncestor(node: Node, contentRef: HTMLElement): HTMLQuoteElement | null {
  return findAncestorByTag(node, contentRef, BLOCKQUOTE_ONLY) as HTMLQuoteElement | null;
}

/**
 * Composable for blockquote operations in markdown editor
 */
export function useBlockquotes(options: UseBlockquotesOptions): UseBlockquotesReturn {
  const { contentRef, onContentChange } = options;

  /**
   * Check if the cursor is currently inside a blockquote
   */
  function isInBlockquote(): boolean {
    if (!contentRef.value) return false;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    return findBlockquoteAncestor(range.startContainer, contentRef.value) !== null;
  }

  /**
   * Toggle blockquote on the current block
   *
   * Behavior:
   * - If cursor is inside a blockquote: unwrap the block from the blockquote
   * - If cursor is not in a blockquote: wrap the current block in a blockquote
   * - Preserves cursor position after transformation
   */
  function toggleBlockquote(): void {
    if (!contentRef.value) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if selection is within our content area
    if (!contentRef.value.contains(range.startContainer)) return;

    const blockquote = findBlockquoteAncestor(range.startContainer, contentRef.value);

    if (blockquote) {
      unwrapBlockquote(blockquote);
    } else {
      wrapInBlockquote();
    }

    onContentChange();
  }

  /**
   * Unwrap content from a blockquote
   */
  function unwrapBlockquote(blockquote: HTMLQuoteElement): void {
    // parentNode is guaranteed non-null since we only call this for blockquotes
    // found in the content area via findBlockquoteAncestor
    const parent = blockquote.parentNode!;

    // Save cursor position
    const selection = window.getSelection();
    let cursorOffset = 0;
    let targetBlock: Element | null = null;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const currentBlock = findCurrentBlock(range.startContainer, contentRef.value!);

      // If the current block is inside the blockquote, get its offset
      if (currentBlock && blockquote.contains(currentBlock)) {
        targetBlock = currentBlock;
        cursorOffset = getCursorOffset(currentBlock as HTMLElement);
      } else if (currentBlock === blockquote) {
        // Cursor is directly in blockquote text node
        cursorOffset = getCursorOffset(blockquote);
      }
    }

    // Move all children out of the blockquote
    const children = Array.from(blockquote.childNodes);
    let firstMovedElement: Element | null = null;

    for (const child of children) {
      const insertedNode = parent.insertBefore(child, blockquote);
      if (!firstMovedElement && insertedNode.nodeType === Node.ELEMENT_NODE) {
        firstMovedElement = insertedNode as Element;
      }
    }

    // Remove the empty blockquote
    parent.removeChild(blockquote);

    // Restore cursor position
    if (targetBlock && parent.contains(targetBlock)) {
      setCursorOffset(targetBlock as HTMLElement, cursorOffset);
    } else if (firstMovedElement) {
      setCursorOffset(firstMovedElement as HTMLElement, cursorOffset);
    }
  }

  /**
   * Wrap the current block in a blockquote
   */
  function wrapInBlockquote(): void {
    // contentRef.value and selection are guaranteed by toggleBlockquote
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);
    const currentBlock = findCurrentBlock(range.startContainer, contentRef.value!);

    if (!currentBlock) return;

    // Save cursor position
    const cursorOffset = getCursorOffset(currentBlock as HTMLElement);

    // Create blockquote and wrap the block
    const blockquote = document.createElement("blockquote");

    // Insert blockquote before the current block (parentNode guaranteed since block is in content area)
    currentBlock.parentNode!.insertBefore(blockquote, currentBlock);

    // Move the block into the blockquote
    blockquote.appendChild(currentBlock);

    // Restore cursor position
    setCursorOffset(currentBlock as HTMLElement, cursorOffset);
  }

  return {
    toggleBlockquote,
    isInBlockquote,
  };
}
