/**
 * Editor Key Handlers
 *
 * Handles keydown event routing for the markdown editor. Routes key events
 * to the appropriate feature composable: Enter for code blocks/tables/lists,
 * Tab for table navigation/list indentation, Arrow keys for table navigation,
 * Backspace for code block entry, and all other keys to the hotkey system.
 *
 * The onKeyDown function is the single entry point for all keyboard events
 * in the contenteditable area (excluding code block internals).
 */

import { nextTick, Ref } from "vue";
import { isConvertibleBlock } from "./blockUtils";
import type { UseMarkdownHotkeysReturn } from "./useMarkdownHotkeys";
import type { UseCodeBlocksReturn } from "./useCodeBlocks";
import type { UseTablesReturn } from "./useTables";
import type { UseListsReturn } from "./useLists";
import type { UseMarkdownSyncReturn } from "./useMarkdownSync";

/**
 * Dependencies for the key handler
 */
export interface KeyHandlerDeps {
  contentRef: Ref<HTMLElement | null>;
  hotkeys: UseMarkdownHotkeysReturn;
  codeBlocks: UseCodeBlocksReturn;
  tables: UseTablesReturn;
  lists: UseListsReturn;
  sync: UseMarkdownSyncReturn;
  insertTabCharacter: () => void;
}

/**
 * Return type for createKeyHandler factory
 */
export interface KeyHandlerReturn {
  onKeyDown: (event: KeyboardEvent) => void;
}

/**
 * Check if cursor is at the start of a block element.
 * Returns the block element if cursor is at position 0, null otherwise.
 */
function getCursorBlockAtStart(contentRef: Ref<HTMLElement | null>): HTMLElement | null {
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
function handleBackspaceIntoCodeBlock(deps: KeyHandlerDeps): boolean {
  const block = getCursorBlockAtStart(deps.contentRef);
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

  deps.sync.debouncedSyncFromHtml();
  return true;
}

/**
 * Creates the keydown event handler bound to editor dependencies.
 */
export function createKeyHandler(deps: KeyHandlerDeps): KeyHandlerReturn {
  const { contentRef, hotkeys, codeBlocks, tables, lists, sync, insertTabCharacter } = deps;

  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInCodeBlock = target?.closest("[data-code-block-id]");

    // Handle Ctrl+Alt+L for code block language cycling
    const isCtrlAltL =
      (event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === "l";

    if (isInCodeBlock && isCtrlAltL) {
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
      return;
    }

    if (isInCodeBlock) {
      return;
    }

    // Handle Backspace at the start of a paragraph after a code block
    if (
      event.key === "Backspace" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      if (handleBackspaceIntoCodeBlock(deps)) {
        event.preventDefault();
        return;
      }
    }

    // Handle arrow keys in tables
    if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey
    ) {
      if (tables.isInTable()) {
        const handled =
          event.key === "ArrowUp" ? tables.navigateToCellAbove() : tables.navigateToCellBelow();
        if (handled) {
          event.preventDefault();
          return;
        }
      }
    }

    // Handle Enter for code block, table, and list continuation
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      const convertedToCodeBlock = codeBlocks.checkAndConvertCodeBlockPattern();
      if (convertedToCodeBlock) {
        event.preventDefault();
        return;
      }

      if (tables.isInTable()) {
        event.preventDefault();
        tables.handleTableEnter();
        return;
      }

      const handled = lists.handleListEnter();
      if (handled) {
        event.preventDefault();
        return;
      }
    }

    // Handle Tab key
    if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();

      if (tables.isInTable()) {
        tables.handleTableTab(event.shiftKey);
        return;
      }

      if (event.shiftKey) {
        lists.outdentListItem();
      } else {
        const handled = lists.indentListItem();
        if (!handled) {
          insertTabCharacter();
        }
      }
      return;
    }

    hotkeys.handleKeyDown(event);
  }

  return { onKeyDown };
}
