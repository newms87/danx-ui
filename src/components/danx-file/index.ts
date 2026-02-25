/**
 * DanxFile Component Module
 *
 * Exports:
 * - DanxFile: File thumbnail component
 * - File helpers: Pure functions for MIME detection, URL resolution, icons
 * - Types: TypeScript interfaces
 */

export { default as DanxFile } from "./DanxFile.vue";
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
} from "./file-helpers";
export type {
  PreviewFile,
  ImageFit,
  DanxFileSize,
  DanxFileProps,
  DanxFileEmits,
  DanxFileSlots,
  DanxFileDownloadEvent,
} from "./types";
