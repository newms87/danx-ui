<!--
/**
 * DanxCheckbox Component
 *
 * An accessible boolean checkbox with v-model, sized variants, disabled
 * state, indeterminate (mixed) state, and an optional clickable label. The
 * underlying control is a visually-hidden native `<input type="checkbox">`
 * so form submission and the accessibility tree still work; a styled square
 * box with a checkmark (or dash, when indeterminate) is rendered on top.
 *
 * ## Features
 * - `v-model` boolean via `defineModel<boolean>()`
 * - Three sizes (sm, md, lg) via top-level BEM modifier blocks
 * - Disabled state blocks interaction + dims via CSS token
 * - Variant prop (`danger`, `success`, etc.) wires through shared `useVariant`
 * - Indeterminate (mixed) state set as a DOM property via template ref
 * - Native checkbox preserves form submission + a11y tree
 * - Optional default-slot label is clickable (label-for-input)
 * - Renders inside `DanxFieldWrapper` when `label`/`error`/`helperText` props
 *   are used, matching the other form field components
 * - Keyboard: Space toggles (native checkbox semantics)
 * - ARIA: `aria-checked` mirrors the boolean (or "mixed" when indeterminate),
 *   `aria-disabled` on the focusable `<input>`; the visual `<span>` box is
 *   `aria-hidden="true"` so screen readers never announce it as a separate
 *   control
 *
 * @props
 *   size?: "sm" | "md" | "lg" — Checkbox size (default "md")
 *   disabled?: boolean — Locks interaction (default false)
 *   readonly?: boolean — Prevents changes while still focusable (default false)
 *   variant?: VariantType — Checked-state box color via shared variant system (default "")
 *   indeterminate?: boolean — Mixed visual state (default false)
 *   ariaLabel?: string — Accessible name when no default slot/label is provided
 *   label?: string — Label text rendered above the field (via DanxFieldWrapper)
 *   error?: string | boolean — Error state/message (via DanxFieldWrapper)
 *   helperText?: string — Helper text below the field (via DanxFieldWrapper)
 *   required?: boolean — Marks as required (asterisk on label, aria-required)
 *   id?: string — HTML id (auto-generated if omitted)
 *
 * @emits
 *   update:modelValue — Emitted via defineModel when the boolean changes
 *
 * @slots
 *   default — Optional inline label rendered next to the box. Wrapping in
 *     <label> makes the entire slot clickable. Mutually usable alongside the
 *     `label` prop (which renders above via DanxFieldWrapper).
 *
 * @tokens
 *   --dx-checkbox-font-family       Label font family
 *   --dx-checkbox-transition        Transition timing
 *   --dx-checkbox-box-bg            Off-state box background
 *   --dx-checkbox-box-bg-on         On-state box background
 *   --dx-checkbox-box-border        Off-state box border color
 *   --dx-checkbox-box-border-on     On-state box border color
 *   --dx-checkbox-check-color       Checkmark/dash color
 *   --dx-checkbox-disabled-opacity  Disabled state opacity
 *   --dx-checkbox-focus-ring        Focus-visible outline color
 *   --dx-checkbox-{size}-box-size   Box width/height (sm/md/lg)
 *   --dx-checkbox-{size}-radius     Box corner radius (sm/md/lg)
 *   --dx-checkbox-{size}-font-size  Label font size (sm/md/lg)
 *   --dx-checkbox-{size}-gap        Gap between box and label (sm/md/lg)
 *
 * @example
 *   <DanxCheckbox v-model="agreed" />
 *   <DanxCheckbox v-model="agreed" size="lg" />
 *   <DanxCheckbox v-model="agreed" disabled />
 *   <DanxCheckbox v-model="agreed">Accept terms</DanxCheckbox>
 *   <DanxCheckbox v-model="agreed" variant="success" />
 *   <DanxCheckbox v-model="selectAll" :indeterminate="isPartial" />
 *   <DanxCheckbox v-model="agreed" label="Terms" error="Required" />
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watchEffect } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { useFormField } from "../../shared/composables/useFormField";
import { DanxFieldWrapper } from "../field-wrapper";
import type { DanxCheckboxProps, DanxCheckboxSlots } from "./types";

const props = withDefaults(defineProps<DanxCheckboxProps>(), {
  size: "md",
  disabled: false,
  readonly: false,
  variant: "",
  indeterminate: false,
});

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxCheckboxSlots>();

const { fieldId } = useFormField(props);

const CHECKBOX_VARIANT_TOKENS = {
  "--dx-checkbox-box-bg-on": "bg",
  "--dx-checkbox-box-border-on": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "checkbox", CHECKBOX_VARIANT_TOKENS);

const inputRef = ref<HTMLInputElement | null>(null);

// No HTML attribute exists for indeterminate — it must be set as a DOM
// property directly on the native element.
watchEffect(() => {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate;
});

const ariaCheckedValue = computed(() =>
  props.indeterminate ? "mixed" : modelValue.value ? "true" : "false"
);

function handleChange(event: Event) {
  if (props.readonly) {
    // Revert the native DOM state — readonly still allows focus but blocks
    // value changes, which the browser does not support natively for checkboxes.
    const target = event.target as HTMLInputElement;
    target.checked = modelValue.value;
    return;
  }
  modelValue.value = (event.target as HTMLInputElement).checked;
}

const checkboxClasses = computed(() => [
  "danx-checkbox",
  `danx-checkbox--${props.size}`,
  {
    "danx-checkbox--on": modelValue.value,
    "danx-checkbox--disabled": props.disabled,
    "danx-checkbox--indeterminate": props.indeterminate,
  },
]);
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
    <label :class="checkboxClasses">
      <input
        :id="fieldId"
        ref="inputRef"
        type="checkbox"
        class="danx-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        :aria-checked="ariaCheckedValue"
        :aria-disabled="disabled || undefined"
        :aria-label="ariaLabel"
        @change="handleChange"
      />
      <span class="danx-checkbox__box" aria-hidden="true" :style="variantStyle">
        <svg v-if="!indeterminate" class="danx-checkbox__check" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8.5L6.5 12L13 4.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-else class="danx-checkbox__dash" />
      </span>
      <slot v-if="$slots.default" />
    </label>
  </DanxFieldWrapper>
</template>
