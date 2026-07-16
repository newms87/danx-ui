/**
 * DanxPopconfirm Type Definitions
 *
 * Types for the inline confirmation popover component.
 */

import type { PopoverPlacement } from "../popover/types";
import type { VariantType } from "../../shared/types";

export interface DanxPopconfirmProps {
  /**
   * Controls popover visibility via v-model.
   * Optional — the trigger slot toggles this internally on click,
   * but it can also be driven externally (e.g. to open programmatically).
   */
  modelValue?: boolean;

  /** Title shown above the message. Omitted when not provided. */
  title?: string;

  /** Confirmation message/body text. Omitted when not provided. */
  message?: string;

  /**
   * Text for the confirm button.
   * @default "Confirm"
   */
  confirmText?: string;

  /**
   * Text for the cancel button.
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Visual variant for the confirm button.
   * @default "danger"
   */
  confirmVariant?: VariantType;

  /**
   * Visual variant for the cancel button.
   * @default ""
   */
  cancelVariant?: VariantType;

  /** Placement of the panel relative to the trigger. @default "bottom" */
  placement?: PopoverPlacement;

  /**
   * Called when the confirm button is clicked. Behaves like an emitted
   * "confirm" event — bind it the same way with `@confirm="handler"`.
   *
   * When the handler returns a promise, the confirm button shows a loading
   * spinner and the panel stays open until the promise settles. On success
   * the panel closes; on rejection the panel stays open (and the error
   * propagates) so the user can retry.
   */
  onConfirm?: () => unknown;

  /**
   * Called when the cancel button is clicked, or the panel is dismissed via
   * Escape or an outside click. Behaves like an emitted "cancel" event —
   * bind it the same way with `@cancel="handler"`.
   */
  onCancel?: () => void;
}

export interface DanxPopconfirmSlots {
  /** Trigger element that the confirm panel anchors to */
  trigger(): unknown;
}
