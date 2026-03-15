/**
 * Context Menu Composable
 *
 * Manages context menu state (visibility, position, items) and delegates
 * menu item construction to contextMenuBuilders based on cursor context.
 *
 * @see contextMenuBuilders.ts for menu item construction
 */

import { Ref, ref } from "vue";
import { ContextMenuContext, ContextMenuItem } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";
import { buildCodeItems, buildListItems } from "./contextMenuBuilders";
import { buildTableItems } from "./contextMenuTableBuilder";
import { buildTextItems } from "./contextMenuTextBuilder";

/**
 * Save the current browser selection as a Range object.
 * Used to preserve the editor cursor when focus moves to the context menu.
 */
function saveSelectionRange(): Range | null {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  return sel.getRangeAt(0).cloneRange();
}

/**
 * Restore a previously saved Range into the browser selection.
 */
function restoreSelectionRange(range: Range): void {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Options for useContextMenu composable
 */
export interface UseContextMenuOptions {
  editor: UseMarkdownEditorReturn;
  readonly?: Ref<boolean>;
}

/**
 * Return type for useContextMenu composable
 */
export interface UseContextMenuReturn {
  isVisible: Ref<boolean>;
  position: Ref<{ x: number; y: number }>;
  items: Ref<ContextMenuItem[]>;
  show: (event: MouseEvent) => void;
  hide: () => void;
}

/**
 * Composable for managing the context menu in the markdown editor.
 * Handles context detection and delegates to builders based on cursor position.
 */
export function useContextMenu(options: UseContextMenuOptions): UseContextMenuReturn {
  const { editor, readonly } = options;

  const isVisible = ref(false);
  const position = ref({ x: 0, y: 0 });
  const items = ref<ContextMenuItem[]>([]);
  let savedRange: Range | null = null;

  /**
   * Determine the context for the context menu based on cursor position
   */
  function determineContext(): ContextMenuContext {
    if (editor.tables.isInTable()) return "table";
    if (editor.codeBlocks.isInCodeBlock()) return "code";
    if (editor.lists.getCurrentListType()) return "list";
    return "text";
  }

  /**
   * Wrap a menu item action so the editor selection is restored before it runs.
   * Without this, clicking a context menu button moves focus away from the
   * contenteditable, causing window.getSelection() to return a range outside
   * the editor — which makes every action silently bail out.
   */
  function wrapAction(action: () => void): () => void {
    return () => {
      if (savedRange) {
        restoreSelectionRange(savedRange);
      }
      action();
    };
  }

  /**
   * Recursively wrap all action callbacks in a menu item tree
   */
  function wrapItemActions(menuItems: ContextMenuItem[]): ContextMenuItem[] {
    return menuItems.map((item) => ({
      ...item,
      action: item.action ? wrapAction(item.action) : undefined,
      children: item.children ? wrapItemActions(item.children) : undefined,
    }));
  }

  /**
   * Build menu items by dispatching to the appropriate context builder
   */
  function buildItems(context: ContextMenuContext): ContextMenuItem[] {
    let menuItems: ContextMenuItem[];
    switch (context) {
      case "code":
        menuItems = buildCodeItems(editor);
        break;
      case "table":
        menuItems = buildTableItems(editor);
        break;
      case "list":
        menuItems = buildListItems(editor);
        break;
      case "text":
        menuItems = buildTextItems(editor);
        break;
    }
    return wrapItemActions(menuItems);
  }

  /**
   * Show the context menu at the event position
   */
  function show(event: MouseEvent): void {
    if (readonly?.value) return;

    event.preventDefault();

    // Save the editor selection before focus moves to the context menu
    savedRange = saveSelectionRange();

    const context = determineContext();
    const menuItems = buildItems(context);

    position.value = { x: event.clientX, y: event.clientY };
    items.value = menuItems;
    isVisible.value = true;
  }

  /**
   * Hide the context menu
   */
  function hide(): void {
    isVisible.value = false;
  }

  return {
    isVisible,
    position,
    items,
    show,
    hide,
  };
}
