/**
 * Safe localStorage access
 *
 * Wraps `localStorage` reads/writes in try/catch and JSON serializes/
 * deserializes values, no-oping silently on failure (private mode, quota
 * exceeded, SSR, storage disabled). Codifies the `safeRead`/`safeWrite`
 * pattern duplicated across several composables (DXUI-187).
 */

export function getItem<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — value lives in memory only for this session.
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage unavailable — nothing to remove.
  }
}
