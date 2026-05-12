/**
 * useRangeSlider - Pure math composable backing DanxRangeSlider.
 *
 * Holds clamping, step rounding, percent computation, and cross-prevention so
 * the SFC stays focused on DOM concerns. Tests target this composable directly
 * for the arithmetic, leaving the component tests free to focus on rendering
 * + keyboard + pointer wiring.
 *
 * Mode is auto-detected from the model shape:
 * - `Ref<number>` → single-handle mode
 * - `Ref<[number, number]>` → dual-handle mode (tuple is `[min, max]`)
 *
 * @param model - Writable Vue ref (typically the result of `defineModel`).
 * @param options - Bounds (min/max) and step increment. Bounds may be plain
 *   numbers or zero-arg getters so the SFC can hand its props in directly.
 */

import { computed, type ComputedRef, type MaybeRefOrGetter, type Ref, toValue } from "vue";
import type { RangeSliderModel } from "./types";

export interface UseRangeSliderOptions {
  min: MaybeRefOrGetter<number>;
  max: MaybeRefOrGetter<number>;
  step: MaybeRefOrGetter<number>;
}

export interface UseRangeSliderReturn {
  /** True when the model is a `[number, number]` tuple. */
  isDual: ComputedRef<boolean>;

  /** Active number in single-handle mode. Falls back to global min in dual mode. */
  singleValue: ComputedRef<number>;
  /** Lower handle in dual mode. Falls back to global min in single mode. */
  minValue: ComputedRef<number>;
  /** Upper handle in dual mode. Falls back to global max in single mode. */
  maxValue: ComputedRef<number>;

  /** Percent (0-100) of `singleValue` along the bounds. */
  percent: ComputedRef<number>;
  /** Percent (0-100) of `minValue` along the bounds. */
  percentMin: ComputedRef<number>;
  /** Percent (0-100) of `maxValue` along the bounds. */
  percentMax: ComputedRef<number>;

  /** Clamp a raw number to the configured `[min, max]` bounds. */
  clamp(v: number): number;
  /** Round to the nearest `min + n*step` value, then clamp. */
  roundToStep(v: number): number;
  /** Convert a percent (0-100) along the track to a stepped + clamped value. */
  valueAtPercent(p: number): number;

  /** Set the single-handle model. No-op in dual mode. */
  setSingle(v: number): void;
  /** Set the lower handle in dual mode. No-op in single mode. Cross-protected against `maxValue`. */
  setMin(v: number): void;
  /** Set the upper handle in dual mode. No-op in single mode. Cross-protected against `minValue`. */
  setMax(v: number): void;
}

export function useRangeSlider(
  model: Ref<RangeSliderModel>,
  options: UseRangeSliderOptions
): UseRangeSliderReturn {
  const isDual = computed(() => Array.isArray(model.value));

  function getMin(): number {
    return toValue(options.min);
  }
  function getMax(): number {
    return toValue(options.max);
  }
  function getStep(): number {
    return toValue(options.step);
  }

  function clamp(v: number): number {
    const lo = getMin();
    const hi = getMax();
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
  }

  function roundToStep(v: number): number {
    const step = getStep();
    const lo = getMin();
    const hi = getMax();
    if (step <= 0) {
      // Degenerate step → just clamp.
      return clamp(v);
    }
    const stepped = lo + Math.round((v - lo) / step) * step;
    if (stepped < lo) return lo;
    if (stepped > hi) return hi;
    return stepped;
  }

  function valueAtPercent(p: number): number {
    const lo = getMin();
    const hi = getMax();
    const pct = Math.max(0, Math.min(100, p));
    const raw = lo + (pct / 100) * (hi - lo);
    return roundToStep(raw);
  }

  const singleValue = computed<number>(() => {
    if (isDual.value) return getMin();
    return model.value as number;
  });

  const minValue = computed<number>(() => {
    if (!isDual.value) return getMin();
    return (model.value as [number, number])[0];
  });

  const maxValue = computed<number>(() => {
    if (!isDual.value) return getMax();
    return (model.value as [number, number])[1];
  });

  function rangePercent(v: number): number {
    const lo = getMin();
    const hi = getMax();
    if (hi === lo) return 0;
    return ((v - lo) / (hi - lo)) * 100;
  }

  const percent = computed(() => rangePercent(singleValue.value));
  const percentMin = computed(() => rangePercent(minValue.value));
  const percentMax = computed(() => rangePercent(maxValue.value));

  function setSingle(v: number) {
    if (isDual.value) return;
    model.value = roundToStep(clamp(v));
  }

  function setMin(v: number) {
    if (!isDual.value) return;
    const tuple = model.value as [number, number];
    const currentMax = tuple[1];
    let next = roundToStep(clamp(v));
    if (next > currentMax) {
      // Crossed — pull back to one step below the max handle ("within step of the other"),
      // re-stepped + re-clamped so the value remains on the grid + within bounds.
      next = roundToStep(clamp(currentMax - getStep()));
    }
    model.value = [next, currentMax];
  }

  function setMax(v: number) {
    if (!isDual.value) return;
    const tuple = model.value as [number, number];
    const currentMin = tuple[0];
    let next = roundToStep(clamp(v));
    if (next < currentMin) {
      next = roundToStep(clamp(currentMin + getStep()));
    }
    model.value = [currentMin, next];
  }

  return {
    isDual,
    singleValue,
    minValue,
    maxValue,
    percent,
    percentMin,
    percentMax,
    clamp,
    roundToStep,
    valueAtPercent,
    setSingle,
    setMin,
    setMax,
  };
}
