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
export { DanxDialog, DialogBreadcrumbs } from "./components/dialog";
export { DanxPopover } from "./components/popover";
export { MarkdownEditor } from "./components/markdown-editor";
export { DanxSplitPanel, SplitPanelHandle } from "./components/split-panel";
export { DanxTabs } from "./components/tabs";
export { DanxButtonGroup } from "./components/buttonGroup";
export { DanxTooltip } from "./components/tooltip";
export { DanxProgressBar } from "./components/progress-bar";
export { DanxFile } from "./components/danx-file";
export { DanxFileNavigator } from "./components/danx-file-navigator";

// Composables
export {
  useCodeFormat,
  useCodeViewerCollapse,
  useCodeViewerEditor,
} from "./components/code-viewer";
export { calculateContextMenuPosition } from "./components/context-menu";
export { useDialog, useDialogStack } from "./components/dialog";
export { useSplitPanel } from "./components/split-panel";
export { useMarkdownEditor } from "./components/markdown-editor";
export {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isPreviewable,
  isInProgress,
  hasChildren,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
} from "./components/danx-file";
export {
  useDanxFileNavigator,
  useDanxFileMetadata,
  useVirtualCarousel,
} from "./components/danx-file-navigator";
export { downloadFile } from "./shared/download";

// Icons
export * from "./components/icon/icons";

// Types
export type {
  ActionTarget,
  ActionTargetItem,
  ButtonSize,
  DanxActionButtonEmits,
  DanxActionButtonProps,
  DanxButtonEmits,
  DanxButtonProps,
  DanxButtonSlots,
  ResourceAction,
} from "./components/button";
export type { DanxIconProps } from "./components/icon";
export type { BadgePlacement, DanxBadgeProps, DanxBadgeSlots } from "./components/badge";
export type { ChipSize, DanxChipEmits, DanxChipProps, DanxChipSlots } from "./components/chip";
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
  DialogStackEntry,
  UseDialogReturn,
  UseDialogStackReturn,
} from "./components/dialog";
export type {
  DanxPopoverEmits,
  DanxPopoverProps,
  DanxPopoverSlots,
  PopoverPlacement,
  PopoverPosition,
  PopoverTrigger,
} from "./components/popover";
export type {
  TokenRenderer,
  TokenState,
  UseMarkdownEditorOptions,
  UseMarkdownEditorReturn,
} from "./components/markdown-editor";
export type {
  SplitPanelConfig,
  SplitPanelState,
  DanxSplitPanelProps,
  DanxSplitPanelEmits,
  DanxSplitPanelSlots,
  SplitPanelStorageState,
  UseSplitPanelOptions,
  UseSplitPanelReturn,
} from "./components/split-panel";
export type { DanxTab, DanxTabsProps } from "./components/tabs";
export type {
  AutoColorMode,
  DanxButtonGroupEmits,
  DanxButtonGroupItem,
  DanxButtonGroupProps,
} from "./components/buttonGroup";
export type { DanxTooltipProps, DanxTooltipSlots, TooltipInteraction } from "./components/tooltip";
export type {
  DanxProgressBarProps,
  DanxProgressBarSlots,
  ProgressBarSize,
  ProgressBarTextAlign,
  ProgressBarTextPosition,
} from "./components/progress-bar";
export type {
  PreviewFile,
  ImageFit,
  MetadataMode,
  DanxFileProps,
  DanxFileEmits,
  DanxFileSlots,
  DanxFileDownloadEvent,
} from "./components/danx-file";
export type {
  UseDanxFileNavigatorOptions,
  UseDanxFileNavigatorReturn,
  UseDanxFileMetadataReturn,
  VirtualSlide,
  DanxFileNavigatorProps,
  DanxFileNavigatorEmits,
  DanxFileNavigatorSlots,
} from "./components/danx-file-navigator";

// Auto-color
export { useAutoColor, hashStringToIndex, AUTO_COLOR_PALETTE } from "./shared/autoColor";
export type { AutoColorEntry } from "./shared/autoColor";

// Variant system
export { useVariant } from "./shared/composables/useVariant";
export type { VariantTokenMap } from "./shared/composables/useVariant";
export type { VariantType } from "./shared/types";

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
