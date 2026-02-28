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
  return file.mime.startsWith("image/");
}

/** Check if file has a video MIME type */
export function isVideo(file: PreviewFile): boolean {
  return file.mime.startsWith("video/");
}

/** Check if file is a PDF */
export function isPdf(file: PreviewFile): boolean {
  return file.mime === "application/pdf";
}

/** Check if file has an audio MIME type */
export function isAudio(file: PreviewFile): boolean {
  return file.mime.startsWith("audio/");
}

/** Check if file has a text MIME type (text/plain, text/markdown, etc.) */
export function isText(file: PreviewFile): boolean {
  return file.mime.startsWith("text/");
}

/** Check if file can be directly previewed (image, video, audio, PDF, or text) */
export function isPreviewable(file: PreviewFile): boolean {
  return isImage(file) || isVideo(file) || isAudio(file) || isPdf(file) || isText(file);
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
 * Sort files by page_number when present, preserving original order for files without one.
 * Files with page_number come first (sorted ascending), then files without.
 */
export function sortByPageNumber(files: PreviewFile[]): PreviewFile[] {
  const withPage = files.filter((f) => f.page_number != null);
  const withoutPage = files.filter((f) => f.page_number == null);
  withPage.sort((a, b) => a.page_number! - b.page_number!);
  return [...withPage, ...withoutPage];
}

/** Resolve the display number for a file at a given index. Uses page_number if present, otherwise index + 1. */
export function fileDisplayNumber(file: PreviewFile, index: number): number {
  return file.page_number ?? index + 1;
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
  const { mime } = file;

  if (mime.startsWith("video/")) return "play";
  if (mime.startsWith("audio/")) return "music";
  if (mime === "application/pdf") return "file-pdf";

  if (
    mime === "application/zip" ||
    mime === "application/x-rar-compressed" ||
    mime === "application/gzip" ||
    mime === "application/x-tar" ||
    mime === "application/x-7z-compressed"
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
 * Create a preventable download event, emit it via the given callback,
 * and trigger a browser download if the event was not prevented.
 */
export function handleDownload(
  file: PreviewFile,
  emitFn: (event: DanxFileDownloadEvent) => void
): void {
  const event = createDownloadEvent(file);
  emitFn(event);
  if (!event.prevented) {
    triggerFileDownload(file);
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
