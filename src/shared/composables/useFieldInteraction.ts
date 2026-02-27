/**
 * useFieldInteraction - Shared interaction logic for form field components
 *
 * Encapsulates the common reactive state and event handlers used by all
 * bordered form field components (DanxInput, DanxTextarea, future DanxSelect).
 * Handles focus tracking, clear button visibility, container CSS classes,
 * and character count display.
 *
 * @param options - Configuration for the field interaction
 * @returns Reactive state, computed values, and event handlers
 *
 * @example
 *   const { isFocused, showClear, containerClasses, handleFocus, handleBlur, handleClear } =
 *     useFieldInteraction({ model, props, hasError, emit, bemPrefix: "danx-input" });
 */

import { computed, type ComputedRef, type Ref, ref } from "vue";
import type { InputSize } from "../form-types";

export interface FieldInteractionProps {
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  showCharCount?: boolean;
  maxlength?: number;
  size?: InputSize;
}

export interface FieldInteractionOptions {
  /** The v-model ref for the field */
  model: Ref<string | number | null | undefined>;

  /** Reactive props from defineProps */
  props: FieldInteractionProps;

  /** Whether the field is in error state (from useFormField) */
  hasError: ComputedRef<boolean>;

  /** Emit function from defineEmits */
  emit: {
    (e: "focus", event: FocusEvent): void;
    (e: "blur", event: FocusEvent): void;
    (e: "clear"): void;
  };

  /** BEM block name for CSS classes (e.g. "danx-input", "danx-textarea") */
  bemPrefix: string;

  /**
   * Whether the field is effectively clearable.
   * For DanxInput this accounts for search type auto-clearable.
   * Defaults to `props.clearable`.
   */
  isClearable?: ComputedRef<boolean>;

  /**
   * Getter that returns the value to set when cleared.
   * Defaults to empty string. DanxInput returns null for number types.
   */
  getClearValue?: () => string | number | null;
}

export interface UseFieldInteractionReturn {
  /** Whether the field is currently focused */
  isFocused: Ref<boolean>;

  /** Whether the clear button should be visible */
  showClear: ComputedRef<boolean>;

  /** CSS classes for the bordered container */
  containerClasses: ComputedRef<string[]>;

  /** Character count display string (e.g. "5" or "5/20") */
  charCountText: ComputedRef<string>;

  /** Whether the character count is at or over the maxlength limit */
  isAtCharLimit: ComputedRef<boolean>;

  /** Focus event handler for the native element */
  handleFocus: (event: FocusEvent) => void;

  /** Blur event handler for the native element */
  handleBlur: (event: FocusEvent) => void;

  /** Clear button click handler */
  handleClear: () => void;
}

export function useFieldInteraction(options: FieldInteractionOptions): UseFieldInteractionReturn {
  const { model, props, hasError, emit, bemPrefix } = options;

  const isFocused = ref(false);

  const effectiveClearable = options.isClearable ?? computed(() => !!props.clearable);

  const showClear = computed(
    () =>
      effectiveClearable.value &&
      !props.disabled &&
      !props.readonly &&
      model.value != null &&
      model.value !== ""
  );

  const containerClasses = computed(() => {
    const classes: string[] = [bemPrefix, `${bemPrefix}--${props.size || "md"}`];
    if (isFocused.value) classes.push(`${bemPrefix}--focused`);
    if (hasError.value) classes.push(`${bemPrefix}--error`);
    if (props.disabled) classes.push(`${bemPrefix}--disabled`);
    if (props.readonly) classes.push(`${bemPrefix}--readonly`);
    return classes;
  });

  const charCountText = computed(() => {
    const len = String(model.value ?? "").length;
    return props.maxlength != null ? `${len}/${props.maxlength}` : String(len);
  });

  const isAtCharLimit = computed(
    () => props.maxlength != null && String(model.value ?? "").length >= props.maxlength
  );

  function handleFocus(event: FocusEvent) {
    isFocused.value = true;
    emit("focus", event);
  }

  function handleBlur(event: FocusEvent) {
    isFocused.value = false;
    emit("blur", event);
  }

  function handleClear() {
    model.value = options.getClearValue ? options.getClearValue() : "";
    emit("clear");
  }

  return {
    isFocused,
    showClear,
    containerClasses,
    charCountText,
    isAtCharLimit,
    handleFocus,
    handleBlur,
    handleClear,
  };
}
