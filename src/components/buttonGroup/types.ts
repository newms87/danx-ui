/**
 * DanxButtonGroup Type Definitions
 */

import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * A single button item in a button group. Each button has a unique value
 * used for v-model binding, a display label, and optional icon, count badge,
 * active color, and click callback.
 */
export interface DanxButtonGroupItem {
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
   * Per-button active color (CSS color value).
   * When omitted, falls back to --dx-button-group-active-bg token.
   */
  activeColor?: string;

  /** Optional click callback invoked when this button is clicked */
  onClick?: () => void;
}

/**
 * Controls when auto-color styles are applied:
 * - "active-only": Only active (selected) buttons get auto-color
 * - "always": Both active and inactive buttons get auto-color (active=vibrant, inactive=muted)
 */
export type AutoColorMode = "active-only" | "always";

export interface DanxButtonGroupProps {
  /** Array of button items to render */
  buttons: DanxButtonGroupItem[];

  /** Allow multiple buttons to be selected simultaneously */
  multiple?: boolean;

  /** Prevent deselecting the last selected button (single-select mode only) */
  required?: boolean;

  /**
   * Enable auto-color per button. When true, uses each button's label
   * for color hashing. When a string, uses that string as the hash key.
   */
  autoColor?: boolean | string;

  /** Controls when auto-color styles are applied (default: "active-only") */
  autoColorMode?: AutoColorMode;
}

export interface DanxButtonGroupEmits {
  /** Emitted when a button is selected */
  (e: "select", value: string): void;

  /** Emitted when a button is deselected */
  (e: "deselect", value: string): void;
}
