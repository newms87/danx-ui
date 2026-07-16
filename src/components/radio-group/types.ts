/**
 * DanxRadioGroup Type Definitions
 */

import type { VariantType } from "../../shared/types";
import type { FormFieldBaseProps } from "../../shared/form-types";

/**
 * Radio group sizes.
 * Affects dot dimensions, font size, and gaps.
 */
export type RadioGroupSize = "sm" | "md" | "lg";

/** Layout direction of the option list. */
export type RadioGroupOrientation = "horizontal" | "vertical";

/** A single selectable option. */
export interface RadioGroupOption {
  /** The value bound to v-model when this option is selected. */
  value: string | number;

  /** Display label rendered next to the radio dot. */
  label: string;

  /** Disables this individual option. */
  disabled?: boolean;
}

export interface DanxRadioGroupProps extends Pick<
  FormFieldBaseProps,
  "label" | "helperText" | "error" | "disabled" | "required" | "id" | "name"
> {
  /** The list of selectable options rendered as radio inputs. */
  options: RadioGroupOption[];

  /**
   * Layout direction of the option list.
   * @default "vertical"
   */
  orientation?: RadioGroupOrientation;

  /**
   * Radio group size affecting dot dimensions and typography.
   * @default "md"
   */
  size?: RadioGroupSize;

  /**
   * Visual variant controlling the checked-state dot color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Blank ("") falls back to the default --color-interactive dot.
   * @default ""
   */
  variant?: VariantType;
}

export interface DanxRadioGroupSlots {
  /**
   * Per-option content, replacing the default label text. Receives the
   * option, its checked state, and its effective disabled state.
   */
  option?(props: { option: RadioGroupOption; checked: boolean; disabled: boolean }): unknown;
}
