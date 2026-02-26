/**
 * DanxFileViewer Component Module
 *
 * Exports:
 * - DanxFileViewer: Standalone file viewer component
 * - Composables: Navigation and virtual carousel
 * - Types: TypeScript interfaces
 *
 * Internal subcomponents (DanxFileThumbnailStrip, DanxFileMetadata)
 * are not exported — they are used only by DanxFileViewer internally.
 */

export { default as DanxFileViewer } from "./DanxFileViewer.vue";
export { useDanxFileViewer } from "./useDanxFileViewer";
export type { UseDanxFileViewerOptions, UseDanxFileViewerReturn } from "./useDanxFileViewer";
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
  DanxFileViewerProps,
  DanxFileViewerEmits,
  DanxFileViewerSlots,
} from "./types";
