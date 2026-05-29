/**
 * danx-ui - Zero-dependency Vue 3 + Tailwind CSS v4 component library
 *
 * Main entry point. Re-exports all components, composables, and types.
 */

// Components
export { DanxActionButton, DanxButton } from "./components/button";
export { DanxAlert } from "./components/alert";
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
export { DanxToast, DanxToastContainer } from "./components/toast";
export { DanxTooltip } from "./components/tooltip";
export { DanxProgressBar } from "./components/progress-bar";
export { DanxFile } from "./components/danx-file";
export { DanxFileViewer } from "./components/danx-file-viewer";
export { DanxScroll, DanxVirtualScroll } from "./components/scroll";
export { DanxSkeleton } from "./components/skeleton";
export { DanxFieldWrapper } from "./components/field-wrapper";
export { DanxInput } from "./components/input";
export {
  DanxColorPicker,
  useRecentColors,
  DEFAULT_SWATCHES,
  parseColor,
  formatColor,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  isHex,
} from "./components/color-picker";
export { DanxTextarea } from "./components/textarea";
export { DanxSelect } from "./components/select";
export { DanxFileUpload } from "./components/danx-file-upload";
export { DanxToggle } from "./components/toggle";
export { DanxRangeSlider, useRangeSlider } from "./components/range-slider";
export { DanxEditableDiv } from "./components/editable-div";
export { DanxZoomable, DanxZoomControls, useZoomable } from "./components/zoomable";
export { DanxFileExplorer, FileExplorerNode } from "./components/file-explorer";

// Composables
export {
  useCodeFormat,
  useCodeViewerCollapse,
  useCodeViewerEditor,
} from "./components/code-viewer";
export { useDialog, useDialogStack } from "./components/dialog";
export { useToast, useToastTimer } from "./components/toast";
export { useSplitPanel } from "./components/split-panel";
export { useMarkdownEditor } from "./components/markdown-editor";
export {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isText,
  isPreviewable,
  isInProgress,
  hasChildren,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
  handleDownload,
  useDanxFile,
} from "./components/danx-file";
export { useDanxFileViewer, useVirtualCarousel } from "./components/danx-file-viewer";
export { useFileExplorer, isFolderNode } from "./components/file-explorer";
export { useTouchSwipe } from "./shared/composables/useTouchSwipe";
export { useDanxScroll, useScrollInfinite, useScrollWindow } from "./components/scroll";
export { downloadFile } from "./shared/download";
export {
  useFileUpload,
  setFileUploadHandler,
  getFileUploadHandler,
  setFileChildrenHandler,
  getFileChildrenHandler,
  uploadFileToUrl,
  isAcceptedType,
} from "./components/danx-file-upload";

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
export type { DanxAlertProps, DanxAlertEmits, DanxAlertSlots } from "./components/alert";
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
  DanxContextMenuEmits,
  DanxContextMenuProps,
} from "./components/context-menu";
export type {
  FileNode,
  DanxFileExplorerProps,
  DanxFileExplorerEmits,
  DanxFileExplorerSlots,
  FileExplorerContext,
  FileExplorerNodeSlotProps,
  FileExplorerStorageState,
  UseFileExplorerOptions,
  UseFileExplorerReturn,
} from "./components/file-explorer";
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
export type {
  DanxToastProps,
  DanxToastSlots,
  ToastEntry,
  ToastOptions,
  ToastPosition,
} from "./components/toast";
export type { UseToastReturn } from "./components/toast";
export type { UseToastTimerReturn } from "./components/toast";
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
  DanxFileSize,
  DanxFileMode,
  DanxFileProps,
  DanxFileEmits,
  DanxFileSlots,
  DanxFileDownloadEvent,
  UseDanxFileReturn,
} from "./components/danx-file";
export type {
  DanxScrollEmits,
  DanxScrollProps,
  DanxScrollSlots,
  InfiniteScrollEdge,
  ScrollbarSize,
  ScrollDirection,
  UseDanxScrollOptions,
  UseDanxScrollReturn,
  UseScrollInfiniteOptions,
  DanxVirtualScrollProps,
  DanxVirtualScrollSlots,
  ScrollWindowOptions,
  ScrollWindowReturn,
} from "./components/scroll";
export type {
  DanxZoomableProps,
  DanxZoomableEmits,
  DanxZoomableSlots,
  DanxZoomControlsProps,
  DanxZoomControlsEmits,
  Pan as DanxZoomablePan,
  UseZoomableOptions,
  UseZoomableReturn,
} from "./components/zoomable";
export type {
  UseDanxFileViewerOptions,
  UseDanxFileViewerReturn,
  VirtualSlide,
  DanxFileViewerProps,
  DanxFileViewerEmits,
  DanxFileViewerSlots,
  LayoutToggle as DanxFileViewerLayoutToggle,
} from "./components/danx-file-viewer";
export type { UseTouchSwipeOptions, UseTouchSwipeReturn } from "./shared/composables/useTouchSwipe";
export type { DanxSkeletonProps, SkeletonAnimation, SkeletonShape } from "./components/skeleton";
export type { InputType, DanxInputProps, DanxInputEmits, DanxInputSlots } from "./components/input";
export type {
  DanxColorPickerProps,
  DanxColorPickerEmits,
  DanxColorPickerSlots,
  DanxColorPickerOutputFormat,
  ColorFormat,
  RGB,
  HSV,
  HSL,
  UseRecentColorsOptions,
  UseRecentColorsReturn,
} from "./components/color-picker";
export type { TextareaResize, DanxTextareaProps, DanxTextareaEmits } from "./components/textarea";
export type {
  DanxSelectEmits,
  DanxSelectProps,
  DanxSelectSlots,
  SelectModelValue,
  SelectOption,
  SelectOptionSlotScope,
  SelectSelectedSlotScope,
} from "./components/select";
export type { UseSelectOptions, UseSelectReturn } from "./components/select";
export type {
  FileUploadHandler,
  FileChildrenHandler,
  UploadFileToUrlOptions,
  DanxFileUploadProps,
  DanxFileUploadEmits,
  DanxFileUploadSlots,
  UseFileUploadOptions,
} from "./components/danx-file-upload";
export type { UseFileUploadReturn } from "./components/danx-file-upload";
export type { DanxToggleProps, DanxToggleSlots, ToggleSize } from "./components/toggle";
export type {
  DanxRangeSliderProps,
  DanxRangeSliderSlots,
  RangeSliderHandle,
  RangeSliderModel,
  RangeSliderValueSlotScope,
  UseRangeSliderOptions,
  UseRangeSliderReturn,
} from "./components/range-slider";
export type {
  DanxEditableDivEmits,
  DanxEditableDivExpose,
  DanxEditableDivProps,
  EditableDivCommit,
  EditableDivLayout,
  EditableDivMode,
  EditableDivSize,
  EditableDivTag,
  EditableDivValidator,
} from "./components/editable-div";

// Auto-color
export { useAutoColor, hashStringToIndex, AUTO_COLOR_PALETTE } from "./shared/autoColor";
export type { AutoColorEntry } from "./shared/autoColor";

// Form field infrastructure
export { useSelect } from "./components/select";
export { useFormField } from "./shared/composables/useFormField";
export { useFieldInteraction } from "./shared/composables/useFieldInteraction";
export type { UseFormFieldReturn } from "./shared/composables/useFormField";
export type {
  FieldInteractionOptions,
  FieldInteractionProps,
  UseFieldInteractionReturn,
} from "./shared/composables/useFieldInteraction";
export type {
  InputSize,
  FormFieldState,
  FormFieldBaseProps,
  FormFieldEmits,
} from "./shared/form-types";
export type { DanxFieldWrapperProps, DanxFieldWrapperSlots } from "./components/field-wrapper";

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
  // Data format detection
  isJSON,
  isStructuredData,
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

// Structured data format preference
export {
  getPreferredStructuredDataFormat,
  setPreferredStructuredDataFormat,
  isStructuredDataFormat,
} from "./shared/useStructuredDataPreference";
export type { StructuredDataFormat } from "./shared/useStructuredDataPreference";

// Reactive data layer — configuration singleton
export { setDanxOptions, getDanxOptions } from "./shared/config";
export type {
  DanxOptions,
  DanxRequestOptions,
  DanxFlashMessageOptions,
} from "./shared/config-types";

// Reactive data layer — utilities
export { sleep } from "./shared/sleep";
export { FlashMessages } from "./shared/flashMessages";
export type { FlashSeverity, FlashMessageInput } from "./shared/flashMessages";

// Reactive data layer — request helper
export { request } from "./shared/request";
export type { ActiveRequest, RequestApi, RequestCallOptions } from "./shared/request-types";

// Reactive data layer — object store
export {
  storeObject,
  storeObjects,
  registerList,
  unregisterList,
  hasRecentUpdates,
  removeObjectFromLists,
  autoRefreshObject,
  stopAutoRefreshObject,
} from "./shared/objectStore";
export type { TypedObject, AnyObject, LabelValueItem } from "./shared/store-types";

// Reactive data layer — actions
export { useActions, withDefaultActions, activeActionVnode } from "./shared/actions";
export { useActionStore } from "./shared/actionStore";
export { useActionRoutes } from "./shared/actionRoutes";
export type {
  ActionOptions,
  ActionGlobalOptions,
  ActionController,
  ActionStore,
  ActiveActionVnode,
  ListController,
  ListControlsRoutes,
  ListControlsOptions,
  ListControlsFilter,
  ListControlsPagination,
  ListSortItem,
  ControlsFieldsList,
  FilterGroup,
  FilterableField,
  PagedItems,
  ApplyActionResponse,
} from "./shared/action-types";

export type * from "./shared";
