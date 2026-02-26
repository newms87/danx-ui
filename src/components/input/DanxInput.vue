<!--
/**
 * DanxInput - Text input component with label, error, and helper text
 *
 * Handles all text-like HTML input types (text, password, email, url, tel,
 * number, search, date, time, datetime-local). The visual anatomy is:
 * optional prefix slot + native input + optional suffix slot, all inside
 * a bordered container with focus ring.
 *
 * Features:
 * - Three sizes (sm, md, lg) via CSS tokens
 * - Label, error message, and helper text via DanxFieldWrapper
 * - Password type: built-in visibility toggle
 * - Search type: auto magnifying glass prefix, clearable by default
 * - Clearable: X button to clear the value
 * - Character count display with limit indicator
 * - Full accessibility: aria-invalid, aria-required, aria-describedby, label wiring
 * - Prefix and suffix slots for custom content
 *
 * @props
 *   label?: string - Label text above the input
 *   helperText?: string - Helper text below (hidden when error shown)
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the input
 *   readonly?: boolean - Makes the input read-only
 *   required?: boolean - Marks as required (asterisk on label, aria-required)
 *   size?: InputSize - Field size ("sm" | "md" | "lg", default "md")
 *   placeholder?: string - Placeholder text
 *   name?: string - Name attribute
 *   id?: string - HTML id (auto-generated if omitted)
 *   type?: InputType - HTML input type (default "text")
 *   clearable?: boolean - Show clear button when value present
 *   showCharCount?: boolean - Show character count
 *   maxlength?: number - Max character length
 *   min?: number | string - Min value (number/date types)
 *   max?: number | string - Max value (number/date types)
 *   step?: number | string - Step increment (number/date types)
 *   autocomplete?: string - Autocomplete attribute
 *
 * @emits
 *   focus - When input receives focus
 *   blur - When input loses focus
 *   clear - When clear button is clicked
 *
 * @slots
 *   prefix - Content before the native input
 *   suffix - Content after the native input
 *
 * @tokens
 *   --dx-input-bg - Input background
 *   --dx-input-border - Default border color
 *   --dx-input-border-hover - Hover border color
 *   --dx-input-border-focus - Focus border color
 *   --dx-input-border-error - Error border color
 *   --dx-input-text - Text color
 *   --dx-input-placeholder - Placeholder color
 *   --dx-input-border-radius - Corner radius
 *   --dx-input-transition - Transition timing
 *   --dx-input-clear-color - Clear button color
 *   --dx-input-clear-hover - Clear button hover color
 *   --dx-input-disabled-bg - Disabled background
 *   --dx-input-disabled-text - Disabled text color
 *   --dx-input-disabled-opacity - Disabled opacity
 *   --dx-input-{size}-height - Height per size
 *   --dx-input-{size}-font-size - Font size per size
 *   --dx-input-{size}-padding-x - Horizontal padding per size
 *
 * @example
 *   Basic text input:
 *     <DanxInput v-model="name" label="Name" placeholder="Enter your name" />
 *
 *   With error:
 *     <DanxInput v-model="email" label="Email" type="email" error="Invalid email" />
 *
 *   Password with reveal toggle:
 *     <DanxInput v-model="password" label="Password" type="password" />
 *
 *   Search with clear:
 *     <DanxInput v-model="query" type="search" placeholder="Search..." />
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormField } from "../../shared/composables/useFormField";
import { DanxIcon } from "../icon";
import { searchIcon } from "../icon/icons";
import { DanxFieldWrapper } from "../field-wrapper";
import eyeSvg from "danx-icon/src/fontawesome/solid/eye.svg?raw";
import eyeSlashSvg from "danx-icon/src/fontawesome/solid/eye-slash.svg?raw";
import type { DanxInputEmits, DanxInputProps, DanxInputSlots } from "./types";

const props = withDefaults(defineProps<DanxInputProps>(), {
  type: "text",
  size: "md",
});

const emit = defineEmits<DanxInputEmits>();

const model = defineModel<string | number | null>();

defineSlots<DanxInputSlots>();

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);

const isFocused = ref(false);
const isRevealed = ref(false);

/** Effective clearable: true when clearable prop is set or type is search */
const isClearable = computed(() => props.clearable || props.type === "search");

/** Whether clear button should be visible */
const showClear = computed(
  () =>
    isClearable.value &&
    !props.disabled &&
    !props.readonly &&
    model.value != null &&
    model.value !== ""
);

/** Effective input type — password toggles between password and text */
const effectiveType = computed(() => {
  if (props.type === "password" && isRevealed.value) return "text";
  return props.type;
});

/** CSS classes for the bordered container */
const containerClasses = computed(() => {
  const classes: string[] = ["danx-input", `danx-input--${props.size}`];
  if (isFocused.value) classes.push("danx-input--focused");
  if (hasError.value) classes.push("danx-input--error");
  if (props.disabled) classes.push("danx-input--disabled");
  if (props.readonly) classes.push("danx-input--readonly");
  return classes;
});

/** Character count display string */
const charCountText = computed(() => {
  const len = String(model.value ?? "").length;
  return props.maxlength != null ? `${len}/${props.maxlength}` : String(len);
});

/** Whether char count is at the limit */
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
  model.value = props.type === "number" ? null : "";
  emit("clear");
}

function toggleReveal() {
  isRevealed.value = !isRevealed.value;
}
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
      <!-- Prefix slot or auto search icon -->
      <span v-if="$slots.prefix" class="danx-input__prefix">
        <slot name="prefix" />
      </span>
      <span v-else-if="type === 'search'" class="danx-input__prefix">
        <DanxIcon :icon="searchIcon" />
      </span>

      <!-- Native input -->
      <input
        :id="fieldId"
        v-model="model"
        :type="effectiveType"
        class="danx-input__native"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        v-bind="inputAriaAttrs"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Character count -->
      <span
        v-if="showCharCount"
        :class="['danx-input__char-count', { 'danx-input__char-count--limit': isAtCharLimit }]"
      >
        {{ charCountText }}
      </span>

      <!-- Clear button -->
      <button
        v-if="showClear"
        type="button"
        class="danx-input__clear"
        aria-label="Clear"
        @click="handleClear"
      >
        <DanxIcon icon="close" />
      </button>

      <!-- Password reveal toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="danx-input__reveal"
        :aria-label="isRevealed ? 'Hide password' : 'Show password'"
        @click="toggleReveal"
      >
        <DanxIcon :icon="isRevealed ? eyeSlashSvg : eyeSvg" />
      </button>

      <!-- Suffix slot -->
      <span v-if="$slots.suffix" class="danx-input__suffix">
        <slot name="suffix" />
      </span>
    </div>
  </DanxFieldWrapper>
</template>
