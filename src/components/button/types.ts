import type { Component } from "vue";
import type { IconName } from "./icons";

/**
 * DanxButton Type Definitions
 */

/**
 * Semantic button type that controls color only.
 *
 * Each type maps to a color category:
 * - "" (blank): No background color, inherits text color (default)
 * - danger: Destructive actions (red)
 * - success: Constructive actions (green)
 * - warning: Cautionary actions (amber)
 * - info: Informational actions (blue)
 * - muted: Neutral/secondary actions (gray)
 */
export type ButtonType = "" | "danger" | "success" | "warning" | "info" | "muted";

/**
 * Button sizes.
 * Affects padding, icon size, font size, and gap.
 */
export type ButtonSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

export interface DanxButtonProps {
  /**
   * Semantic color type. Controls background and text color only.
   * Blank string or omitted means no background color.
   * @default ""
   */
  type?: ButtonType;

  /**
   * App-defined semantic type. Generates the same BEM modifier class as `type`
   * (e.g., `customType="restart"` → `.danx-button--restart`) but accepts any string.
   * The app must define the matching CSS tokens and modifier rules.
   * When set, takes precedence over `type` for class generation.
   * @default ""
   */
  customType?: string;

  /**
   * Button size affecting padding, icon size, and font size.
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * Icon to display. Accepts:
   * - A built-in icon name (e.g. "trash", "save", "edit")
   * - A raw SVG string (rendered via innerHTML, preserving currentColor)
   * - A Vue component (renders via <component :is>)
   * When omitted and no icon slot is provided, no icon area is rendered.
   */
  icon?: Component | IconName | string;

  /**
   * Disables the button, preventing clicks and styling as disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Shows a loading spinner and prevents clicks.
   * @default false
   */
  loading?: boolean;

  /**
   * Tooltip text shown on hover (native title attribute).
   */
  tooltip?: string;

  /**
   * Text label for the button. Alternative to using the default slot.
   * When both label prop and slot content are provided, slot content wins.
   */
  label?: string;
}

export interface DanxButtonEmits {
  /** Emitted when button is clicked (not emitted when disabled or loading) */
  (e: "click", event: MouseEvent): void;
}

export interface DanxButtonSlots {
  /** Override the icon rendering entirely */
  icon?(): unknown;

  /** Button text content */
  default?(): unknown;
}
