/**
 * DanxFieldWrapper Type Definitions
 */

import type { FormFieldBaseProps } from "../../shared/form-types";

export interface DanxFieldWrapperProps extends Pick<
  FormFieldBaseProps,
  "label" | "error" | "helperText" | "required" | "size" | "disabled"
> {
  /** HTML id for the associated input (wires label `for` attribute) */
  fieldId: string;
}

export interface DanxFieldWrapperSlots {
  /** The form control (input, textarea, select, etc.) */
  default(): unknown;
}
