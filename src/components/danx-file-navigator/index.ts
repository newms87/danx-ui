/**
 * DanxFileNavigator Component Module
 *
 * Exports:
 * - DanxFileNavigator: Standalone file viewer component
 * - Composables: Navigation and metadata state management
 * - Types: TypeScript interfaces
 *
 * Internal subcomponents (DanxFileThumbnailStrip, DanxFileMetadata,
 * DanxFileChildrenMenu) are not exported — they are used only by
 * DanxFileNavigator internally.
 */

export { default as DanxFileNavigator } from "./DanxFileNavigator.vue";
export { useDanxFileNavigator } from "./useDanxFileNavigator";
export type {
  UseDanxFileNavigatorOptions,
  UseDanxFileNavigatorReturn,
} from "./useDanxFileNavigator";
export { useDanxFileMetadata } from "./useDanxFileMetadata";
export type { UseDanxFileMetadataReturn } from "./useDanxFileMetadata";
export {
  formatMeta,
  metaCount,
  formatExif,
  exifCount,
  hasAnyInfo,
  FILTERED_KEYS,
} from "./file-metadata-helpers";
export { useVirtualCarousel } from "./useVirtualCarousel";
export type {
  VirtualSlide,
  DanxFileNavigatorProps,
  DanxFileNavigatorEmits,
  DanxFileNavigatorSlots,
} from "./types";
