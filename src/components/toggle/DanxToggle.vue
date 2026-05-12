<!--
/**
 * DanxToggle Component
 *
 * An accessible boolean switch with v-model, sized variants, disabled state,
 * optional label slot, and ARIA `role="switch"`. The underlying control is a
 * visually-hidden native `<input type="checkbox">` so form submission and the
 * accessibility tree still work; the styled track + thumb are rendered on top.
 *
 * ## Features
 * - `v-model` boolean via `defineModel<boolean>()`
 * - Three sizes (sm, md, lg) via top-level BEM modifier blocks
 * - Disabled state blocks interaction + dims via CSS token
 * - Variant prop (`danger`, `success`, etc.) wires through shared `useVariant`
 * - Native checkbox preserves form submission + a11y tree
 * - Optional default-slot label is clickable (label-for-input)
 * - Keyboard: Space + Enter toggle (native checkbox semantics)
 * - ARIA: `role="switch"`, `aria-checked`, `aria-disabled` on the focusable
 *   `<input>` (overrides implicit checkbox role); the visual `<span>` track is
 *   `aria-hidden="true"` so screen readers never announce it as a separate control
 *
 * @props
 *   size?: "sm" | "md" | "lg" — Toggle size (default "md")
 *   disabled?: boolean — Locks interaction (default false)
 *   variant?: VariantType — On-state track color via shared variant system (default "")
 *   ariaLabel?: string — Accessible name when no default slot provided
 *
 * @emits
 *   update:modelValue — Emitted via defineModel when the boolean changes
 *
 * @slots
 *   default — Optional label rendered next to the switch. Wrapping in <label>
 *     makes the entire slot clickable.
 *
 * @tokens
 *   --dx-toggle-font-family       Label font family
 *   --dx-toggle-transition        Transition timing
 *   --dx-toggle-track-bg          Off-state track background
 *   --dx-toggle-track-bg-on       On-state track background
 *   --dx-toggle-thumb-bg          Thumb background color
 *   --dx-toggle-thumb-shadow      Thumb drop shadow
 *   --dx-toggle-disabled-opacity  Disabled state opacity
 *   --dx-toggle-focus-ring        Focus-visible outline color
 *   --dx-toggle-{size}-track-w    Track width (sm/md/lg)
 *   --dx-toggle-{size}-track-h    Track height (sm/md/lg)
 *   --dx-toggle-{size}-thumb-size Thumb diameter (sm/md/lg)
 *   --dx-toggle-{size}-thumb-inset Inset between thumb edge and track edge (sm/md/lg)
 *   --dx-toggle-{size}-font-size  Label font size (sm/md/lg)
 *   --dx-toggle-{size}-gap        Gap between toggle and label (sm/md/lg)
 *
 * @example
 *   <DanxToggle v-model="enabled" />
 *   <DanxToggle v-model="enabled" size="lg" />
 *   <DanxToggle v-model="enabled" disabled />
 *   <DanxToggle v-model="enabled">Always on</DanxToggle>
 *   <DanxToggle v-model="enabled" variant="success" />
 */
-->

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import type { DanxToggleProps, DanxToggleSlots } from "./types";

const props = withDefaults(defineProps<DanxToggleProps>(), {
  size: "md",
  disabled: false,
  variant: "",
});

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxToggleSlots>();

const TOGGLE_VARIANT_TOKENS = {
  "--dx-toggle-track-bg-on": "bg",
  "--dx-toggle-thumb-bg": "text",
};

const variantStyle = useVariant(toRef(props, "variant"), "toggle", TOGGLE_VARIANT_TOKENS);

const toggleClasses = computed(() => [
  "danx-toggle",
  `danx-toggle--${props.size}`,
  {
    "danx-toggle--on": modelValue.value,
    "danx-toggle--disabled": props.disabled,
  },
]);
</script>

<template>
  <label :class="toggleClasses">
    <input
      v-model="modelValue"
      type="checkbox"
      class="danx-toggle__input"
      role="switch"
      :disabled="disabled"
      :aria-checked="modelValue"
      :aria-disabled="disabled || undefined"
      :aria-label="ariaLabel"
    />
    <span class="danx-toggle__track" aria-hidden="true" :style="variantStyle">
      <span class="danx-toggle__thumb" />
    </span>
    <slot v-if="$slots.default" />
  </label>
</template>
