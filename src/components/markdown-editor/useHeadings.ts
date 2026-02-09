/**
 * Headings Composable
 *
 * Provides heading level management for the markdown editor.
 * Delegates constants and DOM operations to headingUtils module.
 *
 * @see headingUtils.ts for constants and pure DOM functions
 */

import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import {
  HeadingLevel,
  TAG_TO_LEVEL,
  LEVEL_TO_TAG,
  convertElement,
  getHeadingTargetBlock,
  convertHeadingPattern,
} from "./headingUtils";

/**
 * Options for useHeadings composable
 */
export interface UseHeadingsOptions {
  contentRef: Ref<HTMLElement | null>;
  selection: UseMarkdownSelectionReturn;
  onContentChange: () => void;
}

/**
 * Return type for useHeadings composable
 */
export interface UseHeadingsReturn {
  /** Set heading level (0 = paragraph, 1-6 = h1-h6) */
  setHeadingLevel: (level: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  /** Increase heading level (P -> H6 -> H5 -> ... -> H1) */
  increaseHeadingLevel: () => void;
  /** Decrease heading level (H1 -> H2 -> ... -> H6 -> P) */
  decreaseHeadingLevel: () => void;
  /** Get current heading level (0 for paragraph) */
  getCurrentHeadingLevel: () => number;
  /** Check for heading pattern (e.g., "# ") and convert if matched */
  checkAndConvertHeadingPattern: () => boolean;
}

/**
 * Composable for heading-specific operations in markdown editor.
 * Delegates constants and DOM ops to headingUtils.
 */
export function useHeadings(options: UseHeadingsOptions): UseHeadingsReturn {
  const { contentRef, selection, onContentChange } = options;

  function getCurrentHeadingLevel(): number {
    const block = getHeadingTargetBlock(contentRef, selection);
    if (!block) return -1;

    return TAG_TO_LEVEL[block.tagName] ?? -1;
  }

  function setHeadingLevel(level: HeadingLevel): void {
    const block = getHeadingTargetBlock(contentRef, selection);
    if (!block) return;

    const currentLevel = TAG_TO_LEVEL[block.tagName];
    if (currentLevel === level) return;

    const cursorPos = selection.saveCursorPosition();

    const newTagName = LEVEL_TO_TAG[level];
    convertElement(block, newTagName);

    if (cursorPos) {
      selection.restoreCursorPosition(cursorPos);
    }

    onContentChange();
  }

  function increaseHeadingLevel(): void {
    const currentLevel = getCurrentHeadingLevel();
    if (currentLevel === -1) return;

    let newLevel: HeadingLevel;
    if (currentLevel === 0) {
      newLevel = 6;
    } else if (currentLevel === 1) {
      return;
    } else {
      newLevel = (currentLevel - 1) as HeadingLevel;
    }

    setHeadingLevel(newLevel);
  }

  function decreaseHeadingLevel(): void {
    const currentLevel = getCurrentHeadingLevel();
    if (currentLevel === -1) return;

    let newLevel: HeadingLevel;
    if (currentLevel === 0) {
      return;
    } else if (currentLevel === 6) {
      newLevel = 0;
    } else {
      newLevel = (currentLevel + 1) as HeadingLevel;
    }

    setHeadingLevel(newLevel);
  }

  function checkAndConvertHeadingPattern(): boolean {
    const block = getHeadingTargetBlock(contentRef, selection);
    if (!block) return false;

    const result = convertHeadingPattern(block);
    if (!result) return false;

    onContentChange();
    return true;
  }

  return {
    setHeadingLevel,
    increaseHeadingLevel,
    decreaseHeadingLevel,
    getCurrentHeadingLevel,
    checkAndConvertHeadingPattern,
  };
}
