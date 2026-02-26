/**
 * useFormField - Shared reactive logic for all form field components
 *
 * Derives computed state (error, disabled, classes, aria attributes) from
 * FormFieldBaseProps. Every form component calls this once to get consistent
 * behavior without duplicating logic.
 *
 * @param props - Reactive FormFieldBaseProps (from defineProps or toRefs)
 * @returns Computed field state, classes, and accessibility attributes
 *
 * @example
 *   const props = defineProps<FormFieldBaseProps>();
 *   const { fieldId, fieldState, hasError, errorMessage, fieldClasses, inputAriaAttrs } =
 *     useFormField(props);
 */

import { computed, type ComputedRef } from "vue";
import type { FormFieldBaseProps, FormFieldState, InputSize } from "../form-types";

let fieldIdCounter = 0;

export interface UseFormFieldReturn {
  /** Unique id for the native input element (for label `for` wiring) */
  fieldId: ComputedRef<string>;

  /** Current visual state of the field */
  fieldState: ComputedRef<FormFieldState>;

  /** Whether the field is in error state */
  hasError: ComputedRef<boolean>;

  /** Error message string (empty when error is boolean true or absent) */
  errorMessage: ComputedRef<string>;

  /** CSS classes for the field wrapper based on current state */
  fieldClasses: ComputedRef<string[]>;

  /** ARIA attributes to spread onto the native input element */
  inputAriaAttrs: ComputedRef<Record<string, string | undefined>>;
}

export function useFormField(props: FormFieldBaseProps): UseFormFieldReturn {
  const autoId = `danx-field-${++fieldIdCounter}`;

  const fieldId = computed(() => props.id || autoId);

  const hasError = computed(() => !!props.error);

  const errorMessage = computed(() => (typeof props.error === "string" ? props.error : ""));

  const fieldState = computed<FormFieldState>(() => (hasError.value ? "error" : "default"));

  const fieldClasses = computed(() => {
    const classes: string[] = [];
    const size: InputSize = props.size || "md";
    classes.push(`danx-field--${size}`);
    if (hasError.value) classes.push("danx-field--error");
    if (props.disabled) classes.push("danx-field--disabled");
    if (props.readonly) classes.push("danx-field--readonly");
    return classes;
  });

  const messageId = computed(() => `${fieldId.value}-message`);

  const inputAriaAttrs = computed(() => {
    const attrs: Record<string, string | undefined> = {};
    if (hasError.value) attrs["aria-invalid"] = "true";
    if (props.required) attrs["aria-required"] = "true";
    // Point to message element only when it will actually render in the DOM.
    // Error string → error message renders. Helper text without error → helper renders.
    // Boolean error (true) hides helper and has no message text, so no element exists.
    const hasVisibleMessage = errorMessage.value || (props.helperText && !hasError.value);
    if (hasVisibleMessage) {
      attrs["aria-describedby"] = messageId.value;
    }
    return attrs;
  });

  return {
    fieldId,
    fieldState,
    hasError,
    errorMessage,
    fieldClasses,
    inputAriaAttrs,
  };
}
