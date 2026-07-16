<!--
/**
 * DanxTagInput - Chip-entry multi-value form field
 *
 * Renders an array of string tags as removable DanxChip pills inline with an
 * editable native text input. Commits the current draft text as a new tag on
 * Enter or comma, removes the last tag on Backspace when the draft is empty,
 * and removes any tag via its chip's remove control.
 *
 * Features:
 * - v-model bound to a string[] of tags
 * - Commit on Enter or comma (typed or keydown)
 * - Backspace removes the last tag when the draft input is empty
 * - Duplicate prevention (default on), opt out via `allowDuplicates`
 * - Optional `validate` and `transform` hooks applied before commit
 * - Full DanxFieldWrapper integration (label/error/required/helperText)
 *
 * @props
 *   label?: string - Label text above the field
 *   helperText?: string - Helper text below (hidden when error shown)
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the field
 *   readonly?: boolean - Makes the field read-only
 *   required?: boolean - Marks as required (asterisk on label, aria-required)
 *   size?: InputSize - Field size ("sm" | "md" | "lg", default "md")
 *   placeholder?: string - Placeholder text for the draft input
 *   name?: string - Name attribute
 *   id?: string - HTML id (auto-generated if omitted)
 *   maxlength?: number - Max character length for the draft input
 *   allowDuplicates?: boolean - Allow duplicate tag values (default false)
 *   validate?: (tag: string) => boolean - Reject a candidate tag (return false or throw)
 *   transform?: (tag: string) => string - Transform a candidate tag before commit
 *
 * @emits
 *   focus - When the draft input receives focus
 *   blur - When the draft input loses focus
 *   clear - Not emitted by this component (present for FormFieldEmits compatibility)
 *   add - When a tag is successfully committed
 *   remove - When a tag is removed
 *
 * @slots
 *   prefix - Content before the tags/native input
 *   suffix - Content after the tags/native input
 *
 * @tokens
 *   --dx-tag-input-bg - Container background
 *   --dx-tag-input-border - Default border color
 *   --dx-tag-input-border-hover - Hover border color
 *   --dx-tag-input-border-focus - Focus border color
 *   --dx-tag-input-border-error - Error border color
 *   --dx-tag-input-text - Draft input text color
 *   --dx-tag-input-placeholder - Placeholder color
 *   --dx-tag-input-border-radius - Corner radius
 *   --dx-tag-input-transition - Transition timing
 *   --dx-tag-input-gap - Gap between chips/input
 *   --dx-tag-input-disabled-bg - Disabled background
 *   --dx-tag-input-disabled-text - Disabled text color
 *   --dx-tag-input-disabled-opacity - Disabled opacity
 *   --dx-tag-input-{size}-min-height - Min height per size
 *   --dx-tag-input-{size}-font-size - Font size per size
 *   --dx-tag-input-{size}-padding-x - Horizontal padding per size
 *   --dx-tag-input-{size}-padding-y - Vertical padding per size
 *
 * @example
 *   Basic:
 *     <DanxTagInput v-model="tags" label="Tags" placeholder="Add a tag..." />
 *
 *   With validation:
 *     <DanxTagInput v-model="emails" label="Emails" :validate="(t) => /@/.test(t)" />
 *
 *   With transform (lowercase all tags):
 *     <DanxTagInput v-model="tags" :transform="(t) => t.toLowerCase()" />
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormField } from "../../shared/composables/useFormField";
import { DanxChip } from "../chip";
import { DanxFieldWrapper } from "../field-wrapper";
import type { DanxTagInputEmits, DanxTagInputProps, DanxTagInputSlots } from "./types";

const props = withDefaults(defineProps<DanxTagInputProps>(), {
  size: "md",
  allowDuplicates: false,
});

const emit = defineEmits<DanxTagInputEmits>();

const model = defineModel<string[]>({ default: () => [] });

defineSlots<DanxTagInputSlots>();

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);

const draft = ref("");
const isFocused = ref(false);

const containerClasses = computed(() => {
  const classes: string[] = ["danx-tag-input", `danx-tag-input--${props.size}`];
  if (isFocused.value) classes.push("danx-tag-input--focused");
  if (hasError.value) classes.push("danx-tag-input--error");
  if (props.disabled) classes.push("danx-tag-input--disabled");
  if (props.readonly) classes.push("danx-tag-input--readonly");
  return classes;
});

/**
 * Attempts to commit the current draft text as a new tag.
 * Applies transform (if provided), then validates non-empty, duplicate,
 * and the validate hook (if provided) in that order. Clears the draft
 * only when the tag is actually committed.
 */
function commitDraft() {
  if (props.disabled || props.readonly) return;

  const trimmed = draft.value.trim();
  if (!trimmed) {
    draft.value = "";
    return;
  }

  const candidate = props.transform ? props.transform(trimmed) : trimmed;

  if (!candidate.trim()) return;

  if (!props.allowDuplicates && model.value.includes(candidate)) return;

  if (props.validate) {
    let isValid: boolean;
    try {
      isValid = props.validate(candidate);
    } catch {
      isValid = false;
    }
    if (!isValid) return;
  }

  model.value = [...model.value, candidate];
  emit("add", candidate);
  draft.value = "";
}

function removeTag(index: number) {
  if (props.disabled || props.readonly) return;

  // Callers only ever pass an index within the current model bounds
  // (chip v-for index or model.value.length - 1 for Backspace).
  const tag = model.value[index]!;
  model.value = model.value.filter((_, i) => i !== index);
  emit("remove", tag);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    commitDraft();
    return;
  }

  if (event.key === "Backspace" && draft.value === "" && model.value.length > 0) {
    removeTag(model.value.length - 1);
  }
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true;
  emit("focus", event);
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false;
  emit("blur", event);
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
      <!-- Prefix slot -->
      <span v-if="$slots.prefix" class="danx-tag-input__prefix">
        <slot name="prefix" />
      </span>

      <!-- Tags -->
      <DanxChip
        v-for="(tag, index) in model"
        :key="`${tag}-${index}`"
        removable
        :label="tag"
        size="sm"
        class="danx-tag-input__chip"
        @remove="removeTag(index)"
      />

      <!-- Draft input -->
      <input
        :id="fieldId"
        v-model="draft"
        type="text"
        class="danx-tag-input__native"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        :readonly="readonly"
        :required="required && model.length === 0"
        :maxlength="maxlength"
        v-bind="inputAriaAttrs"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Suffix slot -->
      <span v-if="$slots.suffix" class="danx-tag-input__suffix">
        <slot name="suffix" />
      </span>
    </div>
  </DanxFieldWrapper>
</template>
