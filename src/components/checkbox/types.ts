/**
 * DanxCheckbox Type Definitions
 */

import type { VariantType } from "../../shared/types";
import type { FormFieldBaseProps } from "../../shared/form-types";

/**
 * Checkbox sizes.
 * Affects box dimensions, checkmark size, and gap between box and label.
 */
export type CheckboxSize = "sm" | "md" | "lg";

export interface DanxCheckboxProps extends Pick<
  FormFieldBaseProps,
  "label" | "helperText" | "error" | "disabled" | "readonly" | "required" | "id"
> {
  /**
   * Checkbox size affecting box and checkmark dimensions.
   * @default "md"
   */
  size?: CheckboxSize;

  /**
   * Visual variant controlling the checked-state box color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Blank ("") falls back to the default --color-interactive box.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Indeterminate (mixed) visual state. Set as a DOM property on the native
   * checkbox (no HTML attribute exists for this) via a template ref +
   * watcher. Renders a dash instead of a checkmark and sets
   * aria-checked="mixed".
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Accessible label for the underlying checkbox.
   *
   * REQUIRED whenever no default slot and no `label` prop are provided —
   * without one of the three, the checkbox has no accessible name.
   */
  ariaLabel?: string;
}

export interface DanxCheckboxSlots {
  /** Optional inline label rendered next to the box. Clicking it toggles. */
  default?(): unknown;
}
