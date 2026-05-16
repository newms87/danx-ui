<!--
/**
 * DanxColorPicker Component
 *
 * Themed hex color input with a paired native swatch picker. Two-way bound
 * via `v-model` — emits ONLY when the operator commits a valid hex (blur,
 * Enter, or a swatch drag). Invalid drafts surface as an inline validation
 * message without touching parent state.
 *
 * ## Features
 *
 * - `v-model` carries `#abc` or `#aabbcc`
 * - Native `<input type="color">` swatch sits next to the text input;
 *   every drag emits so the live preview matches the text
 * - Short-form (`#abc`) auto-expands to long-form for the swatch
 * - Focus-gated re-seed — SSE / parent patches landing mid-edit do NOT
 *   clobber the operator's draft
 * - Optional inline `label` to the LEFT of the swatch
 * - Optional `suffix` slot AFTER the text input
 *
 * @props
 *   modelValue: string — Two-way bound hex
 *   label?: string — Optional inline left-side label
 *   disabled?: boolean — Disables both controls
 *   testId?: string — Adds `<prefix>-{container,swatch,input,error}` data-test attrs
 *   placeholder?: string — Text input placeholder (default "#aabbcc")
 *
 * @emits
 *   update:modelValue — Fired ONLY when the operator commits a valid hex
 *
 * @slots
 *   suffix — Content rendered AFTER the swatch + text input
 *
 * @tokens
 *   --dx-color-picker-font-family       Font family for the text input
 *   --dx-color-picker-gap               Gap between swatch, input, and suffix
 *   --dx-color-picker-label-color       Label text color
 *   --dx-color-picker-label-size        Label font size
 *   --dx-color-picker-swatch-size       Swatch button width + height
 *   --dx-color-picker-swatch-radius     Swatch border-radius
 *   --dx-color-picker-swatch-border     Swatch border color
 *   --dx-color-picker-input-bg          Text input background
 *   --dx-color-picker-input-border      Text input border
 *   --dx-color-picker-input-border-error Text input border in error state
 *   --dx-color-picker-input-text        Text input text color
 *   --dx-color-picker-input-radius      Text input border-radius
 *   --dx-color-picker-input-width       Text input width
 *   --dx-color-picker-input-padding-x   Text input horizontal padding
 *   --dx-color-picker-input-padding-y   Text input vertical padding
 *   --dx-color-picker-input-font-size   Text input font size
 *   --dx-color-picker-error-color       Validation message color
 *   --dx-color-picker-error-size        Validation message font size
 *   --dx-color-picker-disabled-opacity  Opacity when disabled
 *
 * @example
 *   <DanxColorPicker v-model="color" label="Color" test-id="lists-color" />
 */
-->

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { DanxColorPickerEmits, DanxColorPickerProps, DanxColorPickerSlots } from "./types";

const props = withDefaults(defineProps<DanxColorPickerProps>(), {
  placeholder: "#aabbcc",
});

const emit = defineEmits<DanxColorPickerEmits>();

defineSlots<DanxColorPickerSlots>();

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHex(v: string): boolean {
  return HEX_RE.test(v);
}

/**
 * Expand `#abc` → `#aabbcc` so the native `<input type="color">` (which
 * only accepts the long form) renders the right swatch even when the
 * operator typed the short form. Falls back to black on unrecognized
 * shape so the swatch stays a valid color; the caller never sees this.
 */
function normalizeForSwatch(v: string): string {
  if (!isValidHex(v)) return "#000000";
  if (v.length === 4) {
    return "#" + v.slice(1).split("").map((c) => c + c).join("");
  }
  return v.toLowerCase();
}

const draft = ref<string>(props.modelValue);
const isFocused = ref<boolean>(false);

watch(
  () => props.modelValue,
  (next) => {
    // Only re-seed when the operator isn't actively typing. Without this
    // gate, a v-model patch landing mid-edit (SSE, debounced swatch drag
    // on a sibling row, another browser tab on the same record) would
    // overwrite whatever the operator has half-typed. The blur-commit
    // cycle re-converges state once the operator leaves the input.
    if (!isFocused.value) draft.value = next;
  },
);

const isInvalid = computed<boolean>(() => draft.value.length > 0 && !isValidHex(draft.value));

const swatchValue = computed<string>(() => normalizeForSwatch(draft.value));

const containerClasses = computed<string[]>(() => {
  const classes = ["danx-color-picker"];
  if (props.disabled) classes.push("danx-color-picker--disabled");
  if (isInvalid.value) classes.push("danx-color-picker--error");
  return classes;
});

function onTextInput(e: Event): void {
  draft.value = (e.target as HTMLInputElement).value;
}

function onTextFocus(): void {
  isFocused.value = true;
}

function onTextBlur(): void {
  isFocused.value = false;
  onTextCommit();
}

function onTextCommit(): void {
  if (isValidHex(draft.value) && draft.value !== props.modelValue) {
    emit("update:modelValue", draft.value);
  }
}

function onTextKeydown(e: KeyboardEvent): void {
  if (e.key === "Enter") {
    e.preventDefault();
    onTextCommit();
    (e.target as HTMLInputElement).blur();
  } else if (e.key === "Escape") {
    draft.value = props.modelValue;
    (e.target as HTMLInputElement).blur();
  }
}

function onSwatchInput(e: Event): void {
  const next = (e.target as HTMLInputElement).value;
  draft.value = next;
  // Native picker fires the same `input` event on every drag AND on
  // commit; emit on every change so the parent's draft tracks the
  // live swatch.
  if (next !== props.modelValue) emit("update:modelValue", next);
}
</script>

<template>
  <div :class="containerClasses" :data-test="testId ? `${testId}-container` : undefined">
    <div class="danx-color-picker__row">
      <span v-if="label" class="danx-color-picker__label">{{ label }}</span>
      <input
        type="color"
        class="danx-color-picker__swatch"
        :value="swatchValue"
        :disabled="disabled"
        :aria-label="label ? `${label} — color swatch` : 'Color swatch'"
        :data-test="testId ? `${testId}-swatch` : undefined"
        @input="onSwatchInput"
      />
      <input
        type="text"
        class="danx-color-picker__input"
        :value="draft"
        :disabled="disabled"
        :aria-invalid="isInvalid || undefined"
        :data-test="testId ? `${testId}-input` : undefined"
        :placeholder="placeholder"
        @input="onTextInput"
        @focus="onTextFocus"
        @blur="onTextBlur"
        @keydown="onTextKeydown"
      />
      <span v-if="$slots.suffix" class="danx-color-picker__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p
      v-if="isInvalid"
      class="danx-color-picker__error"
      :data-test="testId ? `${testId}-error` : undefined"
    >
      Must be a hex color like #abc or #aabbcc.
    </p>
  </div>
</template>
