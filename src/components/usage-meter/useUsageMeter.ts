/**
 * useUsageMeter - Geometry and number formatting for DanxUsageMeter
 *
 * Turns a list of raw segments plus a total into render-ready geometry
 * (widths, percentages, formatted values) and an aggregate summary.
 *
 * All math is defensive: negative, NaN and Infinity inputs are clamped to 0,
 * and a zero total never produces NaN% or Infinity% — it reports 0%.
 *
 * ## Denominator
 * Segment widths are computed against `max(total, sum(values))`, not against
 * `total` alone. When consumption stays within capacity those are identical.
 * When it overshoots, the track stays full and segments keep their relative
 * proportions instead of overflowing the container, while the summary still
 * reports the true (>100%) consumption.
 *
 * @param options - Reactive sources for segments, total, formatter, and fallback variant
 * @returns Computed segment geometry and the aggregate summary
 *
 * @example
 *   const { segments, summary } = useUsageMeter({
 *     segments: () => props.segments,
 *     total: () => props.total,
 *   });
 */

import {
  computed,
  unref,
  type ComputedRef,
  type MaybeRef,
  type MaybeRefOrGetter,
  toValue,
} from "vue";
import type { VariantType } from "../../shared/types";
import type { UsageMeterSegment, UsageMeterSegmentGeometry, UsageMeterSummary } from "./types";

/** Abbreviation steps for the default formatter, largest first. */
const USAGE_UNITS = [
  { threshold: 1e12, suffix: "T" },
  { threshold: 1e9, suffix: "B" },
  { threshold: 1e6, suffix: "M" },
  { threshold: 1e3, suffix: "k" },
];

/**
 * Deterministic "en-US" formatter capped at one fraction digit.
 * A fixed locale keeps meter output stable regardless of host locale —
 * pass a custom `formatValue` to localize.
 */
const USAGE_NUMBER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/**
 * Default value formatter — abbreviates large numbers with k/M/B/T.
 *
 * Uses native Intl only (no luxon, no @vueuse/core), keeps at most one
 * fraction digit, and drops trailing zeros: 999 → "999", 355400 → "355.4k",
 * 1000000 → "1M", 1234567890 → "1.2B". Non-finite input returns "0".
 *
 * This intentionally differs from the shared `fShortNumber` helper, which
 * uppercases the thousands suffix ("355K") and drops the decimal above 100.
 * Meters read better with the finer-grained lowercase-k form.
 */
export function formatUsageValue(value: number): string {
  if (!Number.isFinite(value)) return "0";

  const abs = Math.abs(value);
  const unit = USAGE_UNITS.find((candidate) => abs >= candidate.threshold);
  if (!unit) return USAGE_NUMBER_FORMAT.format(value);

  return `${USAGE_NUMBER_FORMAT.format(value / unit.threshold)}${unit.suffix}`;
}

/** Clamps a raw number to a finite, non-negative value. */
function clamp(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Rounds a percentage for display, e.g. 37.5 → "38%". */
function toPercentLabel(percent: number): string {
  return `${Math.round(percent)}%`;
}

export interface UseUsageMeterOptions {
  /** Raw segments supplied by the consumer. */
  segments: MaybeRefOrGetter<UsageMeterSegment[]>;

  /** Raw capacity denominator. */
  total: MaybeRefOrGetter<number>;

  /**
   * Optional formatter override; falls back to `formatUsageValue`.
   *
   * A plain ref or value, NOT a getter — `toValue` cannot be used here because
   * a formatter is itself a function, and `toValue` would call it as a getter
   * instead of returning it. Pass `computed(() => props.formatValue)` from a
   * component, or the function directly.
   */
  formatValue?: MaybeRef<((value: number) => string) | undefined>;

  /** Variant applied to segments that declare none of their own. */
  variant?: MaybeRefOrGetter<VariantType | undefined>;
}

export interface UseUsageMeterReturn {
  /** Render-ready geometry, one entry per input segment. */
  segments: ComputedRef<UsageMeterSegmentGeometry[]>;

  /** Aggregate figures for the header, readout, and ARIA wiring. */
  summary: ComputedRef<UsageMeterSummary>;

  /** Width of the unused portion of the track as a CSS percentage string. */
  remainingWidth: ComputedRef<string>;
}

export function useUsageMeter(options: UseUsageMeterOptions): UseUsageMeterReturn {
  // `unref`, not `toValue` — see the option's doc comment.
  const format = computed(() => unref(options.formatValue) ?? formatUsageValue);

  const total = computed(() => clamp(toValue(options.total)));

  const used = computed(() =>
    toValue(options.segments).reduce((sum, segment) => sum + clamp(segment.value), 0)
  );

  /** Widths are relative to capacity, or to consumption when it overshoots. */
  const denominator = computed(() => Math.max(total.value, used.value));

  function percentOf(value: number): number {
    if (denominator.value <= 0) return 0;
    return (clamp(value) / denominator.value) * 100;
  }

  const segments = computed<UsageMeterSegmentGeometry[]>(() =>
    toValue(options.segments).map((segment) => {
      const value = clamp(segment.value);
      const percent = percentOf(value);

      return {
        ...segment,
        value,
        variant: segment.variant || toValue(options.variant) || "",
        percent,
        width: `${percent}%`,
        formattedValue: format.value(value),
        percentLabel: toPercentLabel(percent),
      };
    })
  );

  const remainingWidth = computed(() => {
    const consumed = segments.value.reduce((sum, segment) => sum + segment.percent, 0);
    return `${Math.max(0, 100 - consumed)}%`;
  });

  const summary = computed<UsageMeterSummary>(() => {
    const percent = total.value <= 0 ? 0 : (used.value / total.value) * 100;
    const remaining = Math.max(0, total.value - used.value);
    const formattedUsed = format.value(used.value);
    const formattedTotal = format.value(total.value);
    const percentLabel = toPercentLabel(percent);

    return {
      used: used.value,
      total: total.value,
      remaining,
      percent,
      percentLabel,
      formattedUsed,
      formattedTotal,
      formattedRemaining: format.value(remaining),
      readout: `${formattedUsed} / ${formattedTotal} (${percentLabel})`,
      isOverCapacity: used.value > total.value,
    };
  });

  return { segments, summary, remainingWidth };
}
