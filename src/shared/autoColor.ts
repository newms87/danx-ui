/**
 * Auto-Color Utility
 *
 * Deterministically assigns colors to strings by hashing label text to a
 * palette index. The same string always maps to the same color, giving
 * visually distinct colors to different tags/statuses without manual mapping.
 *
 * The palette uses hex values from the 7 chromatic primitive families
 * (blue, red, green, amber, purple, cyan, indigo) with light/dark pairs.
 */

import { computed, type CSSProperties, type MaybeRefOrGetter, toValue } from "vue";

/**
 * A single palette entry with light-mode and dark-mode color pairs.
 */
export interface AutoColorEntry {
  /** Light-mode background (shade-100) */
  bg: string;
  /** Light-mode text (shade-700) */
  text: string;
  /** Dark-mode background (shade-900) */
  darkBg: string;
  /** Dark-mode text (shade-200) */
  darkText: string;
}

/**
 * 7-color palette derived from primitives.css chromatic families.
 * Each entry provides light and dark mode background/text pairs.
 */
export const AUTO_COLOR_PALETTE: readonly AutoColorEntry[] = [
  { bg: "#dbeafe", text: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#bfdbfe" }, // blue
  { bg: "#fee2e2", text: "#b91c1c", darkBg: "#7f1d1d", darkText: "#fecaca" }, // red
  { bg: "#dcfce7", text: "#15803d", darkBg: "#14532d", darkText: "#bbf7d0" }, // green
  { bg: "#fef3c7", text: "#b45309", darkBg: "#78350f", darkText: "#fde68a" }, // amber
  { bg: "#f3e8ff", text: "#7c3aed", darkBg: "#581c87", darkText: "#e9d5ff" }, // purple
  { bg: "#cffafe", text: "#0e7490", darkBg: "#164e63", darkText: "#a5f3fc" }, // cyan
  { bg: "#e0e7ff", text: "#4338ca", darkBg: "#312e81", darkText: "#c7d2fe" }, // indigo
];

/**
 * Hash a string to an index in range [0, count).
 * Sums character codes and returns modulo count. Pure function.
 */
export function hashStringToIndex(value: string, count: number): number {
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    sum += value.charCodeAt(i);
  }
  return sum % count;
}

/**
 * Composable that returns reactive auto-color style for a given string value.
 *
 * Hashes the string to deterministically pick a color from the 7-color palette.
 * Detects dark mode via `document.documentElement.classList.contains("dark")`.
 *
 * The returned style sets `--dx-chip-bg` and `--dx-chip-text` CSS custom
 * properties. Works with DanxChip directly, or any element whose CSS reads
 * those tokens.
 *
 * Note: Dark mode detection reads the DOM class list at evaluation time.
 * If dark mode is toggled while the component is mounted, the style will
 * only update when `value` changes (triggering a re-evaluation).
 *
 * @param value - String (or ref/getter) to hash for color selection
 * @returns Object with `colorIndex` (computed 0-6) and `style` (computed CSSProperties)
 */
export function useAutoColor(value: MaybeRefOrGetter<string>) {
  const colorIndex = computed(() => hashStringToIndex(toValue(value), AUTO_COLOR_PALETTE.length));

  const style = computed<CSSProperties>(() => {
    const entry = AUTO_COLOR_PALETTE[colorIndex.value];
    const isDark =
      typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const bg = isDark ? entry.darkBg : entry.bg;
    const text = isDark ? entry.darkText : entry.text;

    return {
      "--dx-chip-bg": bg,
      "--dx-chip-text": text,
    } as CSSProperties;
  });

  return { colorIndex, style };
}
