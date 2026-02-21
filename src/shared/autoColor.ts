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
 * A single palette entry with light-mode and dark-mode color pairs,
 * plus inactive variants for toggle/button-group states.
 */
export interface AutoColorEntry {
  /** Light-mode background (shade-100) */
  bg: string;
  /** Light-mode text (shade-700) */
  text: string;
  /** Dark-mode background (shade-600) */
  darkBg: string;
  /** Dark-mode text (shade-50) */
  darkText: string;
  /** Light-mode inactive background (shade-50) */
  inactiveBg: string;
  /** Light-mode inactive text (shade-400) */
  inactiveText: string;
  /** Dark-mode inactive background (near-black tinted) */
  darkInactiveBg: string;
  /** Dark-mode inactive text (shade-500) */
  darkInactiveText: string;
}

/**
 * 14-color palette derived from Tailwind chromatic families.
 * Each entry provides light and dark mode background/text pairs
 * using shade-100/700 for light mode and shade-600/50 for dark mode.
 */
export const AUTO_COLOR_PALETTE: readonly AutoColorEntry[] = [
  // sky
  {
    bg: "#e0f2fe",
    text: "#0369a1",
    darkBg: "#0284c7",
    darkText: "#f0f9ff",
    inactiveBg: "#f0f9ff",
    inactiveText: "#38bdf8",
    darkInactiveBg: "#041a2b",
    darkInactiveText: "#0ea5e9",
  },
  // blue
  {
    bg: "#dbeafe",
    text: "#1d4ed8",
    darkBg: "#2563eb",
    darkText: "#eff6ff",
    inactiveBg: "#eff6ff",
    inactiveText: "#60a5fa",
    darkInactiveBg: "#0b1530",
    darkInactiveText: "#3b82f6",
  },
  // indigo
  {
    bg: "#e0e7ff",
    text: "#4338ca",
    darkBg: "#4f46e5",
    darkText: "#eef2ff",
    inactiveBg: "#eef2ff",
    inactiveText: "#818cf8",
    darkInactiveBg: "#0f0d28",
    darkInactiveText: "#6366f1",
  },
  // purple
  {
    bg: "#f3e8ff",
    text: "#7c3aed",
    darkBg: "#9333ea",
    darkText: "#faf5ff",
    inactiveBg: "#faf5ff",
    inactiveText: "#a78bfa",
    darkInactiveBg: "#1e0436",
    darkInactiveText: "#8b5cf6",
  },
  // violet
  {
    bg: "#ede9fe",
    text: "#6d28d9",
    darkBg: "#7c3aed",
    darkText: "#f5f3ff",
    inactiveBg: "#f5f3ff",
    inactiveText: "#a78bfa",
    darkInactiveBg: "#170836",
    darkInactiveText: "#8b5cf6",
  },
  // fuchsia
  {
    bg: "#fae8ff",
    text: "#a21caf",
    darkBg: "#c026d3",
    darkText: "#fdf4ff",
    inactiveBg: "#fdf4ff",
    inactiveText: "#e879f9",
    darkInactiveBg: "#260228",
    darkInactiveText: "#d946ef",
  },
  // rose
  {
    bg: "#ffe4e6",
    text: "#be123c",
    darkBg: "#e11d48",
    darkText: "#fff1f2",
    inactiveBg: "#fff1f2",
    inactiveText: "#fb7185",
    darkInactiveBg: "#28030d",
    darkInactiveText: "#f43f5e",
  },
  // orange
  {
    bg: "#ffedd5",
    text: "#c2410c",
    darkBg: "#ea580c",
    darkText: "#fff7ed",
    inactiveBg: "#fff7ed",
    inactiveText: "#fb923c",
    darkInactiveBg: "#220a04",
    darkInactiveText: "#f97316",
  },
  // amber
  {
    bg: "#fef3c7",
    text: "#b45309",
    darkBg: "#d97706",
    darkText: "#fffbeb",
    inactiveBg: "#fffbeb",
    inactiveText: "#fbbf24",
    darkInactiveBg: "#230d02",
    darkInactiveText: "#f59e0b",
  },
  // lime
  {
    bg: "#ecfccb",
    text: "#4d7c0f",
    darkBg: "#65a30d",
    darkText: "#f7fee7",
    inactiveBg: "#f7fee7",
    inactiveText: "#a3e635",
    darkInactiveBg: "#0d1703",
    darkInactiveText: "#84cc16",
  },
  // green
  {
    bg: "#dcfce7",
    text: "#15803d",
    darkBg: "#16a34a",
    darkText: "#f0fdf4",
    inactiveBg: "#f0fdf4",
    inactiveText: "#4ade80",
    darkInactiveBg: "#03170b",
    darkInactiveText: "#22c55e",
  },
  // emerald
  {
    bg: "#d1fae5",
    text: "#047857",
    darkBg: "#059669",
    darkText: "#ecfdf5",
    inactiveBg: "#ecfdf5",
    inactiveText: "#34d399",
    darkInactiveBg: "#011611",
    darkInactiveText: "#10b981",
  },
  // teal
  {
    bg: "#ccfbf1",
    text: "#0f766e",
    darkBg: "#0d9488",
    darkText: "#f0fdfa",
    inactiveBg: "#f0fdfa",
    inactiveText: "#2dd4bf",
    darkInactiveBg: "#021817",
    darkInactiveText: "#14b8a6",
  },
  // cyan
  {
    bg: "#cffafe",
    text: "#0e7490",
    darkBg: "#0891b2",
    darkText: "#ecfeff",
    inactiveBg: "#ecfeff",
    inactiveText: "#22d3ee",
    darkInactiveBg: "#041a24",
    darkInactiveText: "#06b6d4",
  },
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
