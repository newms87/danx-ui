/**
 * DanxInput Type Definitions
 */

import type { FormFieldBaseProps } from "../../shared/form-types";

/** Supported HTML input types */
export type InputType =
  | "text"
  | "password"
  | "email"
  | "url"
  | "tel"
  | "number"
  | "search"
  | "date"
  | "time"
  | "datetime-local";

export interface DanxInputProps extends FormFieldBaseProps {
  /**
   * HTML input type.
   * @default "text"
   */
  type?: InputType;

  /**
   * Shows a clear button when the field has a value.
   * Defaults to true for type="search".
   * @default false
   */
  clearable?: boolean;

  /**
   * Shows a character count below/beside the input.
   * @default false
   */
  showCharCount?: boolean;

  /** Maximum character length (HTML maxlength attribute) */
  maxlength?: number;

  /** Minimum value (for number/date types) */
  min?: number | string;

  /** Maximum value (for number/date types) */
  max?: number | string;

  /** Step increment (for number/date types) */
  step?: number | string;

  /** Autocomplete attribute */
  autocomplete?: string;
}

export interface DanxInputEmits {
  /** Emitted when the native input receives focus */
  (e: "focus", event: FocusEvent): void;

  /** Emitted when the native input loses focus */
  (e: "blur", event: FocusEvent): void;

  /** Emitted when the clear button is clicked */
  (e: "clear"): void;
}

export interface DanxInputSlots {
  /** Content rendered before the native input */
  prefix?(): unknown;

  /** Content rendered after the native input */
  suffix?(): unknown;
}
