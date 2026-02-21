import type { Component } from "vue";
import type { VariantType } from "../../shared/types";
import type { IconName } from "../icon/icons";

/**
 * DanxProgressBar Type Definitions
 */

/**
 * Progress bar sizes.
 * Affects height, font size, and text padding.
 */
export type ProgressBarSize = "sm" | "md" | "lg";

/**
 * Text position relative to the progress bar track.
 * - inside: Centered within the fill area
 * - above: Displayed above the track
 * - beside: Displayed to the right of the track
 */
export type ProgressBarTextPosition = "inside" | "above" | "beside";

/**
 * Text alignment within the text container.
 */
export type ProgressBarTextAlign = "left" | "center" | "right";

export interface DanxProgressBarProps {
  /**
   * Current progress value.
   * @default 0
   */
  value?: number;

  /**
   * Maximum value representing 100% completion.
   * @default 100
   */
  max?: number;

  /**
   * Buffer value shown as a secondary fill behind the main fill.
   * Useful for buffered loading (e.g. video buffering).
   * @default 0
   */
  buffer?: number;

  /**
   * Indeterminate mode — shows an animated sliding bar
   * instead of a fixed progress fill.
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Visual variant controlling fill color, glow, and gradient colors.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Progress bar size affecting height and font size.
   * @default "md"
   */
  size?: ProgressBarSize;

  /**
   * Icon to display in the fill area. Accepts:
   * - A built-in icon name (e.g. "check", "warning")
   * - A raw SVG string
   * - A Vue component
   */
  icon?: Component | IconName | string;

  /**
   * Show striped overlay on the fill.
   * @default false
   */
  striped?: boolean;

  /**
   * Animate stripes (requires striped to be true).
   * @default false
   */
  animateStripes?: boolean;

  /**
   * Show a pulsing glow effect on the fill.
   * @default false
   */
  glow?: boolean;

  /**
   * Show a shimmer sweep effect across the fill.
   * @default false
   */
  shimmer?: boolean;

  /**
   * Use a gradient fill instead of a solid color.
   * @default false
   */
  gradient?: boolean;

  /**
   * Show text label on the progress bar.
   * @default true
   */
  showText?: boolean;

  /**
   * Position of the text label.
   * Auto-forces "beside" when size is "sm".
   * @default "inside"
   */
  textPosition?: ProgressBarTextPosition;

  /**
   * Text alignment within the text container.
   * @default "center"
   */
  textAlign?: ProgressBarTextAlign;

  /**
   * Custom label text override. When set, replaces the default percentage display.
   */
  label?: string;

  /**
   * Accessible label for screen readers.
   */
  ariaLabel?: string;
}

export interface DanxProgressBarSlots {
  /**
   * Override the default text content.
   * Receives the current value, max, and computed percent.
   */
  default?(props: { value: number; max: number; percent: number }): unknown;

  /**
   * Override the icon rendering entirely.
   */
  icon?(): unknown;
}
