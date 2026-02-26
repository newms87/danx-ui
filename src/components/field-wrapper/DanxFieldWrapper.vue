<!--
/**
 * DanxFieldWrapper - Structural wrapper for all form fields
 *
 * Internal component used by DanxInput, DanxTextarea, DanxSelect, etc. to render
 * consistent label, error message, and helper text around the actual input element.
 * Users can also import it directly for building custom form fields.
 *
 * @props
 *   label?: string - Label text rendered above the field
 *   error?: string | boolean - Error state (string shows message, true shows styling only)
 *   helperText?: string - Helper text below the field (hidden when error message is shown)
 *   fieldId: string - HTML id for the associated input (wires label `for`)
 *   required?: boolean - Adds required asterisk to label
 *   size?: InputSize - Field size affecting typography ("sm" | "md" | "lg")
 *   disabled?: boolean - Whether the field is disabled
 *
 * @slots
 *   default - The form control (input, textarea, select, etc.)
 *
 * @tokens
 *   --dx-field-wrapper-label-color - Label text color
 *   --dx-field-wrapper-label-font-size - Label font size
 *   --dx-field-wrapper-label-font-weight - Label font weight
 *   --dx-field-wrapper-label-gap - Gap between label and field
 *   --dx-field-wrapper-message-font-size - Message font size
 *   --dx-field-wrapper-required-color - Required asterisk color
 *
 * @example
 *   <DanxFieldWrapper label="Email" :fieldId="id" error="Required">
 *     <input :id="id" type="email" />
 *   </DanxFieldWrapper>
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import type { DanxFieldWrapperProps, DanxFieldWrapperSlots } from "./types";

const props = withDefaults(defineProps<DanxFieldWrapperProps>(), {
  size: "md",
});

defineSlots<DanxFieldWrapperSlots>();

const hasError = computed(() => !!props.error);
const errorMessage = computed(() => (typeof props.error === "string" ? props.error : ""));
</script>

<template>
  <div class="danx-field-wrapper">
    <label v-if="label" :for="fieldId" class="danx-field-wrapper__label">
      {{ label }}
      <span v-if="required" class="danx-field-wrapper__required" aria-hidden="true">*</span>
    </label>

    <slot />

    <p
      v-if="errorMessage"
      :id="`${fieldId}-message`"
      class="danx-field-wrapper__message danx-field-wrapper__message--error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="helperText && !hasError"
      :id="`${fieldId}-message`"
      class="danx-field-wrapper__message danx-field-wrapper__message--helper"
    >
      {{ helperText }}
    </p>
  </div>
</template>
