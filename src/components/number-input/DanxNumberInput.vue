<!--
/**
 * DanxNumberInput - Numeric input with visible stepper buttons and clamping
 *
 * Composes the shared field infrastructure (`useFormField`, `DanxFieldWrapper`,
 * `useFieldInteraction`) with explicit increment/decrement buttons, replacing
 * the browser's inconsistent native number spinners.
 *
 * Features:
 * - Visible +/- stepper buttons alongside the native number input
 * - Value clamps to `min`/`max` on step and on blur
 * - Decimal-safe `step` (no float drift, e.g. 0.1 + 0.2 stays 0.3)
 * - Hold-to-repeat on press-and-hold of a stepper button
 * - ArrowUp/ArrowDown keyboard stepping
 * - Disabled/readonly disable the buttons and inert keyboard stepping
 *
 * @props
 *   label?: string - Label text above the input
 *   helperText?: string - Helper text below (hidden when error shown)
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the input and steppers
 *   readonly?: boolean - Makes the input read-only, disables steppers
 *   required?: boolean - Marks as required (asterisk on label, aria-required)
 *   size?: InputSize - Field size ("sm" | "md" | "lg", default "md")
 *   placeholder?: string - Placeholder text
 *   name?: string - Name attribute
 *   id?: string - HTML id (auto-generated if omitted)
 *   min?: number - Minimum allowed value
 *   max?: number - Maximum allowed value
 *   step?: number - Step increment (default 1), supports decimals
 *   autocomplete?: string - Autocomplete attribute
 *   holdDelay?: number - Ms before hold-to-repeat starts (default 400)
 *   holdInterval?: number - Ms between repeated steps once started (default 80)
 *
 * @emits
 *   focus - When input receives focus
 *   blur - When input loses focus
 *
 * @tokens
 *   --dx-number-input-bg - Input background
 *   --dx-number-input-border - Default border color
 *   --dx-number-input-border-hover - Hover border color
 *   --dx-number-input-border-focus - Focus border color
 *   --dx-number-input-border-error - Error border color
 *   --dx-number-input-text - Text color
 *   --dx-number-input-placeholder - Placeholder color
 *   --dx-number-input-border-radius - Corner radius
 *   --dx-number-input-transition - Transition timing
 *   --dx-number-input-stepper-color - Stepper button color
 *   --dx-number-input-stepper-hover - Stepper button hover color
 *   --dx-number-input-disabled-bg - Disabled background
 *   --dx-number-input-disabled-text - Disabled text color
 *   --dx-number-input-disabled-opacity - Disabled opacity
 *   --dx-number-input-{size}-height - Height per size
 *   --dx-number-input-{size}-font-size - Font size per size
 *   --dx-number-input-{size}-padding-x - Horizontal padding per size
 *
 * @example
 *   <DanxNumberInput v-model="qty" label="Quantity" :min="0" :max="10" />
 *   <DanxNumberInput v-model="price" label="Price" :step="0.01" />
 */
-->

<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";
import { useFormField } from "../../shared/composables/useFormField";
import { useFieldInteraction } from "../../shared/composables/useFieldInteraction";
import { DanxFieldWrapper } from "../field-wrapper";
import type { DanxNumberInputEmits, DanxNumberInputProps } from "./types";

const props = withDefaults(defineProps<DanxNumberInputProps>(), {
  size: "md",
  step: 1,
  holdDelay: 400,
  holdInterval: 80,
});

const emit = defineEmits<DanxNumberInputEmits>();

const model = defineModel<number | null>();

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);

const { containerClasses, handleFocus, handleBlur } = useFieldInteraction({
  model,
  props,
  hasError,
  emit,
  bemPrefix: "danx-number-input",
});

/** Number of decimal places in `step` — anchors rounding so float math can't drift. */
function decimalPlaces(value: number): number {
  const str = value.toString();
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

function roundToStepPrecision(value: number): number {
  const decimals = decimalPlaces(props.step);
  return Number(value.toFixed(decimals));
}

function clamp(value: number): number {
  let result = value;
  if (props.min != null) result = Math.max(props.min, result);
  if (props.max != null) result = Math.min(props.max, result);
  return result;
}

/** Two-way binding between the native `<input type="number">` string value and the number|null model. */
const displayValue = computed<string | number>({
  get: () => model.value ?? "",
  set: (value) => {
    model.value = value === "" ? null : Number(value);
  },
});

const isInert = computed(() => !!props.disabled || !!props.readonly);

const isDecrementDisabled = computed(
  () => isInert.value || (props.min != null && model.value != null && model.value <= props.min)
);

const isIncrementDisabled = computed(
  () => isInert.value || (props.max != null && model.value != null && model.value >= props.max)
);

function stepValue(direction: 1 | -1) {
  if (isInert.value) return;
  const base = model.value ?? props.min ?? 0;
  const next = roundToStepPrecision(base + direction * props.step);
  model.value = clamp(next);
}

function onBlur(event: FocusEvent) {
  if (model.value != null) {
    model.value = roundToStepPrecision(clamp(model.value));
  }
  handleBlur(event);
}

function onKeydownArrow(direction: 1 | -1) {
  stepValue(direction);
}

let holdTimeout: ReturnType<typeof setTimeout> | undefined;
let holdInterval: ReturnType<typeof setInterval> | undefined;

function stopRepeat() {
  clearTimeout(holdTimeout);
  clearInterval(holdInterval);
  holdTimeout = undefined;
  holdInterval = undefined;
}

function startRepeat(direction: 1 | -1) {
  stepValue(direction);
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => stepValue(direction), props.holdInterval);
  }, props.holdDelay);
}

onBeforeUnmount(stopRepeat);
</script>

<template>
  <DanxFieldWrapper
    :label="label"
    :error="error"
    :helper-text="helperText"
    :field-id="fieldId"
    :required="required"
    :size="size"
    :disabled="disabled"
  >
    <div :class="containerClasses">
      <button
        type="button"
        class="danx-number-input__stepper danx-number-input__stepper--decrement"
        aria-label="Decrement"
        :disabled="isDecrementDisabled"
        @mousedown="startRepeat(-1)"
        @mouseup="stopRepeat"
        @mouseleave="stopRepeat"
      >
        <span aria-hidden="true">&minus;</span>
      </button>

      <input
        :id="fieldId"
        v-model="displayValue"
        type="number"
        class="danx-number-input__native"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        v-bind="inputAriaAttrs"
        @focus="handleFocus"
        @blur="onBlur"
        @keydown.up.prevent="onKeydownArrow(1)"
        @keydown.down.prevent="onKeydownArrow(-1)"
      />

      <button
        type="button"
        class="danx-number-input__stepper danx-number-input__stepper--increment"
        aria-label="Increment"
        :disabled="isIncrementDisabled"
        @mousedown="startRepeat(1)"
        @mouseup="stopRepeat"
        @mouseleave="stopRepeat"
      >
        <span aria-hidden="true">&plus;</span>
      </button>
    </div>
  </DanxFieldWrapper>
</template>
