/**
 * DanxBadge Type Definitions
 */

/**
 * Semantic badge type that controls color only.
 *
 * Each type maps to a color category:
 * - "" (blank): Default surface background with text color
 * - danger: Error/notification indicators (red) — default for badges
 * - success: Positive/complete indicators (green)
 * - warning: Cautionary indicators (amber)
 * - info: Informational indicators (blue)
 * - muted: Neutral/secondary indicators (gray)
 */
export type BadgeType = "" | "danger" | "success" | "warning" | "info" | "muted";

/**
 * Badge placement relative to the wrapped content.
 * Controls which corner the badge indicator anchors to.
 */
export type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface DanxBadgeProps {
  /**
   * Semantic color type. Controls background and text color.
   * @default "danger"
   */
  type?: BadgeType;

  /**
   * App-defined semantic type. Generates the same BEM modifier class as `type`
   * (e.g., `customType="live"` -> `.danx-badge__indicator--live`) but accepts any string.
   * The app must define the matching CSS tokens and modifier rules.
   * When set, takes precedence over `type` for class generation.
   * @default ""
   */
  customType?: string;

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
   * Overrides `type` colors when set (inline style wins over class).
   * @default false
   */
  autoColor?: boolean | string;
}

export interface DanxBadgeSlots {
  /** The wrapped content that the badge overlays */
  default?(): unknown;
}
