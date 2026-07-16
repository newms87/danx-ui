/**
 * useViewerPreferences - Layered preference resolver for DanxFileViewer
 *
 * Reads each preference from `localStorage[`${namespace}-${key}`]` and falls
 * back to the supplied default when missing or invalid. Writes back on change.
 * Swallows storage errors (SSR, disabled storage, private mode) and falls
 * back to in-memory state — the preference still works for the session.
 *
 * Each preference is independently reactive: changing the layout doesn't
 * touch the zoom store and vice versa.
 *
 * Storage shape per key: raw JSON string (no nesting). The caller picks the
 * key naming (`layout`, `zoom`, etc.) so different consumers can colocate
 * unrelated preferences under the same namespace.
 */

import { customRef, type Ref } from "vue";
import { getItem, setItem } from "../../shared/storage";

export interface PreferenceOptions<T> {
  /** Optional validator. Reject invalid stored values and use default. */
  validate?: (value: unknown) => value is T;
}

/**
 * Create a single persisted preference ref.
 *
 * @param namespace - Logical group (e.g. `"danx-file-viewer"`)
 * @param key       - Preference name within the namespace
 * @param defaultValue - Used when localStorage has no value or value is invalid
 * @param options   - Optional validator
 */
export function usePreference<T>(
  namespace: string,
  key: string,
  defaultValue: T,
  options: PreferenceOptions<T> = {}
): Ref<T> {
  const storageKey = `${namespace}-${key}`;
  let value: T = getItem<T>(storageKey, defaultValue, options.validate);

  return customRef<T>((track, trigger) => ({
    get() {
      track();
      return value;
    },
    set(next: T) {
      value = next;
      setItem(storageKey, next);
      trigger();
    },
  }));
}
