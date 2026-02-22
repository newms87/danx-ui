/**
 * Auto-Color Utility
 *
 * Deterministically assigns colors to strings by hashing label text to a
 * palette index. The same string always maps to the same color, giving
 * visually distinct colors to different tags/statuses without manual mapping.
 *
 * The palette references primitive CSS tokens from 14 chromatic Tailwind families
 * (sky, blue, indigo, purple, violet, fuchsia, rose, orange, amber,
 * lime, green, emerald, teal, cyan) via var() so colors adapt to theme overrides.
 */

import { computed, type CSSProperties, type MaybeRefOrGetter, toValue } from "vue";

/**
 * A single palette entry with light-mode and dark-mode color pairs,
 * plus inactive variants for toggle/button-group states.
 * All values are var() references to primitive CSS tokens.
 */
export interface AutoColorEntry {
  /** Light-mode background (shade-100) */
  bg: string;
  /** Light-mode text (shade-700) */
  text: string;
  /** Dark-mode background (shade-400) */
  darkBg: string;
  /** Dark-mode text (shade-900) */
  darkText: string;
  /** Light-mode inactive background (shade-50) */
  inactiveBg: string;
  /** Light-mode inactive text (shade-400) */
  inactiveText: string;
  /** Dark-mode inactive background (shade-950) */
  darkInactiveBg: string;
  /** Dark-mode inactive text (shade-500) */
  darkInactiveText: string;
}

/**
 * Helper to build a palette entry from a color family name.
 * Maps consistent shade numbers to each role across all families.
 */
function colorFamily(name: string): AutoColorEntry {
  return {
    bg: `var(--color-${name}-100)`,
    text: `var(--color-${name}-700)`,
    darkBg: `var(--color-${name}-400)`,
    darkText: `var(--color-${name}-900)`,
    inactiveBg: `var(--color-${name}-50)`,
    inactiveText: `var(--color-${name}-400)`,
    darkInactiveBg: `var(--color-${name}-950)`,
    darkInactiveText: `var(--color-${name}-500)`,
  };
}

/**
 * 14-color palette derived from Tailwind chromatic families.
 * Each entry references primitive CSS tokens via var(), so colors
 * automatically adapt when the theme's primitives are customized.
 *
 * Light mode: shade-100 background, shade-700 text.
 * Dark mode: shade-400 background, shade-900 text.
 */
export const AUTO_COLOR_PALETTE: readonly AutoColorEntry[] = [
  colorFamily("sky"),
  colorFamily("blue"),
  colorFamily("indigo"),
  colorFamily("purple"),
  colorFamily("violet"),
  colorFamily("fuchsia"),
  colorFamily("rose"),
  colorFamily("orange"),
  colorFamily("amber"),
  colorFamily("lime"),
  colorFamily("green"),
  colorFamily("emerald"),
  colorFamily("teal"),
  colorFamily("cyan"),
];

/**
 * Hash a string to an index in range [0, count).
 * Uses FNV-1a with a murmur3 finalizer for even distribution. Pure function.
 */
export function hashStringToIndex(value: string, count: number): number {
  // FNV-1a core
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Mix in length to break symmetry for anagram-like inputs
  h ^= value.length;
  // Murmur3 32-bit finalizer — avalanche all bits
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % count;
}

/**
 * Composable that returns reactive auto-color styles for a given string value.
 *
 * Hashes the string to deterministically pick a color from the 14-color palette.
 * Detects dark mode via `document.documentElement.classList.contains("dark")`.
 *
 * The returned `style` sets `{prefix}-bg` and `{prefix}-text` CSS custom
 * properties for the active state. The returned `inactiveStyle` uses the
 * muted inactive palette values for unselected/toggle-off states.
 *
 * The `tokenPrefix` parameter controls the CSS property key prefix.
 * Defaults to `"--dx-chip"`, the token prefix used by DanxChip.
 *
 * Note: Dark mode detection reads the DOM class list at evaluation time.
 * If dark mode is toggled while the component is mounted, the style will
 * only update when `value` changes (triggering a re-evaluation).
 *
 * @param value - String (or ref/getter) to hash for color selection
 * @param tokenPrefix - CSS variable prefix (default: "--dx-chip")
 * @returns Object with `colorIndex`, `style` (active), and `inactiveStyle` (muted)
 */
export function useAutoColor(value: MaybeRefOrGetter<string>, tokenPrefix = "--dx-chip") {
  const colorIndex = computed(() => hashStringToIndex(toValue(value), AUTO_COLOR_PALETTE.length));

  function checkDark(): boolean {
    return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  }

  const style = computed<CSSProperties>(() => {
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    const dark = checkDark();

    return {
      [`${tokenPrefix}-bg`]: dark ? entry.darkBg : entry.bg,
      [`${tokenPrefix}-text`]: dark ? entry.darkText : entry.text,
    } as CSSProperties;
  });

  const inactiveStyle = computed<CSSProperties>(() => {
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    const dark = checkDark();

    return {
      [`${tokenPrefix}-bg`]: dark ? entry.darkInactiveBg : entry.inactiveBg,
      [`${tokenPrefix}-text`]: dark ? entry.darkInactiveText : entry.inactiveText,
    } as CSSProperties;
  });

  return { colorIndex, style, inactiveStyle };
}
