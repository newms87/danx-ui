<!--
/**
 * DanxTextarea - Multi-line text input with label, error, and helper text
 *
 * Handles multi-line text entry with auto-resize, clearable, and character
 * count features. Visual anatomy: native textarea inside a bordered container
 * with optional footer for char count and clear button.
 *
 * Features:
 * - Three sizes (sm, md, lg) via CSS tokens
 * - Label, error message, and helper text via DanxFieldWrapper
 * - Auto-resize: grows to fit content, rows sets minimum
 * - Clearable: X button to clear the value
 * - Character count display with limit indicator
 * - Configurable resize behavior (none, vertical, both)
 * - Full accessibility: aria-invalid, aria-required, aria-describedby, label wiring
 *
 * @props
 *   label?: string - Label text above the textarea
 *   helperText?: string - Helper text below (hidden when error shown)
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the textarea
 *   readonly?: boolean - Makes the textarea read-only
 *   required?: boolean - Marks as required (asterisk on label, aria-required)
 *   size?: InputSize - Field size ("sm" | "md" | "lg", default "md")
 *   placeholder?: string - Placeholder text
 *   name?: string - Name attribute
 *   id?: string - HTML id (auto-generated if omitted)
 *   rows?: number - Visible text rows (default 3)
 *   maxlength?: number - Max character length
 *   showCharCount?: boolean - Show character count
 *   clearable?: boolean - Show clear button when value present
 *   autocomplete?: string - Autocomplete attribute
 *   resize?: TextareaResize - Resize behavior (default "vertical")
 *   autoResize?: boolean - Auto-grow to fit content
 *
 * @emits
 *   focus - When textarea receives focus
 *   blur - When textarea loses focus
 *   clear - When clear button is clicked
 *
 * @tokens
 *   --dx-textarea-bg - Textarea background
 *   --dx-textarea-border - Default border color
 *   --dx-textarea-border-hover - Hover border color
 *   --dx-textarea-border-focus - Focus border color
 *   --dx-textarea-border-error - Error border color
 *   --dx-textarea-text - Text color
 *   --dx-textarea-placeholder - Placeholder color
 *   --dx-textarea-border-radius - Corner radius
 *   --dx-textarea-transition - Transition timing
 *   --dx-textarea-clear-color - Clear button color
 *   --dx-textarea-clear-hover - Clear button hover color
 *   --dx-textarea-disabled-bg - Disabled background
 *   --dx-textarea-disabled-text - Disabled text color
 *   --dx-textarea-disabled-opacity - Disabled opacity
 *   --dx-textarea-{size}-font-size - Font size per size
 *   --dx-textarea-{size}-padding - Padding per size
 *
 * @example
 *   Basic textarea:
 *     <DanxTextarea v-model="text" label="Description" placeholder="Enter description..." />
 *
 *   With auto-resize:
 *     <DanxTextarea v-model="text" label="Notes" auto-resize :rows="2" />
 *
 *   With character count:
 *     <DanxTextarea v-model="bio" label="Bio" :maxlength="200" show-char-count />
 */
-->

<script setup lang="ts">
import { computed, nextTick, ref, watchEffect } from "vue";
import { useFormField } from "../../shared/composables/useFormField";
import { useFieldInteraction } from "../../shared/composables/useFieldInteraction";
import { DanxIcon } from "../icon";
import { DanxFieldWrapper } from "../field-wrapper";
import type { DanxTextareaEmits, DanxTextareaProps } from "./types";

const props = withDefaults(defineProps<DanxTextareaProps>(), {
  rows: 3,
  size: "md",
  resize: "vertical",
});

const emit = defineEmits<DanxTextareaEmits>();

const model = defineModel<string | null>();

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const {
  showClear,
  containerClasses,
  charCountText,
  isAtCharLimit,
  handleFocus,
  handleBlur,
  handleClear,
} = useFieldInteraction({
  model,
  props,
  hasError,
  emit,
  bemPrefix: "danx-textarea",
});

/** Whether the footer should render (char count or clear visible) */
const showFooter = computed(() => props.showCharCount || showClear.value);

/** Effective resize CSS value — hidden when autoResize is active */
const resizeStyle = computed(() => (props.autoResize ? "none" : props.resize));

/** Auto-resize: adjust height to fit content */
watchEffect(() => {
  // Track model value to trigger re-computation
  void model.value;

  if (!props.autoResize || !textareaRef.value) return;

  void nextTick(() => {
    const el = textareaRef.value!;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });
});
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
      <!-- Native textarea -->
      <textarea
        :id="fieldId"
        ref="textareaRef"
        v-model="model"
        class="danx-textarea__native"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :rows="rows"
        :autocomplete="autocomplete"
        :style="{ resize: resizeStyle }"
        v-bind="inputAriaAttrs"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Footer: char count + clear -->
      <div v-if="showFooter" class="danx-textarea__footer">
        <span
          v-if="showCharCount"
          :class="[
            'danx-textarea__char-count',
            { 'danx-textarea__char-count--limit': isAtCharLimit },
          ]"
        >
          {{ charCountText }}
        </span>

        <button
          v-if="showClear"
          type="button"
          class="danx-textarea__clear"
          aria-label="Clear"
          @click="handleClear"
        >
          <DanxIcon icon="close" />
        </button>
      </div>
    </div>
  </DanxFieldWrapper>
</template>
