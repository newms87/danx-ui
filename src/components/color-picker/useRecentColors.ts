/**
 * useRecentColors — persistent recent-colors strip.
 *
 * Backed by `localStorage` when `storageKey` is provided. Without a key, the
 * composable keeps an in-memory list for the lifetime of the component.
 * `push` prepends the latest color, dedupes case-insensitively, and trims
 * to `limit`. Read-only consumers use the `colors` ref.
 */

import { ref, watch, type Ref } from "vue";
import { getItem, setItem } from "../../shared/storage";

const STORAGE_PREFIX = "danx-color-picker:recent:";

export interface UseRecentColorsOptions {
  storageKey?: string;
  limit?: number;
}

export interface UseRecentColorsReturn {
  colors: Ref<string[]>;
  push: (color: string) => void;
  clear: () => void;
}

function storageNameFor(key: string | undefined): string | null {
  return key ? `${STORAGE_PREFIX}${key}` : null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value);
}

function readStorage(name: string | null): string[] {
  if (!name) return [];
  return getItem<string[]>(name, [], isStringArray).filter(
    (v): v is string => typeof v === "string"
  );
}

function writeStorage(name: string | null, colors: string[]): void {
  if (!name) return;
  setItem(name, colors);
}

export function useRecentColors(options: UseRecentColorsOptions = {}): UseRecentColorsReturn {
  const limit = options.limit ?? 8;
  const name = storageNameFor(options.storageKey);
  const colors = ref<string[]>(readStorage(name));

  watch(
    () => options.storageKey,
    (next) => {
      colors.value = readStorage(storageNameFor(next));
    }
  );

  function push(color: string): void {
    if (!color) return;
    const lower = color.toLowerCase();
    const next = [color, ...colors.value.filter((c) => c.toLowerCase() !== lower)].slice(0, limit);
    colors.value = next;
    writeStorage(storageNameFor(options.storageKey), next);
  }

  function clear(): void {
    colors.value = [];
    writeStorage(storageNameFor(options.storageKey), []);
  }

  return { colors, push, clear };
}
