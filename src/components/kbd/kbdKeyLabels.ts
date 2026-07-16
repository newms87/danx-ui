import type { DanxKbdOs } from "./types";

/**
 * DanxKbd key-label resolution
 *
 * Maps well-known modifier key names to platform-specific display labels and
 * detects the current platform when no explicit `os` prop is supplied.
 */

/** Mac symbolic glyphs for modifier keys, keyed by lowercased canonical name. */
const MAC_KEY_LABELS: Record<string, string> = {
  ctrl: "^",
  control: "^",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  meta: "⌘",
  cmd: "⌘",
  command: "⌘",
};

/** Word labels for modifier keys on non-Mac platforms, keyed by lowercased canonical name. */
const OTHER_KEY_LABELS: Record<string, string> = {
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: "Alt",
  option: "Alt",
  shift: "Shift",
  meta: "Win",
  cmd: "Win",
  command: "Win",
};

/**
 * Detects whether the current runtime is macOS using `navigator.platform` (preferred)
 * and falling back to `navigator.userAgent`. Returns `"other"` when the platform is
 * not a Mac.
 */
export function detectOs(): DanxKbdOs {
  return /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent) ? "mac" : "other";
}

/**
 * Resolves the display label for a single key name given a target platform.
 * Recognized modifiers are mapped to platform-specific labels; unrecognized
 * key names are upper-cased and returned as-is (e.g. `"k"` -> `"K"`).
 */
export function resolveKeyLabel(key: string, os: DanxKbdOs): string {
  const canonical = key.trim().toLowerCase();
  const labels = os === "mac" ? MAC_KEY_LABELS : OTHER_KEY_LABELS;

  return labels[canonical] ?? key.toUpperCase();
}
