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
   * Build menu items by dispatching to the appropriate context builder
   */
  function buildItems(context: ContextMenuContext): ContextMenuItem[] {
    switch (context) {
      case "code":
        return buildCodeItems(editor);
      case "table":
        return buildTableItems(editor);
      case "list":
        return buildListItems(editor);
      case "text":
        return buildTextItems(editor);
    }
  }

  /**
   * Show the context menu at the event position
   */
  function show(event: MouseEvent): void {
    if (readonly?.value) return;

    event.preventDefault();

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
