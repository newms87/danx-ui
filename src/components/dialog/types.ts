import type { SizeValue } from "../../shared/types";

/**
 * DanxDialog Type Definitions
 */

export interface DanxDialogProps {
  /**
   * Controls dialog visibility via v-model.
   * When true, dialog is rendered and shown.
   * When false, dialog is removed from DOM.
   */
  modelValue?: boolean;

  /**
   * Dialog title displayed in header.
   * Can also be customized via `title` slot.
   */
  title?: string;

  /**
   * Dialog subtitle displayed below title.
   * Can also be customized via `subtitle` slot.
   */
  subtitle?: string;

  /**
   * Dialog width.
   * - Number: Converted to viewport width (80 → "80vw")
   * - String: Used as-is ("400px", "30rem")
   */
  width?: SizeValue;

  /**
   * Dialog height.
   * - Number: Converted to viewport height (60 → "60vh")
   * - String: Used as-is ("400px", "30rem")
   */
  height?: SizeValue;

  /**
   * When true, prevents closing via ESC key or backdrop click.
   * Close button (if enabled) still works.
   */
  persistent?: boolean;

  /**
   * Shows an X close button in the top-right corner of the header.
   */
  closeX?: boolean;

  /**
   * Shows a close button in the footer.
   * - true: Shows button with text "Close"
   * - string: Shows button with custom text
   */
  closeButton?: boolean | string;

  /**
   * Shows a confirm button in the footer.
   * - true: Shows button with text "Confirm"
   * - string: Shows button with custom text
   */
  confirmButton?: boolean | string;

  /**
   * When true, shows loading spinner on confirm button and disables it.
   */
  isSaving?: boolean;

  /**
   * When true, disables the confirm button.
   */
  disabled?: boolean;

  /**
   * When true, this dialog opts out of the navigation stack entirely.
   * It renders as a normal standalone dialog even when other dialogs are open.
   * Dialogs without a title are automatically treated as independent.
   */
  independent?: boolean;

  /**
   * Controls close behavior when this dialog is part of a stack.
   * - true (default): Closing this dialog reveals the previous dialog in the stack.
   * - false: Closing this dialog tears down the entire stack.
   */
  returnOnClose?: boolean;
}

export interface DanxDialogEmits {
  /** Emitted when dialog is closed via internal trigger (ESC, backdrop, close button) */
  (e: "close"): void;

  /** Emitted when confirm button is clicked */
  (e: "confirm"): void;
}

export interface DanxDialogSlots {
  /** Main content area */
  default?(): unknown;

  /** Custom title content (replaces title prop) */
  title?(): unknown;

  /** Custom subtitle content (replaces subtitle prop) */
  subtitle?(): unknown;

  /** Replace entire footer/actions area */
  actions?(): unknown;

  /** Replace close button only */
  "close-button"?(): unknown;

  /** Replace confirm button only */
  "confirm-button"?(): unknown;
}
