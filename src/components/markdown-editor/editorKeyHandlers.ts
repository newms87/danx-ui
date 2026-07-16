/**
 * Editor Key Handlers
 *
 * Handles keydown event routing for the markdown editor. Routes key events
 * to the appropriate feature composable: Enter for code blocks/tables/lists,
 * Tab for table navigation/list indentation, Arrow keys for table navigation,
 * Backspace for code block entry, and all other keys to the hotkey system.
 *
 * Tab is only intercepted when the caret is inside a table cell or a list
 * item, where it navigates cells or indents/outdents. Outside those
 * contexts, Tab is left alone so it moves focus natively — the editor must
 * never trap keyboard focus (WCAG 2.1.2).
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
  const { contentRef, hotkeys, codeBlocks, tables, lists, sync } = deps;

  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInCodeBlock = target?.closest("[data-code-block-id]");

    if (isInCodeBlock) {
      if (handleCodeBlockLanguageCycle(event, target, codeBlocks)) return;
      // Still allow editor hotkeys (e.g., Ctrl+Shift+K to toggle off code block)
      hotkeys.handleKeyDown(event);
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

    // Handle Tab key: only intercept inside a table or list context, where
    // DXUI-73: Tab must NOT be swallowed outside a table/list — doing so trapped
    // keyboard focus inside the editor with no escape hatch (WCAG 2.1.2). When
    // neither context claims the key, let Tab fall through to native focus
    // navigation instead of inserting a literal tab character.
    if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (tables.isInTable()) {
        event.preventDefault();
        tables.handleTableTab(event.shiftKey);
        return;
      }

      if (event.shiftKey) {
        if (lists.outdentListItem()) {
          event.preventDefault();
        }
      } else {
        if (lists.indentListItem()) {
          event.preventDefault();
        }
      }
      return;
    }

    hotkeys.handleKeyDown(event);
  }

  return { onKeyDown };
}
