/**
 * DanxFile Component Module
 *
 * Exports:
 * - DanxFile: File thumbnail component
 * - File helpers: Pure functions for MIME detection, URL resolution, icons
 * - Types: TypeScript interfaces
 */

export { default as DanxFile } from "./DanxFile.vue";
export { useDanxFile } from "./useDanxFile";
export type { UseDanxFileReturn } from "./useDanxFile";
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
  sortByPageNumber,
  fileDisplayNumber,
  createDownloadEvent,
  triggerFileDownload,
  handleDownload,
} from "./file-helpers";
export type {
  PreviewFile,
  ImageFit,
  DanxFileSize,
  DanxFileMode,
  DanxFileProps,
  DanxFileEmits,
  DanxFileSlots,
  DanxFileDownloadEvent,
} from "./types";
