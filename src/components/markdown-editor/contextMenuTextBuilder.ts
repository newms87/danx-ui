/**
 * Context Menu Text Builder
 *
 * Builds context menu items for text/paragraph context - the full menu
 * with headings, inline formatting, lists, and all block types.
 *
 * @see contextMenuBuilders.ts for other context builders
 */

import { ContextMenuItem } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";
import { buildFormatSubmenu } from "./contextMenuBuilders";

/**
 * Build context menu items for text/paragraph context.
 * Full menu with headings, formatting, lists, and all block types.
 */
export function buildTextItems(editor: UseMarkdownEditorReturn): ContextMenuItem[] {
  return [
    {
      id: "headings",
      label: "Headings",
      children: [
        {
          id: "paragraph",
          label: "Paragraph",
          shortcut: "Ctrl+0",
          action: () => editor.headings.setHeadingLevel(0),
        },
        {
          id: "h1",
          label: "Heading 1",
          shortcut: "Ctrl+1",
          action: () => editor.headings.setHeadingLevel(1),
        },
        {
          id: "h2",
          label: "Heading 2",
          shortcut: "Ctrl+2",
          action: () => editor.headings.setHeadingLevel(2),
        },
        {
          id: "h3",
          label: "Heading 3",
          shortcut: "Ctrl+3",
          action: () => editor.headings.setHeadingLevel(3),
        },
        {
          id: "h4",
          label: "Heading 4",
          shortcut: "Ctrl+4",
          action: () => editor.headings.setHeadingLevel(4),
        },
        {
          id: "h5",
          label: "Heading 5",
          shortcut: "Ctrl+5",
          action: () => editor.headings.setHeadingLevel(5),
        },
        {
          id: "h6",
          label: "Heading 6",
          shortcut: "Ctrl+6",
          action: () => editor.headings.setHeadingLevel(6),
        },
      ],
    },
    buildFormatSubmenu(editor),
    {
      id: "lists",
      label: "Lists",
      children: [
        {
          id: "bullet-list",
          label: "Bullet List",
          shortcut: "Ctrl+Shift+[",
          action: () => editor.lists.toggleUnorderedList(),
        },
        {
          id: "numbered-list",
          label: "Numbered List",
          shortcut: "Ctrl+Shift+]",
          action: () => editor.lists.toggleOrderedList(),
        },
      ],
    },
    {
      id: "blocks",
      label: "Blocks",
      children: [
        {
          id: "code-block",
          label: "Code Block",
          shortcut: "Ctrl+Shift+K",
          action: () => editor.codeBlocks.toggleCodeBlock(),
        },
        {
          id: "blockquote",
          label: "Blockquote",
          shortcut: "Ctrl+Shift+Q",
          action: () => editor.blockquotes.toggleBlockquote(),
        },
        {
          id: "insert-table",
          label: "Insert Table",
          shortcut: "Ctrl+Alt+Shift+T",
          action: () => editor.tables.insertTable(),
        },
      ],
    },
  ];
}
