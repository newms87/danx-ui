/**
 * Shared Form Type Definitions
 *
 * Common types used across all form field components (DanxInput,
 * DanxTextarea, DanxSelect, etc.). Every form component accepts these
 * base props to provide consistent label, error, and helper text behavior.
 */

/** Input size controlling height, font-size, and padding */
export type InputSize = "sm" | "md" | "lg";

/** Visual state of a form field */
export type FormFieldState = "default" | "error";

/**
 * Base props shared by every form field component.
 *
 * - `error` as `string` shows error styling AND the message text
 * - `error` as `true` shows error styling without a message (useful when
 *   the consuming app renders its own error messages elsewhere)
 */
export interface FormFieldBaseProps {
  /** Label text rendered above the field */
  label?: string;

  /** Helper text rendered below the field (hidden when error is shown) */
  helperText?: string;

  /**
   * Error state. String shows styling + message, true shows styling only.
   * @default undefined
   */
  error?: string | boolean;

  /** Disables the field */
  disabled?: boolean;

  /** Makes the field read-only */
  readonly?: boolean;

  /** Marks the field as required (adds asterisk to label, sets aria-required) */
  required?: boolean;

  /**
   * Field size affecting height, font-size, and padding.
   * @default "md"
   */
  size?: InputSize;

  /** Placeholder text for the native input */
  placeholder?: string;

  /** Name attribute for the native input */
  name?: string;

  /** HTML id for the native input. Auto-generated if omitted. */
  id?: string;
}

/**
 * Base emits shared by every form field component.
 *
 * All form fields emit focus, blur, and clear events with the same signatures.
 */
export interface FormFieldEmits {
  /** Emitted when the native element receives focus */
  (e: "focus", event: FocusEvent): void;

  /** Emitted when the native element loses focus */
  (e: "blur", event: FocusEvent): void;

  /** Emitted when the clear button is clicked */
  (e: "clear"): void;
}
