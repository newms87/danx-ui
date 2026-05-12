import type { VariantType } from "../../shared/types";

/**
 * DanxRangeSlider Type Definitions
 */

/**
 * Discriminator for the active handle when emitting the `value` slot scope.
 * - `"single"` — single-handle mode, v-model is a number.
 * - `"min"` / `"max"` — dual-handle mode, v-model is `[number, number]`.
 */
export type RangeSliderHandle = "single" | "min" | "max";

/**
 * Range slider v-model shape.
 * - `number` → single-handle mode.
 * - `[number, number]` → dual-handle mode (tuple is `[min, max]`).
 */
export type RangeSliderModel = number | [number, number];

export interface DanxRangeSliderProps {
  /**
   * Minimum slider bound (inclusive).
   * @default 0
   */
  min?: number;

  /**
   * Maximum slider bound (inclusive).
   * @default 100
   */
  max?: number;

  /**
   * Increment between selectable values. Every emitted value is `min + n * step`
   * rounded to nearest within `[min, max]`.
   * @default 1
   */
  step?: number;

  /**
   * Locks all interaction (pointer + keyboard) and applies the disabled dimming token.
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant controlling the fill / handle color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Blank ("") falls back to the default --color-interactive fill.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Accessible name for the slider group container (`role="group"`).
   *
   * REQUIRED — without it the slider has no accessible name and screen
   * readers will announce only the role.
   */
  ariaLabel?: string;
}

/** Scope passed to the `value` slot — formatter callers receive the value + which handle. */
export interface RangeSliderValueSlotScope {
  value: number;
  handle: RangeSliderHandle;
}

export interface DanxRangeSliderSlots {
  /**
   * Render-prop slot used to format the bubble label above each handle.
   * Receives `{ value, handle }`. Default renders `String(value)`.
   */
  value?(scope: RangeSliderValueSlotScope): unknown;
}
