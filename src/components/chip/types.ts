import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxChip Type Definitions
 */

/**
 * Semantic chip type that controls color only.
 *
 * Each type maps to a color category:
 * - "" (blank): Default surface background with text color
 * - danger: Destructive/error labels (red)
 * - success: Positive/complete labels (green)
 * - warning: Cautionary labels (amber)
 * - info: Informational labels (blue)
 * - muted: Neutral/secondary labels (gray)
 */
export type ChipType = "" | "danger" | "success" | "warning" | "info" | "muted";

/**
 * Chip sizes.
 * Affects padding, icon size, font size, and gap.
 */
export type ChipSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

export interface DanxChipProps {
  /**
   * Semantic color type. Controls background and text color only.
   * Blank string or omitted means default surface background.
   * @default ""
   */
  type?: ChipType;

  /**
   * Chip size affecting padding, icon size, and font size.
   * @default "md"
   */
  size?: ChipSize;

  /**
   * Icon to display. Accepts:
   * - A built-in icon name (e.g. "confirm", "trash", "edit")
   * - A raw SVG string (rendered via innerHTML, preserving currentColor)
   * - A Vue component (renders via <component :is>)
   * When omitted and no icon slot is provided, no icon area is rendered.
   */
  icon?: Component | IconName | string;

  /**
   * Text label for the chip. Alternative to using the default slot.
   * When both label prop and slot content are provided, slot content wins.
   */
  label?: string;

  /**
   * Automatically assigns a deterministic color based on a hashed string.
   * When `true`, hashes the `label` prop to pick a color from the 7-color palette.
   * When a string, hashes that string instead (useful when display text differs
   * from the grouping key). When falsy (default), no auto-color is applied.
   * Overrides `type` colors when both are set (inline style wins over class).
   * @default false
   */
  autoColor?: boolean | string;

  /**
   * Shows a remove (X) button that emits the remove event when clicked.
   * @default false
   */
  removable?: boolean;

  /**
   * Tooltip text shown on hover (native title attribute).
   */
  tooltip?: string;
}

export interface DanxChipEmits {
  /** Emitted when the remove button is clicked */
  (e: "remove"): void;
}

export interface DanxChipSlots {
  /** Override the icon rendering entirely */
  icon?(): unknown;

  /** Chip text content */
  default?(): unknown;
}
