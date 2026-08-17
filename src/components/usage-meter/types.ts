import type { PopoverPlacement, VariantType } from "../../shared/types";

/**
 * DanxUsageMeter Type Definitions
 */

/**
 * Usage meter sizes.
 * Affects track height and header font size.
 */
export type UsageMeterSize = "sm" | "md" | "lg";

/**
 * A single consumption category rendered as one slice of the track.
 *
 * Segments stack left-to-right in the order supplied. Their widths are
 * proportional to `value` against the meter denominator (see `useUsageMeter`).
 */
export interface UsageMeterSegment {
  /** Stable identity used as the v-for key. */
  id: string | number;

  /** Human-readable category name shown in the segment tooltip. */
  label: string;

  /** Amount consumed by this category, in the same unit as `total`. */
  value: number;

  /**
   * Semantic color variant for this segment.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Falls back to the meter-level `variant` prop when omitted.
   */
  variant?: VariantType;

  /**
   * Explicit CSS color for this segment (any CSS color value or var()).
   * Takes precedence over `variant` — use it for data-driven palettes
   * where semantic variants do not apply.
   */
  color?: string;
}

/**
 * A segment after the meter has resolved its geometry and presentation.
 * Produced by `useUsageMeter` and consumed by the segment renderer.
 */
export interface UsageMeterSegmentGeometry extends UsageMeterSegment {
  /** Non-negative, finite value (negative/NaN inputs are clamped to 0). */
  value: number;

  /** Share of the track this segment occupies, 0–100. */
  percent: number;

  /** `percent` as a CSS width string (e.g. "37.5%"). */
  width: string;

  /** `value` run through the meter's `formatValue` function. */
  formattedValue: string;

  /** `percent` rounded for display (e.g. "38%"). */
  percentLabel: string;
}

/**
 * Aggregate figures describing the whole meter.
 * Passed to the `label` and `readout` slots.
 */
export interface UsageMeterSummary {
  /** Sum of all segment values (clamped, may exceed `total`). */
  used: number;

  /** The denominator supplied via the `total` prop (clamped to >= 0). */
  total: number;

  /** Capacity left over, never negative. */
  remaining: number;

  /** `used / total * 100`. 0 when `total` is 0 — never NaN or Infinity. */
  percent: number;

  /** `percent` rounded for display (e.g. "38%"). */
  percentLabel: string;

  /** `used` run through `formatValue`. */
  formattedUsed: string;

  /** `total` run through `formatValue`. */
  formattedTotal: string;

  /** `remaining` run through `formatValue`. */
  formattedRemaining: string;

  /** Default readout string, e.g. "355.4k / 1M (36%)". */
  readout: string;

  /** True when the segments sum to more than `total`. */
  isOverCapacity: boolean;
}

export interface DanxUsageMeterProps {
  /**
   * Consumption categories, stacked left-to-right in array order.
   * @default []
   */
  segments?: UsageMeterSegment[];

  /**
   * Denominator representing full capacity. Whatever is not covered by
   * segments renders as empty track. A total of 0 renders an empty meter
   * and reports 0% rather than NaN%.
   * @default 0
   */
  total?: number;

  /**
   * Heading text rendered above the track. Also used as the accessible
   * name when `ariaLabel` is not supplied.
   */
  label?: string;

  /**
   * Meter size affecting track height and header font size.
   * @default "md"
   */
  size?: UsageMeterSize;

  /**
   * Default semantic color variant applied to segments that do not
   * declare their own `variant` or `color`.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Formats every number the meter displays (readout and tooltips).
   * Defaults to `formatUsageValue`, which abbreviates with k/M/B/T
   * (355400 → "355.4k") using native Intl — no peer dependencies.
   */
  formatValue?: (value: number) => string;

  /**
   * Show the "used / total (percent)" readout in the header.
   * @default true
   */
  showReadout?: boolean;

  /**
   * Show a tooltip on hover for each segment with its label,
   * formatted value, and share of the track.
   * @default true
   */
  showTooltips?: boolean;

  /**
   * Placement of the segment tooltips relative to the track.
   * @default "top"
   */
  tooltipPlacement?: PopoverPlacement;

  /**
   * Accessible label for the meter. Falls back to `label`, then to
   * "Usage" so the progressbar always has an accessible name.
   */
  ariaLabel?: string;
}

export interface DanxUsageMeterSlots {
  /**
   * Replace the heading text. Receives the meter summary.
   */
  label?(props: UsageMeterSummary): unknown;

  /**
   * Replace the readout text. Receives the meter summary.
   */
  readout?(props: UsageMeterSummary): unknown;

  /**
   * Replace the content of every segment tooltip.
   */
  tooltip?(props: { segment: UsageMeterSegmentGeometry }): unknown;
}

export interface UsageMeterSegmentProps {
  /** Resolved geometry for the segment this component renders. */
  segment: UsageMeterSegmentGeometry;

  /**
   * Render a hover tooltip anchored to the segment.
   * @default true
   */
  showTooltip?: boolean;

  /**
   * Tooltip placement relative to the segment.
   * @default "top"
   */
  tooltipPlacement?: PopoverPlacement;
}

export interface UsageMeterSegmentSlots {
  /**
   * Replace the tooltip content for this segment.
   */
  tooltip?(props: { segment: UsageMeterSegmentGeometry }): unknown;
}
