/**
 * File Helper Functions
 *
 * Pure functions for MIME detection, URL resolution, icon mapping,
 * and file state inspection. Used by both DanxFile and DanxFileViewer.
 */

import { downloadFile } from "../../shared/download";
import type { DanxFileDownloadEvent, PreviewFile } from "./types";

/**
 * Resolve the best available URL for downloading or linking to a file.
 * Priority: optimized > url > blobUrl > empty string.
 *
 * Note: For display rendering (img src), use the mode-aware logic in
 * DanxFile.vue which gates non-image originals behind isImage() checks.
 */
export function resolveFileUrl(file: PreviewFile): string {
  return file.optimized?.url || file.url || file.blobUrl || "";
}

/**
 * Resolve the best available thumbnail URL for downloading or linking.
 * Priority: thumb > optimized > url > blobUrl > empty string.
 *
 * Note: For display rendering, DanxFile.vue uses mode-aware computeds
 * that prevent non-renderable URLs (e.g. video originals) from being
 * used as image sources.
 */
export function resolveThumbUrl(file: PreviewFile): string {
  return file.thumb?.url || resolveFileUrl(file);
}

/** Check if file has an image MIME type */
export function isImage(file: PreviewFile): boolean {
  return file.type.startsWith("image/");
}

/** Check if file has a video MIME type */
export function isVideo(file: PreviewFile): boolean {
  return file.type.startsWith("video/");
}

/** Check if file is a PDF */
export function isPdf(file: PreviewFile): boolean {
  return file.type === "application/pdf";
}

/** Check if file has an audio MIME type */
export function isAudio(file: PreviewFile): boolean {
  return file.type.startsWith("audio/");
}

/** Check if file can be directly previewed (image, video, audio, or PDF) */
export function isPreviewable(file: PreviewFile): boolean {
  return isImage(file) || isVideo(file) || isAudio(file) || isPdf(file);
}

/** Check if file is currently uploading/processing (progress non-null and < 100) */
export function isInProgress(file: PreviewFile): boolean {
  return file.progress != null && file.progress < 100;
}

/** Check if file has child variants */
export function hasChildren(file: PreviewFile): boolean {
  return Array.isArray(file.children) && file.children.length > 0;
}

/**
 * Map a file's MIME type to an icon registry name.
 *
 * Returns a string matching a key in the DanxIcon iconRegistry:
 * - image/* (when no thumb) → "document" (image-like file)
 * - video/* → "play"
 * - application/pdf → "document"
 * - compressed types → "folder"
 * - text/* → "document"
 * - default → "document"
 */
export function fileTypeIcon(file: PreviewFile): string {
  const { type } = file;

  if (type.startsWith("video/")) return "play";
  if (type.startsWith("audio/")) return "music";
  if (type === "application/pdf") return "file-pdf";

  if (
    type === "application/zip" ||
    type === "application/x-rar-compressed" ||
    type === "application/gzip" ||
    type === "application/x-tar" ||
    type === "application/x-7z-compressed"
  ) {
    return "folder";
  }

  return "document";
}

/**
 * Create a preventable download event object.
 */
export function createDownloadEvent(file: PreviewFile): DanxFileDownloadEvent {
  let prevented = false;
  return {
    file,
    get prevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

/**
 * Trigger a browser download for a file. Resolves the best URL and downloads.
 */
export function triggerFileDownload(file: PreviewFile): void {
  const url = resolveFileUrl(file);
  if (url) {
    downloadFile(url, file.name);
  }
}

/**
 * Format a file size in bytes to a human-readable string.
 * Uses binary units (1024-based) with IEC labels (KiB, MiB, GiB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MiB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GiB";
}
