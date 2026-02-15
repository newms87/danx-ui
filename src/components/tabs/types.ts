import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxTabs Type Definitions
 */

/**
 * A single tab item. Each tab has a unique value used for v-model binding,
 * a display label, and optional icon, count badge, and active indicator color.
 */
export interface DanxTab {
  /** Unique identifier used as the v-model value */
  value: string;

  /** Display label text */
  label: string;

  /**
   * Icon to display before the label. Accepts:
   * - A built-in icon name (e.g. "confirm", "trash")
   * - A raw SVG string (rendered via innerHTML)
   * - A Vue component (renders via <component :is>)
   */
  icon?: Component | IconName | string;

  /** Optional count displayed as a badge after the label */
  count?: number;

  /**
   * Per-tab active indicator color (CSS color value).
   * When omitted, falls back to --dx-tabs-active-color token.
   */
  activeColor?: string;
}

export interface DanxTabsProps {
  /** Array of tab items to render */
  tabs: DanxTab[];
}
