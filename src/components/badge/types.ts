import type { VariantType } from "../../shared/types";

/**
 * DanxBadge Type Definitions
 */

/**
 * Badge placement relative to the wrapped content.
 * Controls which corner the badge indicator anchors to.
 */
export type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface DanxBadgeProps {
  /**
   * Visual variant controlling background and text color.
   * Built-in: "danger" (default), "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * @default "danger"
   */
  variant?: VariantType;

  /**
   * Badge content value. Numbers display as counts (capped by `max`).
   * Strings display as-is (e.g. "NEW", "BETA").
   * When omitted or 0, the badge hides unless `showZero` or `dot` is set.
   */
  value?: number | string;

  /**
   * Maximum count value before showing overflow indicator.
   * When the numeric value exceeds max, displays "{max}+" (e.g. "99+").
   * @default 99
   */
  max?: number;

  /**
   * Dot-only mode. Renders a small circular indicator with no text.
   * Ignores `value` and `max` when true.
   * @default false
   */
  dot?: boolean;

  /**
   * Show the badge when numeric value is 0.
   * By default, a value of 0 hides the badge.
   * @default false
   */
  showZero?: boolean;

  /**
   * Force-hide the badge indicator regardless of value.
   * @default false
   */
  hidden?: boolean;

  /**
   * Corner placement of the badge indicator relative to wrapped content.
   * @default "top-right"
   */
  placement?: BadgePlacement;

  /**
   * Automatically assigns a deterministic color based on a hashed string.
   * When `true`, hashes the string value to pick a color from the palette.
   * When a string, hashes that string instead. When falsy, no auto-color.
   * Overrides `variant` colors when set (inline style wins over class).
   * @default false
   */
  autoColor?: boolean | string;
}

export interface DanxBadgeSlots {
  /** The wrapped content that the badge overlays */
  default?(): unknown;
}
