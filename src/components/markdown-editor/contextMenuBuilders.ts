/**
 * Context Menu Builders
 *
 * Pure data factory functions that return ContextMenuItem arrays for each
 * editor context (code, table, list, text). Each builder receives the
 * editor reference and produces menu items with bound actions.
 *
 * No composable closure dependency - all functions take explicit parameters.
 * Used by useContextMenu to populate the context menu based on cursor position.
 *
 * @see useContextMenu.ts for composable orchestration
 */

import { ContextMenuItem } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";

/**
 * Build the Format submenu items (bold, italic, strikethrough, inline code, link).
 * Shared across table, list, and text contexts since inline formatting is always available.
 */
export function buildFormatSubmenu(editor: UseMarkdownEditorReturn): ContextMenuItem {
  return {
    id: "format",
    label: "Format",
    children: [
      {
        id: "bold",
        label: "Bold",
        shortcut: "Ctrl+B",
        action: () => editor.inlineFormatting.toggleBold(),
      },
      {
        id: "italic",
        label: "Italic",
        shortcut: "Ctrl+I",
        action: () => editor.inlineFormatting.toggleItalic(),
      },
      {
        id: "strikethrough",
        label: "Strikethrough",
        shortcut: "Ctrl+Shift+S",
        action: () => editor.inlineFormatting.toggleStrikethrough(),
      },
      {
        id: "inline-code",
        label: "Inline Code",
        shortcut: "Ctrl+E",
        action: () => editor.inlineFormatting.toggleInlineCode(),
      },
      { id: "link", label: "Link", shortcut: "Ctrl+K", action: () => editor.links.insertLink() },
    ],
  };
}

/**
 * Build context menu items for code block context.
 * Code blocks are verbatim - only toggle code block is available.
 */
export function buildCodeItems(editor: UseMarkdownEditorReturn): ContextMenuItem[] {
  return [
    {
      id: "code-block",
      label: "Toggle Code Block",
      shortcut: "Ctrl+Shift+K",
      action: () => editor.codeBlocks.toggleCodeBlock(),
    },
  ];
}

/**
 * Build context menu items for list context.
 * Lists support inline formatting, list toggling, and blockquote.
 */
export function buildListItems(editor: UseMarkdownEditorReturn): ContextMenuItem[] {
  return [
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
          id: "blockquote",
          label: "Blockquote",
          shortcut: "Ctrl+Shift+Q",
          action: () => editor.blockquotes.toggleBlockquote(),
        },
      ],
    },
  ];
}
