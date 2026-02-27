/**
 * DanxTextarea Type Definitions
 */

import type { FormFieldBaseProps, FormFieldEmits } from "../../shared/form-types";

/** Supported resize behavior for the textarea */
export type TextareaResize = "none" | "vertical" | "both";

export interface DanxTextareaProps extends FormFieldBaseProps {
  /**
   * Number of visible text rows.
   * @default 3
   */
  rows?: number;

  /** Maximum character length (HTML maxlength attribute) */
  maxlength?: number;

  /**
   * Shows a character count inside the textarea container.
   * @default false
   */
  showCharCount?: boolean;

  /**
   * Shows a clear button when the field has a value.
   * @default false
   */
  clearable?: boolean;

  /** Autocomplete attribute */
  autocomplete?: string;

  /**
   * CSS resize behavior for the textarea.
   * Ignored when autoResize is true.
   * @default "vertical"
   */
  resize?: TextareaResize;

  /**
   * Auto-grows the textarea to fit its content.
   * When enabled, rows sets the minimum height and the resize handle is hidden.
   * @default false
   */
  autoResize?: boolean;
}

/** DanxTextarea uses the shared form field emit interface */
export type DanxTextareaEmits = FormFieldEmits;
