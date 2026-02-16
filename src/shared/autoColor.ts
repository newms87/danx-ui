/**
 * Auto-Color Utility
 *
 * Deterministically assigns colors to strings by hashing label text to a
 * palette index. The same string always maps to the same color, giving
 * visually distinct colors to different tags/statuses without manual mapping.
 *
 * The palette uses hex values from 14 chromatic Tailwind families
 * (sky, blue, indigo, purple, violet, fuchsia, rose, orange, amber,
 * lime, green, emerald, teal, cyan) with light/dark pairs.
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
 * 14-color palette derived from Tailwind chromatic families.
 * Each entry provides light and dark mode background/text pairs
 * using shade-100/700 for light mode and shade-900/200 for dark mode.
 */
export const AUTO_COLOR_PALETTE: readonly AutoColorEntry[] = [
  { bg: "#e0f2fe", text: "#0369a1", darkBg: "#0c4a6e", darkText: "#bae6fd" }, // sky
  { bg: "#dbeafe", text: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#bfdbfe" }, // blue
  { bg: "#e0e7ff", text: "#4338ca", darkBg: "#312e81", darkText: "#c7d2fe" }, // indigo
  { bg: "#f3e8ff", text: "#7c3aed", darkBg: "#581c87", darkText: "#e9d5ff" }, // purple
  { bg: "#ede9fe", text: "#6d28d9", darkBg: "#4c1d95", darkText: "#ddd6fe" }, // violet
  { bg: "#fae8ff", text: "#a21caf", darkBg: "#701a75", darkText: "#f5d0fe" }, // fuchsia
  { bg: "#ffe4e6", text: "#be123c", darkBg: "#881337", darkText: "#fecdd3" }, // rose
  { bg: "#ffedd5", text: "#c2410c", darkBg: "#7c2d12", darkText: "#fed7aa" }, // orange
  { bg: "#fef3c7", text: "#b45309", darkBg: "#78350f", darkText: "#fde68a" }, // amber
  { bg: "#ecfccb", text: "#4d7c0f", darkBg: "#365314", darkText: "#d9f99d" }, // lime
  { bg: "#dcfce7", text: "#15803d", darkBg: "#14532d", darkText: "#bbf7d0" }, // green
  { bg: "#d1fae5", text: "#047857", darkBg: "#064e3b", darkText: "#a7f3d0" }, // emerald
  { bg: "#ccfbf1", text: "#0f766e", darkBg: "#134e4a", darkText: "#99f6e4" }, // teal
  { bg: "#cffafe", text: "#0e7490", darkBg: "#164e63", darkText: "#a5f3fc" }, // cyan
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
 * Hashes the string to deterministically pick a color from the 14-color palette.
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
 * @returns Object with `colorIndex` (computed 0-13) and `style` (computed CSSProperties)
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
