/**
 * DanxNumberInput Type Definitions
 */

import type { FormFieldBaseProps, FormFieldEmits } from "../../shared/form-types";

export interface DanxNumberInputProps extends FormFieldBaseProps {
  /** Minimum allowed value. Steps and blur clamp to this floor. */
  min?: number;

  /** Maximum allowed value. Steps and blur clamp to this ceiling. */
  max?: number;

  /**
   * Amount added/subtracted per step (button click, hold-repeat, or arrow key).
   * Supports decimals — rounding is decimal-precision-safe (no float drift).
   * @default 1
   */
  step?: number;

  /** Autocomplete attribute passed to the native input */
  autocomplete?: string;

  /**
   * Delay in ms before hold-to-repeat starts firing on a pressed stepper button.
   * @default 400
   */
  holdDelay?: number;

  /**
   * Interval in ms between repeated steps once hold-to-repeat has started.
   * @default 80
   */
  holdInterval?: number;
}

/** DanxNumberInput uses the shared form field emit interface */
export type DanxNumberInputEmits = FormFieldEmits;
