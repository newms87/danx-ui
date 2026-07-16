/**
 * useRating - Pure math composable backing DanxRating.
 *
 * Holds clamping, step rounding (whole vs half-star), and per-star fill-percent
 * computation so the SFC stays focused on DOM concerns. Tests target this
 * composable directly for the arithmetic, leaving the component tests free to
 * focus on rendering + keyboard + pointer wiring.
 *
 * @param options - `max` (star count) and `allowHalf` (0.5 vs 1 step). Both
 *   may be plain values or zero-arg getters so the SFC can hand its props in directly.
 */

import { type ComputedRef, computed, type MaybeRefOrGetter, toValue } from "vue";

export interface UseRatingOptions {
  max: MaybeRefOrGetter<number>;
  allowHalf: MaybeRefOrGetter<boolean>;
}

export interface UseRatingReturn {
  /** Step increment: `0.5` when `allowHalf`, else `1`. */
  step: ComputedRef<number>;
  /** Clamp a raw number to `[0, max]`. */
  clamp(v: number): number;
  /** Round to the nearest step, then clamp to `[0, max]`. */
  roundToStep(v: number): number;
  /**
   * Convert a fractional pointer position within one star (0-1, left-to-right)
   * plus that star's 1-based index into a stepped + clamped rating value.
   */
  valueAtStarPosition(starIndex: number, fraction: number): number;
  /**
   * Fill percent (0-100) for a single star at `starIndex` (1-based) given the
   * current `value`. `100` = fully filled, `0` = empty, `50` = half-filled.
   */
  fillPercent(value: number, starIndex: number): number;
}

export function useRating(options: UseRatingOptions): UseRatingReturn {
  function getMax(): number {
    return toValue(options.max);
  }
  function getAllowHalf(): boolean {
    return toValue(options.allowHalf);
  }

  const step = computed(() => (getAllowHalf() ? 0.5 : 1));

  function clamp(v: number): number {
    const max = getMax();
    if (v < 0) return 0;
    if (v > max) return max;
    return v;
  }

  function roundToStep(v: number): number {
    const s = step.value;
    return clamp(Math.round(v / s) * s);
  }

  function valueAtStarPosition(starIndex: number, fraction: number): number {
    const frac = Math.max(0, Math.min(1, fraction));
    if (!getAllowHalf()) return clamp(starIndex);
    const raw = frac < 0.5 ? starIndex - 0.5 : starIndex;
    return clamp(raw);
  }

  function fillPercent(value: number, starIndex: number): number {
    const diff = value - (starIndex - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return diff * 100;
  }

  return {
    step,
    clamp,
    roundToStep,
    valueAtStarPosition,
    fillPercent,
  };
}
