/**
 * File Metadata Helpers
 *
 * Pure functions for formatting and inspecting file metadata and EXIF data.
 * Used by DanxFileViewer and DanxFileMetadata.
 */

import type { PreviewFile } from "../danx-file/types";

/** Keys filtered out from metadata display */
export const FILTERED_KEYS = new Set(["children"]);

/** Format a file's meta object for display (filters out internal keys) */
export function formatMeta(file: PreviewFile): Record<string, unknown> {
  if (!file.meta) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(file.meta)) {
    if (!FILTERED_KEYS.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

/** Count of displayable metadata entries */
export function metaCount(file: PreviewFile): number {
  return Object.keys(formatMeta(file)).length;
}

/** Return a file's exif data as-is */
export function formatExif(file: PreviewFile): Record<string, unknown> {
  if (!file.exif) return {};
  return { ...file.exif };
}

/** Count of exif entries */
export function exifCount(file: PreviewFile): number {
  return Object.keys(formatExif(file)).length;
}

/** True if either meta or exif has displayable entries */
export function hasAnyInfo(file: PreviewFile): boolean {
  return metaCount(file) > 0 || exifCount(file) > 0;
}
