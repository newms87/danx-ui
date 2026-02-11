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

import { Ref } from "vue";
import type { UseMarkdownHotkeysReturn } from "./useMarkdownHotkeys";
import type { UseCodeBlocksReturn } from "./useCodeBlocks";
import type { UseTablesReturn } from "./useTables";
import type { UseListsReturn } from "./useLists";
import type { UseMarkdownSyncReturn } from "./useMarkdownSync";
import { handleBackspaceIntoCodeBlock, handleCodeBlockLanguageCycle } from "./keyHandlerCodeBlock";

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
 * Creates the keydown event handler bound to editor dependencies.
 */
export function createKeyHandler(deps: KeyHandlerDeps): KeyHandlerReturn {
  const { contentRef, hotkeys, codeBlocks, tables, lists, sync, insertTabCharacter } = deps;

  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInCodeBlock = target?.closest("[data-code-block-id]");

    if (isInCodeBlock) {
      if (handleCodeBlockLanguageCycle(event, target, codeBlocks)) return;
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
      if (handleBackspaceIntoCodeBlock(contentRef, sync)) {
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
