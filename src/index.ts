/**
 * danx-ui - Zero-dependency Vue 3 + Tailwind CSS v4 component library
 *
 * Main entry point. Re-exports all components, composables, and types.
 */

// Components
export { DanxActionButton, DanxButton } from "./components/button";
export { DanxBadge } from "./components/badge";
export { DanxChip } from "./components/chip";
export { DanxIcon } from "./components/icon";
export { CodeViewer } from "./components/code-viewer";
export { DanxContextMenu } from "./components/context-menu";
export { DanxDialog } from "./components/dialog";
export { DanxPopover } from "./components/popover";
export { MarkdownEditor } from "./components/markdown-editor";
export { DanxTabs } from "./components/tabs";
export { DanxButtonGroup } from "./components/buttonGroup";
export { DanxTooltip } from "./components/tooltip";

// Composables
export {
  useCodeFormat,
  useCodeViewerCollapse,
  useCodeViewerEditor,
} from "./components/code-viewer";
export { calculateContextMenuPosition } from "./components/context-menu";
export { useDialog } from "./components/dialog";
export { useMarkdownEditor } from "./components/markdown-editor";

// Icons
export * from "./components/icon/icons";

// Types
export type {
  ActionTarget,
  ActionTargetItem,
  ButtonSize,
  ButtonType,
  DanxActionButtonEmits,
  DanxActionButtonProps,
  DanxButtonEmits,
  DanxButtonProps,
  DanxButtonSlots,
  ResourceAction,
} from "./components/button";
export type { DanxIconProps } from "./components/icon";
export type { BadgePlacement, BadgeType, DanxBadgeProps, DanxBadgeSlots } from "./components/badge";
export type {
  ChipSize,
  ChipType,
  DanxChipEmits,
  DanxChipProps,
  DanxChipSlots,
} from "./components/chip";
export type {
  CodeFormat,
  CodeViewerCollapsedProps,
  CodeViewerFooterProps,
  DanxCodeViewerEmits,
  DanxCodeViewerProps,
  LanguageBadgeProps,
  MarkdownContentProps,
  UseCodeFormatOptions,
  UseCodeFormatReturn,
  UseCodeViewerCollapseOptions,
  UseCodeViewerCollapseReturn,
  UseCodeViewerEditorOptions,
  UseCodeViewerEditorReturn,
  ValidationError,
} from "./components/code-viewer";
export type {
  ContextMenuItem,
  ContextMenuPosition,
  ContextMenuPositionResult,
  DanxContextMenuEmits,
  DanxContextMenuProps,
} from "./components/context-menu";
export type {
  DanxDialogEmits,
  DanxDialogProps,
  DanxDialogSlots,
  UseDialogReturn,
} from "./components/dialog";
export type {
  DanxPopoverEmits,
  DanxPopoverProps,
  DanxPopoverSlots,
  PopoverPlacement,
  PopoverPosition,
} from "./components/popover";
export type {
  TokenRenderer,
  TokenState,
  UseMarkdownEditorOptions,
  UseMarkdownEditorReturn,
} from "./components/markdown-editor";
export type { DanxTab, DanxTabsProps } from "./components/tabs";
export type {
  AutoColorMode,
  DanxButtonGroupEmits,
  DanxButtonGroupItem,
  DanxButtonGroupProps,
} from "./components/buttonGroup";
export type {
  DanxTooltipProps,
  DanxTooltipSlots,
  TooltipInteraction,
  TooltipType,
} from "./components/tooltip";

// Auto-color
export { useAutoColor, hashStringToIndex, AUTO_COLOR_PALETTE } from "./shared/autoColor";
export type { AutoColorEntry } from "./shared/autoColor";

// Shared utilities
export {
  // Number formatters
  fCurrency,
  fCurrencyNoCents,
  fNumber,
  fShortCurrency,
  fShortNumber,
  fShortSize,
  fBoolean,
  fPercent,
  // String formatters
  centerTruncate,
  fTruncate,
  fUppercase,
  fLowercase,
  fAddress,
  fPhone,
  fNameOrCount,
  // Array utilities
  getNestedValue,
  arrayCount,
  arraySum,
  arrayAvg,
  arrayMin,
  arrayMax,
  arrayFirst,
  arrayLast,
  arrayJoin,
  // DateTime parsers
  parseDateTime,
  parseSqlDateTime,
  parseSlashDate,
  parseSlashDateTime,
  parseGenericDateTime,
  // DateTime timezone
  getServerTimezone,
  setServerTimezone,
  localizedDateTime,
  remoteDateTime,
  // DateTime formatters
  fSlashDate,
  fLocalizedDateTime,
  fDateTime,
  fDateTimeMs,
  dbDateTime,
  fDate,
  fSecondsToTime,
  fSecondsToDuration,
  fMillisecondsToDuration,
  fDuration,
  fTimeAgo,
} from "./shared";

export type * from "./shared";
