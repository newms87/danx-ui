import { Ref } from "vue";
import { findAncestorByTag } from "./blockUtils";
import { getCursorOffset, setCursorOffset } from "./cursorOffset";

/**
 * Cursor position tracking for markdown editor
 */
export interface CursorPosition {
  /** Index of the block element containing the cursor */
  blockIndex: number;
  /** Character offset within the block */
  charOffset: number;
}

/**
 * Return type for useMarkdownSelection composable
 */
export interface UseMarkdownSelectionReturn {
  saveCursorPosition: () => CursorPosition | null;
  restoreCursorPosition: (position: CursorPosition) => void;
  getCurrentBlock: () => Element | null;
  getBlockIndex: () => number;
}

/** Tags recognized as block-level parents for cursor tracking */
const BLOCK_PARENT_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "DIV",
]);

/**
 * Get the block-level parent element (p, h1-h6, li, blockquote, etc.) containing the cursor
 */
function findBlockParent(node: Node, contentRef: HTMLElement): Element | null {
  return findAncestorByTag(node, contentRef, BLOCK_PARENT_TAGS);
}

/**
 * Get all direct block children of the content element
 */
function getBlockElements(contentRef: HTMLElement): Element[] {
  const blocks: Element[] = [];
  const blockTags = [
    "P",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "UL",
    "OL",
    "BLOCKQUOTE",
    "PRE",
    "DIV",
    "TABLE",
    "HR",
  ];

  for (const child of Array.from(contentRef.children)) {
    if (blockTags.includes(child.tagName)) {
      blocks.push(child);
    }
  }

  return blocks;
}

/**
 * Composable for cursor and selection management in markdown editor
 */
export function useMarkdownSelection(
  contentRef: Ref<HTMLElement | null>
): UseMarkdownSelectionReturn {
  /**
   * Get the current block element containing the cursor
   */
  function getCurrentBlock(): Element | null {
    if (!contentRef.value) return null;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    return findBlockParent(range.startContainer, contentRef.value);
  }

  /**
   * Get the index of the current block within the content element
   */
  function getBlockIndex(): number {
    if (!contentRef.value) return -1;

    const currentBlock = getCurrentBlock();
    if (!currentBlock) return -1;

    const blocks = getBlockElements(contentRef.value);
    return blocks.indexOf(currentBlock);
  }

  /**
   * Save current cursor position as block index + character offset
   */
  function saveCursorPosition(): CursorPosition | null {
    if (!contentRef.value) return null;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const currentBlock = getCurrentBlock();
    if (!currentBlock) {
      // Cursor is not in a block, save position relative to content root
      return {
        blockIndex: -1,
        charOffset: getCursorOffset(contentRef.value),
      };
    }

    const blocks = getBlockElements(contentRef.value);
    const blockIndex = blocks.indexOf(currentBlock);
    const charOffset = getCursorOffset(currentBlock as HTMLElement);

    return { blockIndex, charOffset };
  }

  /**
   * Restore cursor position from saved state
   */
  function restoreCursorPosition(position: CursorPosition): void {
    if (!contentRef.value) return;

    if (position.blockIndex === -1) {
      // Restore to content root level
      setCursorOffset(contentRef.value, position.charOffset);
      return;
    }

    const blocks = getBlockElements(contentRef.value);
    if (position.blockIndex >= 0 && position.blockIndex < blocks.length) {
      const block = blocks[position.blockIndex] as HTMLElement;
      setCursorOffset(block, position.charOffset);
    } else {
      // Block no longer exists, place cursor at end
      const range = document.createRange();
      range.selectNodeContents(contentRef.value);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return {
    saveCursorPosition,
    restoreCursorPosition,
    getCurrentBlock,
    getBlockIndex,
  };
}
