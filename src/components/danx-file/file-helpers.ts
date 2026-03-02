/**
 * File State, Formatting, and Ordering Helpers
 *
 * Pure functions for file state inspection, size formatting, and sort order.
 * MIME detection is in file-mime-helpers.ts, download logic in file-download-helpers.ts.
 *
 * Re-exports all functions from sub-modules for convenience.
 * Consumers import from file-helpers (or the barrel index) as the single import path.
 */

import type { PreviewFile } from "./types";

// Re-export MIME helpers
export {
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isText,
  isPreviewable,
  fileTypeIcon,
} from "./file-mime-helpers";

// Re-export download helpers
export {
  resolveFileUrl,
  resolveThumbUrl,
  createDownloadEvent,
  triggerFileDownload,
  handleDownload,
} from "./file-download-helpers";

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
