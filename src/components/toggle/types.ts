import type { VariantType } from "../../shared/types";

/**
 * DanxToggle Type Definitions
 */

/**
 * Toggle sizes.
 * Affects track dimensions, thumb size, and gap between toggle and label.
 */
export type ToggleSize = "sm" | "md" | "lg";

export interface DanxToggleProps {
  /**
   * Toggle size affecting track and thumb dimensions.
   * @default "md"
   */
  size?: ToggleSize;

  /**
   * Locks interaction. Visual dim is applied via the disabled token.
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant controlling the on-state track color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Blank ("") falls back to the default --color-interactive track.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Accessible label for the underlying checkbox.
   *
   * REQUIRED whenever no default slot is provided — without either, the
   * toggle has no accessible name and screen readers will announce only
   * the role. With a default slot, the label-for-input semantics on the
   * wrapping `<label>` provide the name, and this prop is optional
   * (typically used to override the slot text for AT consumers).
   */
  ariaLabel?: string;
}

export interface DanxToggleSlots {
  /** Optional label rendered next to the switch. Clicking the label toggles. */
  default?(): unknown;
}
