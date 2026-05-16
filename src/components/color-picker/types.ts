/**
 * DanxColorPicker Type Definitions
 */

export interface DanxColorPickerProps {
  /** Two-way bound hex color (`#abc` or `#aabbcc`). */
  modelValue: string;
  /** Optional inline label rendered to the LEFT of the swatch. */
  label?: string;
  /** Disables both the swatch and the text input. */
  disabled?: boolean;
  /**
   * Test-id prefix. The container / swatch / input / error each receive
   * `<prefix>-{container,swatch,input,error}` data-test attributes.
   */
  testId?: string;
  /**
   * Placeholder shown in the text input when the value is empty.
   * @default "#aabbcc"
   */
  placeholder?: string;
}

export interface DanxColorPickerEmits {
  /**
   * Fires when the operator commits a valid hex via blur, Enter, or the
   * native swatch picker (every drag event). Invalid drafts do NOT emit.
   */
  (e: "update:modelValue", value: string): void;
}

export interface DanxColorPickerSlots {
  /** Optional content rendered AFTER the swatch + text input (suffix). */
  suffix?(): unknown;
}
