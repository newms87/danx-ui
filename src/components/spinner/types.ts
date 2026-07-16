import type { VariantType } from "../../shared/types";

/**
 * DanxSpinner Type Definitions
 */

/**
 * Spinner sizes.
 * Affects diameter and border thickness.
 */
export type SpinnerSize = "sm" | "md" | "lg";

export interface DanxSpinnerProps {
  /**
   * Spinner size affecting diameter and border thickness.
   * @default "md"
   */
  size?: SpinnerSize;

  /**
   * Visual variant controlling the spinner color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * When omitted, the spinner inherits `currentColor` from its parent.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Accessible name announced by screen readers while the spinner is visible.
   * @default "Loading"
   */
  ariaLabel?: string;
}
