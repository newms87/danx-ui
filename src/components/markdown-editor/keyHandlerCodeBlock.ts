/**
 * Key Handler — Code Block Helpers
 *
 * Extracted from editorKeyHandlers for single-responsibility decomposition.
 * Contains:
 * - getCursorBlockAtStart: checks if cursor is at position 0 of a block
 * - handleBackspaceIntoCodeBlock: moves cursor into the preceding code block
 * - handleCodeBlockLanguageCycle: Ctrl+Alt+L language cycling inside code blocks
 */

import { nextTick, Ref } from "vue";
import { isConvertibleBlock } from "./blockUtils";
import type { UseCodeBlocksReturn } from "./useCodeBlocks";
import type { UseMarkdownSyncReturn } from "./useMarkdownSync";

/**
 * Check if cursor is at the start of a block element.
 * Returns the block element if cursor is at position 0, null otherwise.
 */
export function getCursorBlockAtStart(contentRef: Ref<HTMLElement | null>): HTMLElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!range.collapsed) return null;
  if (range.startOffset !== 0) return null;

  let node: Node | null = range.startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent) return null;
    node = parent;
  }

  while (node && node !== contentRef.value) {
    const element = node as HTMLElement;

    if (isConvertibleBlock(element)) {
      const blockRange = document.createRange();
      blockRange.selectNodeContents(element);
      blockRange.collapse(true);

      if (range.compareBoundaryPoints(Range.START_TO_START, blockRange) === 0) {
        return element;
      }
      return null;
    }

    node = element.parentElement;
  }

  return null;
}

/**
 * Handle Backspace at the start of a paragraph after a code block.
 * Moves cursor into the code block instead of deleting.
 */
export function handleBackspaceIntoCodeBlock(
  contentRef: Ref<HTMLElement | null>,
  sync: UseMarkdownSyncReturn
): boolean {
  const block = getCursorBlockAtStart(contentRef);
  if (!block) return false;

  const previousSibling = block.previousElementSibling;
  if (!previousSibling?.hasAttribute("data-code-block-id")) return false;

  const isEmpty = !block.textContent?.trim();
  const codeViewerPre = previousSibling.querySelector("pre[contenteditable='true']");
  if (!codeViewerPre) return false;

  if (isEmpty) {
    block.remove();
  }

  nextTick(() => {
    (codeViewerPre as HTMLElement).focus();

    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(codeViewerPre);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  sync.debouncedSyncFromHtml();
  return true;
}

/**
 * Handle Ctrl+Alt+L inside a code block for language cycling.
 * Returns true if the event was handled.
 */
export function handleCodeBlockLanguageCycle(
  event: KeyboardEvent,
  target: HTMLElement | null,
  codeBlocks: UseCodeBlocksReturn
): boolean {
  const isCtrlAltL =
    (event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "l";
  if (!isCtrlAltL) return false;

  event.preventDefault();
  event.stopPropagation();

  const wrapper = target?.closest("[data-code-block-id]");
  const codeBlockId = wrapper?.getAttribute("data-code-block-id");

  if (codeBlockId) {
    const state = codeBlocks.codeBlocks.get(codeBlockId);

    if (state) {
      const currentLang = state.language || "yaml";
      let nextLang: string;

      if (currentLang === "json" || currentLang === "yaml") {
        nextLang = currentLang === "yaml" ? "json" : "yaml";
      } else if (currentLang === "text" || currentLang === "markdown") {
        nextLang = currentLang === "text" ? "markdown" : "text";
      } else {
        nextLang = currentLang;
      }

      if (nextLang !== currentLang) {
        codeBlocks.updateCodeBlockLanguage(codeBlockId, nextLang);
      }
    }
  }

  return true;
}
