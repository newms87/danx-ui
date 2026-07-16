<!--
/**
 * DanxRadioGroup Component
 *
 * An accessible single-select group of native `<input type="radio">`
 * controls sharing one `name`, wrapped in a `role="radiogroup"` container.
 * Each radio is visually hidden + styled as a dot; the styled dot fills
 * when checked. Supports keyboard roving-focus navigation per the WAI-ARIA
 * radiogroup pattern.
 *
 * ## Features
 * - `v-model` string | number | null via `defineModel()`
 * - Vertical (default) or horizontal orientation
 * - Three sizes (sm, md, lg) via top-level BEM modifier blocks
 * - Disabled at the group level or per-option
 * - Variant prop (`danger`, `success`, etc.) wires through shared `useVariant`
 * - Native radio inputs preserve form submission + a11y tree
 * - `option` scoped slot for fully custom per-option content
 * - Keyboard: ArrowDown/ArrowRight moves to the next enabled option
 *   (wrapping), ArrowUp/ArrowLeft moves to the previous enabled option
 *   (wrapping); the newly selected radio also receives focus
 * - Renders inside `DanxFieldWrapper` when `label`/`error`/`helperText` props
 *   are used, matching the other form field components
 *
 * @props
 *   options: RadioGroupOption[] — The selectable options (required)
 *   orientation?: "horizontal" | "vertical" — Layout direction (default "vertical")
 *   size?: "sm" | "md" | "lg" — Radio group size (default "md")
 *   disabled?: boolean — Disables every option (default false)
 *   variant?: VariantType — Checked-state dot color via shared variant system (default "")
 *   label?: string — Label text rendered above the field (via DanxFieldWrapper)
 *   error?: string | boolean — Error state/message (via DanxFieldWrapper)
 *   helperText?: string — Helper text below the field (via DanxFieldWrapper)
 *   required?: boolean — Marks as required (asterisk on label, aria-required)
 *   id?: string — HTML id (auto-generated if omitted)
 *   name?: string — Shared name attribute for the radio inputs (auto-generated if omitted)
 *
 * @emits
 *   update:modelValue — Emitted via defineModel when the selected value changes
 *
 * @slots
 *   option — Scoped slot receiving { option, checked, disabled }, replacing
 *     the default label text for each option.
 *
 * @tokens
 *   --dx-radio-group-font-family     Label font family
 *   --dx-radio-group-transition      Transition timing
 *   --dx-radio-group-gap             Gap between options
 *   --dx-radio-dot-bg                Off-state dot background
 *   --dx-radio-dot-border            Off-state dot border color
 *   --dx-radio-dot-bg-on             On-state dot fill color
 *   --dx-radio-dot-border-on         On-state dot border color
 *   --dx-radio-disabled-opacity      Disabled state opacity
 *   --dx-radio-focus-ring            Focus-visible outline color
 *   --dx-radio-{size}-dot-size       Dot diameter (sm/md/lg)
 *   --dx-radio-{size}-dot-inner-size Inner filled-dot diameter (sm/md/lg)
 *   --dx-radio-{size}-font-size      Label font size (sm/md/lg)
 *   --dx-radio-{size}-gap            Gap between dot and label (sm/md/lg)
 *
 * @example
 *   <DanxRadioGroup v-model="plan" :options="[
 *     { value: 'free', label: 'Free' },
 *     { value: 'pro', label: 'Pro' },
 *   ]" />
 *   <DanxRadioGroup v-model="plan" :options="options" orientation="horizontal" />
 *   <DanxRadioGroup v-model="plan" :options="options" disabled />
 *   <DanxRadioGroup v-model="plan" :options="options" variant="success" />
 *   <DanxRadioGroup v-model="plan" :options="options" label="Plan" error="Required" />
 */
-->

<script setup lang="ts">
import { computed, toRef, useId } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { useFormField } from "../../shared/composables/useFormField";
import { DanxFieldWrapper } from "../field-wrapper";
import type { DanxRadioGroupProps, DanxRadioGroupSlots, RadioGroupOption } from "./types";

const props = withDefaults(defineProps<DanxRadioGroupProps>(), {
  orientation: "vertical",
  size: "md",
  disabled: false,
  variant: "",
});

const modelValue = defineModel<string | number | null>({ default: null });

defineSlots<DanxRadioGroupSlots>();

const { fieldId } = useFormField(props);

// Vue 3.5's useId() is SSR-hydration-safe, matching the id-generation
// approach used by useFormField for the group's shared radio `name`.
const autoName = useId();
const groupName = computed(() => props.name || autoName);

const RADIO_VARIANT_TOKENS = {
  "--dx-radio-dot-bg-on": "bg",
  "--dx-radio-dot-border-on": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "radio-group", RADIO_VARIANT_TOKENS);

function isOptionDisabled(option: RadioGroupOption): boolean {
  return props.disabled || !!option.disabled;
}

function optionId(index: number): string {
  return `${fieldId.value}-${index}`;
}

function selectOption(option: RadioGroupOption) {
  if (isOptionDisabled(option)) return;
  modelValue.value = option.value;
}

function focusOption(index: number) {
  const el = document.getElementById(optionId(index)) as HTMLInputElement | null;
  el?.focus();
}

/** Finds the next enabled option index, wrapping, in the given direction. */
function nextEnabledIndex(from: number, direction: 1 | -1): number | null {
  const count = props.options.length;
  if (count === 0) return null;

  for (let step = 1; step <= count; step++) {
    const candidate = (((from + direction * step) % count) + count) % count;
    const option = props.options[candidate];
    if (option && !isOptionDisabled(option)) return candidate;
  }
  return null;
}

function handleKeydown(event: KeyboardEvent) {
  const isForward = event.key === "ArrowDown" || event.key === "ArrowRight";
  const isBackward = event.key === "ArrowUp" || event.key === "ArrowLeft";
  if (!isForward && !isBackward) return;

  event.preventDefault();

  const currentIndex = props.options.findIndex((option) => option.value === modelValue.value);
  const from = currentIndex === -1 ? -1 : currentIndex;
  const targetIndex = nextEnabledIndex(from, isForward ? 1 : -1);
  if (targetIndex === null) return;

  // nextEnabledIndex only returns indices for options that exist and are
  // enabled, so this lookup is always defined.
  selectOption(props.options[targetIndex] as RadioGroupOption);
  focusOption(targetIndex);
}

const groupClasses = computed(() => [
  "danx-radio-group",
  `danx-radio-group--${props.orientation}`,
  `danx-radio-group--${props.size}`,
  {
    "danx-radio-group--disabled": props.disabled,
  },
]);

function radioClasses(option: RadioGroupOption) {
  return [
    "danx-radio",
    {
      "danx-radio--on": modelValue.value === option.value,
      "danx-radio--disabled": isOptionDisabled(option),
    },
  ];
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
    <div :class="groupClasses" role="radiogroup" :aria-label="label" @keydown="handleKeydown">
      <label v-for="(option, index) in options" :key="option.value" :class="radioClasses(option)">
        <input
          :id="optionId(index)"
          type="radio"
          class="danx-radio__input"
          :name="groupName"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="isOptionDisabled(option)"
          @change="selectOption(option)"
        />
        <span class="danx-radio__dot" aria-hidden="true" :style="variantStyle">
          <span class="danx-radio__dot-inner" />
        </span>
        <slot
          v-if="$slots.option"
          name="option"
          :option="option"
          :checked="modelValue === option.value"
          :disabled="isOptionDisabled(option)"
        />
        <span v-else class="danx-radio__label">{{ option.label }}</span>
      </label>
    </div>
  </DanxFieldWrapper>
</template>
