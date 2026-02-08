/**
 * MarkdownEditor Module
 *
 * Exports the MarkdownEditor component, its composables, and types.
 * The main MarkdownEditor component provides a rich contenteditable markdown editor
 * with live preview, code blocks (via CodeViewer), custom token rendering,
 * tables, lists, inline formatting, and keyboard shortcuts.
 */

export { default as MarkdownEditor } from "./MarkdownEditor.vue";

export { useMarkdownEditor } from "./useMarkdownEditor";
export type { UseMarkdownEditorOptions, UseMarkdownEditorReturn } from "./useMarkdownEditor";

export { useMarkdownSync } from "./useMarkdownSync";
export type { UseMarkdownSyncOptions, UseMarkdownSyncReturn } from "./useMarkdownSync";

export { useMarkdownSelection } from "./useMarkdownSelection";
export type { UseMarkdownSelectionReturn } from "./useMarkdownSelection";

export { useMarkdownHotkeys, parseKeyCombo, matchesKeyCombo } from "./useMarkdownHotkeys";
export type {
  HotkeyDefinition,
  HotkeyGroup,
  UseMarkdownHotkeysOptions,
  UseMarkdownHotkeysReturn,
} from "./useMarkdownHotkeys";

export { useHeadings } from "./useHeadings";
export type { UseHeadingsOptions, UseHeadingsReturn } from "./useHeadings";

export { useInlineFormatting } from "./useInlineFormatting";
export type { UseInlineFormattingOptions, UseInlineFormattingReturn } from "./useInlineFormatting";

export { useLists } from "./useLists";
export type { UseListsOptions, UseListsReturn } from "./useLists";

export { useCodeBlocks, CURSOR_ANCHOR } from "./useCodeBlocks";
export type { CodeBlockState, UseCodeBlocksOptions, UseCodeBlocksReturn } from "./useCodeBlocks";

export { useCodeBlockManager } from "./useCodeBlockManager";
export type { UseCodeBlockManagerOptions, UseCodeBlockManagerReturn } from "./useCodeBlockManager";

export { useBlockquotes } from "./useBlockquotes";
export type { UseBlockquotesOptions, UseBlockquotesReturn } from "./useBlockquotes";

export { useTables } from "./useTables";
export type { UseTablesOptions, UseTablesReturn } from "./useTables";

export { useLinks } from "./useLinks";
export type { UseLinksOptions, UseLinksReturn } from "./useLinks";

export { useTokenManager } from "./useTokenManager";
export type { UseTokenManagerOptions, UseTokenManagerReturn } from "./useTokenManager";

export { useContextMenu } from "./useContextMenu";
export type { UseContextMenuOptions, UseContextMenuReturn } from "./useContextMenu";

export { useLineTypeMenu } from "./useLineTypeMenu";
export type { UseLineTypeMenuOptions, UseLineTypeMenuReturn } from "./useLineTypeMenu";

export { useFocusTracking } from "./useFocusTracking";
export type { UseFocusTrackingOptions, UseFocusTrackingReturn } from "./useFocusTracking";

export { useLinkPopover, useTablePopover } from "./usePopoverManager";
export type { PopoverPosition, UseLinkPopoverReturn, UseTablePopoverReturn } from "./usePopoverManager";

export type {
  ContextMenuContext,
  ContextMenuGroup,
  ContextMenuItem,
  LineType,
  LineTypeOption,
  TokenRenderer,
  TokenState,
} from "./types";
