/**
 * useDanxFileMetadata - Metadata formatting and display mode composable
 *
 * Manages the metadata panel mode (overlay vs docked) with localStorage
 * persistence, and provides helpers for formatting file metadata.
 *
 * @returns Metadata state and helpers
 */

import { ref, type Ref } from "vue";
import type { MetadataMode, PreviewFile } from "../danx-file/types";

const STORAGE_KEY = "danx-file-metadata-mode";

export interface UseDanxFileMetadataReturn {
  /** Current display mode (persisted to localStorage) */
  mode: Ref<MetadataMode>;
  /** Update the display mode */
  setMode: (newMode: MetadataMode) => void;
  /** Format a file's meta object for display (filters out internal keys) */
  formatMeta: (file: PreviewFile) => Record<string, unknown>;
  /** Count of displayable metadata entries */
  metaCount: (file: PreviewFile) => number;
  /** Return a file's exif data as-is */
  formatExif: (file: PreviewFile) => Record<string, unknown>;
  /** Count of exif entries */
  exifCount: (file: PreviewFile) => number;
  /** True if either meta or exif has displayable entries */
  hasAnyInfo: (file: PreviewFile) => boolean;
}

/** Keys filtered out from metadata display */
const FILTERED_KEYS = new Set(["children"]);

function readStoredMode(): MetadataMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "overlay" || stored === "docked") return stored;
  } catch {
    // localStorage may not be available
  }
  return "overlay";
}

export function useDanxFileMetadata(): UseDanxFileMetadataReturn {
  const mode = ref<MetadataMode>(readStoredMode());

  function setMode(newMode: MetadataMode) {
    mode.value = newMode;
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // localStorage may not be available
    }
  }

  function formatMeta(file: PreviewFile): Record<string, unknown> {
    if (!file.meta) return {};
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(file.meta)) {
      if (!FILTERED_KEYS.has(key)) {
        result[key] = value;
      }
    }
    return result;
  }

  function metaCount(file: PreviewFile): number {
    return Object.keys(formatMeta(file)).length;
  }

  function formatExif(file: PreviewFile): Record<string, unknown> {
    if (!file.exif) return {};
    return { ...file.exif };
  }

  function exifCount(file: PreviewFile): number {
    return Object.keys(formatExif(file)).length;
  }

  function hasAnyInfo(file: PreviewFile): boolean {
    return metaCount(file) > 0 || exifCount(file) > 0;
  }

  return {
    mode,
    setMode,
    formatMeta,
    metaCount,
    formatExif,
    exifCount,
    hasAnyInfo,
  };
}
