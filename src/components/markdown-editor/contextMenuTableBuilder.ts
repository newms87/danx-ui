/**
 * Context Menu Table Builder
 *
 * Builds context menu items for table context. Tables support inline
 * formatting, row/column insert/delete, and column alignment.
 *
 * @see contextMenuBuilders.ts for other context builders
 */

import { ContextMenuItem } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";
import { buildFormatSubmenu } from "./contextMenuBuilders";

/**
 * Build context menu items for table context.
 * Tables support inline formatting, row/column operations, and alignment.
 */
export function buildTableItems(editor: UseMarkdownEditorReturn): ContextMenuItem[] {
  return [
    buildFormatSubmenu(editor),
    { id: "table-format-divider", label: "", divider: true },
    {
      id: "insert-row-above",
      label: "Insert Row Above",
      shortcut: "Ctrl+Alt+Shift+Up",
      action: () => editor.tables.insertRowAbove(),
    },
    {
      id: "insert-row-below",
      label: "Insert Row Below",
      shortcut: "Ctrl+Alt+Shift+Down",
      action: () => editor.tables.insertRowBelow(),
    },
    {
      id: "insert-col-left",
      label: "Insert Column Left",
      shortcut: "Ctrl+Alt+Shift+Left",
      action: () => editor.tables.insertColumnLeft(),
    },
    {
      id: "insert-col-right",
      label: "Insert Column Right",
      shortcut: "Ctrl+Alt+Shift+Right",
      action: () => editor.tables.insertColumnRight(),
    },
    { id: "table-divider-1", label: "", divider: true },
    {
      id: "delete-row",
      label: "Delete Row",
      shortcut: "Ctrl+Alt+Backspace",
      action: () => editor.tables.deleteCurrentRow(),
    },
    {
      id: "delete-col",
      label: "Delete Column",
      shortcut: "Ctrl+Shift+Backspace",
      action: () => editor.tables.deleteCurrentColumn(),
    },
    {
      id: "delete-table",
      label: "Delete Table",
      action: () => editor.tables.deleteTable(),
    },
    { id: "table-divider-2", label: "", divider: true },
    {
      id: "alignment",
      label: "Alignment",
      children: [
        {
          id: "align-left",
          label: "Align Left",
          shortcut: "Ctrl+Alt+L",
          action: () => editor.tables.setColumnAlignmentLeft(),
        },
        {
          id: "align-center",
          label: "Align Center",
          shortcut: "Ctrl+Alt+C",
          action: () => editor.tables.setColumnAlignmentCenter(),
        },
        {
          id: "align-right",
          label: "Align Right",
          shortcut: "Ctrl+Alt+R",
          action: () => editor.tables.setColumnAlignmentRight(),
        },
      ],
    },
  ];
}
