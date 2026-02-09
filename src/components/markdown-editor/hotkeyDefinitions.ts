/**
 * Hotkey Definitions
 *
 * Data-driven configuration of all default hotkeys for the markdown editor.
 * Each entry maps a key combination to an action, description, and group.
 */

import { HotkeyGroup } from "./useMarkdownHotkeys";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";
import {
  setHeadingWithListHandling,
  increaseHeadingWithListHandling,
  decreaseHeadingWithListHandling,
  toggleCodeBlockWithListHandling,
} from "./hotkeyHelpers";

/** Hotkey registration config entry */
export interface HotkeyConfig {
  key: string;
  description: string;
  group: HotkeyGroup;
  /** Action to execute. If null, the hotkey is display-only (handled elsewhere). */
  action: ((editor: UseMarkdownEditorReturn) => void) | null;
}

/** All default hotkey configurations organized by group. */
export const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  // === Inline Formatting ===
  {
    key: "ctrl+b",
    description: "Bold",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleBold(),
  },
  {
    key: "ctrl+i",
    description: "Italic",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleItalic(),
  },
  {
    key: "ctrl+e",
    description: "Inline code",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleInlineCode(),
  },
  {
    key: "ctrl+shift+s",
    description: "Strikethrough",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleStrikethrough(),
  },
  {
    key: "ctrl+shift+h",
    description: "Highlight",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleHighlight(),
  },
  {
    key: "ctrl+u",
    description: "Underline",
    group: "formatting",
    action: (e) => e.inlineFormatting.toggleUnderline(),
  },
  {
    key: "ctrl+k",
    description: "Insert/edit link",
    group: "formatting",
    action: (e) => e.links.insertLink(),
  },

  // === Headings ===
  {
    key: "ctrl+0",
    description: "Convert to paragraph",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 0),
  },
  {
    key: "ctrl+1",
    description: "Convert to Heading 1",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 1),
  },
  {
    key: "ctrl+2",
    description: "Convert to Heading 2",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 2),
  },
  {
    key: "ctrl+3",
    description: "Convert to Heading 3",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 3),
  },
  {
    key: "ctrl+4",
    description: "Convert to Heading 4",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 4),
  },
  {
    key: "ctrl+5",
    description: "Convert to Heading 5",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 5),
  },
  {
    key: "ctrl+6",
    description: "Convert to Heading 6",
    group: "headings",
    action: (e) => setHeadingWithListHandling(e, 6),
  },
  {
    key: "ctrl+<",
    description: "Decrease heading level",
    group: "headings",
    action: (e) => decreaseHeadingWithListHandling(e),
  },
  {
    key: "ctrl+>",
    description: "Increase heading level",
    group: "headings",
    action: (e) => increaseHeadingWithListHandling(e),
  },

  // === Lists ===
  {
    key: "ctrl+shift+[",
    description: "Toggle bullet list",
    group: "lists",
    action: (e) => e.lists.toggleUnorderedList(),
  },
  {
    key: "ctrl+shift+]",
    description: "Toggle numbered list",
    group: "lists",
    action: (e) => e.lists.toggleOrderedList(),
  },
  { key: "tab", description: "Indent list item", group: "lists", action: null },
  { key: "shift+tab", description: "Outdent list item", group: "lists", action: null },

  // === Blocks ===
  {
    key: "ctrl+shift+k",
    description: "Toggle code block",
    group: "blocks",
    action: (e) => toggleCodeBlockWithListHandling(e),
  },
  { key: "ctrl+enter", description: "Exit code block", group: "blocks", action: null },
  {
    key: "ctrl+alt+l",
    description: "Cycle language (in code block)",
    group: "blocks",
    action: null,
  },
  {
    key: "ctrl+alt+shift+l",
    description: "Search language (in code block)",
    group: "blocks",
    action: null,
  },
  {
    key: "ctrl+shift+q",
    description: "Toggle blockquote",
    group: "blocks",
    action: (e) => e.blockquotes.toggleBlockquote(),
  },
  {
    key: "ctrl+shift+enter",
    description: "Insert horizontal rule",
    group: "blocks",
    action: (e) => e.insertHorizontalRule(),
  },

  // === Tables ===
  {
    key: "ctrl+alt+shift+t",
    description: "Insert table",
    group: "tables",
    action: (e) => e.tables.insertTable(),
  },
  {
    key: "ctrl+alt+shift+up",
    description: "Insert row above",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.insertRowAbove();
    },
  },
  {
    key: "ctrl+alt+shift+down",
    description: "Insert row below",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.insertRowBelow();
    },
  },
  {
    key: "ctrl+alt+shift+left",
    description: "Insert column left",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.insertColumnLeft();
    },
  },
  {
    key: "ctrl+alt+shift+right",
    description: "Insert column right",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.insertColumnRight();
    },
  },
  {
    key: "ctrl+alt+backspace",
    description: "Delete row",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.deleteCurrentRow();
    },
  },
  {
    key: "ctrl+shift+backspace",
    description: "Delete column",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.deleteCurrentColumn();
    },
  },
  {
    key: "ctrl+alt+shift+backspace",
    description: "Delete table",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.deleteTable();
    },
  },
  {
    key: "ctrl+alt+l",
    description: "Align column left",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.setColumnAlignmentLeft();
    },
  },
  {
    key: "ctrl+alt+c",
    description: "Align column center",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.setColumnAlignmentCenter();
    },
  },
  {
    key: "ctrl+alt+r",
    description: "Align column right",
    group: "tables",
    action: (e) => {
      if (e.tables.isInTable()) e.tables.setColumnAlignmentRight();
    },
  },

  // === Other ===
  {
    key: "ctrl+?",
    description: "Show keyboard shortcuts",
    group: "other",
    action: (e) => e.showHotkeyHelp(),
  },
];
