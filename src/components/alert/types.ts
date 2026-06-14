import type { VariantType } from "../../shared/types";

/**
 * DanxAlert Type Definitions
 */

export interface DanxAlertProps {
  /**
   * Visual variant controlling background, text, and border color.
   * Built-in: "danger" (red), "warning" (amber), "success" (green), "info" (blue, default).
   * Drives the color scheme via the shared --dx-variant-* token system.
   * @default "info"
   */
  variant?: VariantType;

  /**
   * Optional bold heading line rendered above the body content.
   */
  title?: string;

  /**
   * When true, renders a close affordance (DanxIcon) that emits `dismiss` on click.
   * @default false
   */
  dismissible?: boolean;
}

export interface DanxAlertEmits {
  /** Emitted when the dismiss affordance is clicked. */
  dismiss: [];
}

export interface DanxAlertSlots {
  /** Body content of the alert (text or markup). */
  default?(): unknown;
  /** Override the leading status icon. */
  icon?(): unknown;
}
