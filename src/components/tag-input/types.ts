/**
 * DanxTagInput Type Definitions
 */

import type { FormFieldBaseProps } from "../../shared/form-types";

export interface DanxTagInputProps extends FormFieldBaseProps {
  /**
   * When true, allows duplicate tags to be added.
   * By default, a tag matching an existing tag (exact, case-sensitive) is not added.
   * @default false
   */
  allowDuplicates?: boolean;

  /**
   * Maximum character length for each tag being typed (native input maxlength).
   */
  maxlength?: number;

  /**
   * Optional validation hook run against the trimmed (and transformed, if `transform`
   * is provided) candidate tag before it is committed. Return `false` to reject the
   * tag (it will not be added and the draft text is preserved). Throwing is treated
   * as rejection as well.
   */
  validate?: (tag: string) => boolean;

  /**
   * Optional transform hook applied to the trimmed candidate tag before the
   * duplicate check and `validate` are run. Return the string to use as the tag.
   */
  transform?: (tag: string) => string;
}

export interface DanxTagInputEmits {
  /** Emitted when the native element receives focus */
  (e: "focus", event: FocusEvent): void;

  /** Emitted when the native element loses focus */
  (e: "blur", event: FocusEvent): void;

  /** Emitted when the clear button is clicked (present for FormFieldEmits compatibility) */
  (e: "clear"): void;

  /** Emitted with the tag value when a tag is successfully added */
  (e: "add", tag: string): void;

  /** Emitted with the tag value when a tag is removed */
  (e: "remove", tag: string): void;
}

export interface DanxTagInputSlots {
  /** Content rendered before the tags/native input */
  prefix?(): unknown;

  /** Content rendered after the tags/native input */
  suffix?(): unknown;
}
