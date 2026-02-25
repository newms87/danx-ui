/**
 * useDanxFileMetadata - Metadata display mode composable
 *
 * Manages the metadata panel mode (overlay vs docked) with localStorage
 * persistence via a watch. For pure formatting helpers, import directly
 * from file-metadata-helpers.ts.
 *
 * @returns { mode } - Reactive mode ref persisted to localStorage
 */

import { ref, watch, type Ref } from "vue";
import type { MetadataMode } from "./types";

const STORAGE_KEY = "danx-file-metadata-mode";

export interface UseDanxFileMetadataReturn {
  /** Current display mode (persisted to localStorage) */
  mode: Ref<MetadataMode>;
}

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

  // Auto-persist mode changes to localStorage
  watch(mode, (newMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // localStorage may not be available
    }
  });

  return { mode };
}
