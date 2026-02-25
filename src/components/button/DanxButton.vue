<!--
/**
 * DanxButton Component
 *
 * A button component with variant-based color theming and decoupled icons.
 * The `variant` prop controls color via the shared variant token system.
 * Icons are provided via `icon` prop or slot.
 *
 * ## Features
 * - Built-in variants: blank (default), danger, success, warning, info, muted
 * - Custom variants via --dx-variant-{name}-* CSS tokens
 * - Six sizes (xxs, xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Icons via prop (name string, SVG string, or Component) or slot
 * - Text-only buttons when no icon is provided
 * - CSS token system for complete styling control
 * - Zero external dependencies (inline SVG icons)
 *
 * ## Props
 * | Prop    | Type         | Default | Description                       |
 * |---------|--------------|---------|-----------------------------------|
 * | variant | VariantType  | ""      | Visual variant (blank = no bg)    |
 * | size    | ButtonSize   | "md"    | Button size                       |
 * | icon    | Component|string | -   | Icon (name, SVG, or component)    |
 * | disabled| boolean      | false   | Disables the button               |
 * | loading | boolean      | false   | Shows spinner, prevents clicks    |
 * | tooltip | string       | -       | Hover tooltip via DanxTooltip     |
 * | label   | string       | -       | Text label (alternative to slot)  |
 *
 * ## Events
 * | Event | Payload    | Description                              |
 * |-------|------------|------------------------------------------|
 * | click | MouseEvent | Fired when clicked (not if disabled/loading) |
 *
 * ## Slots
 * | Slot    | Description                    |
 * |---------|--------------------------------|
 * | icon    | Override icon rendering         |
 * | default | Button text content            |
 *
 * ## CSS Tokens
 * Override these tokens to customize appearance:
 *
 * Global tokens:
 * | Token                        | Default           | Description       |
 * |------------------------------|-------------------|-------------------|
 * | --dx-button-font-family      | --font-sans       | Font family       |
 * | --dx-button-border-radius    | --radius-button   | Corner radius     |
 * | --dx-button-transition       | --transition-fast | Transition timing |
 * | --dx-button-disabled-opacity | 0.5               | Disabled opacity  |
 *
 * Size tokens (per size: xxs, xs, sm, md, lg, xl):
 * | Token                        | Description        |
 * |------------------------------|--------------------|
 * | --dx-button-{size}-padding-x | Horizontal padding |
 * | --dx-button-{size}-padding-y | Vertical padding   |
 * | --dx-button-{size}-icon-size | Icon dimensions    |
 * | --dx-button-{size}-font-size | Font size          |
 * | --dx-button-{size}-gap       | Icon-text gap      |
 *
 * Note: Each size modifier sets `line-height` to match `--dx-button-{size}-icon-size`.
 * This ensures consistent button height regardless of content. The loading spinner
 * uses `1lh` for its dimensions, so it automatically matches the icon size.
 *
 * Variant colors are provided by the shared variant system. Define custom variants:
 *   :root { --dx-variant-myvariant-bg: purple; --dx-variant-myvariant-text: white; }
 *   <DanxButton variant="myvariant">Custom</DanxButton>
 *
 * ## Usage Examples
 *
 * Blank button (default, no background):
 *   <DanxButton icon="edit">Edit</DanxButton>
 *
 * Colored button with icon by name:
 *   <DanxButton variant="danger" icon="trash">Delete</DanxButton>
 *
 * Text-only button:
 *   <DanxButton variant="success">Save</DanxButton>
 *
 * Icon-only button:
 *   <DanxButton variant="danger" icon="trash" tooltip="Delete item" />
 *
 * Different sizes:
 *   <DanxButton variant="muted" icon="edit" size="xs">Edit</DanxButton>
 *   <DanxButton variant="muted" icon="edit" size="lg">Edit</DanxButton>
 *
 * Loading state:
 *   <DanxButton variant="success" icon="save" :loading="isSaving">Save</DanxButton>
 *
 * Custom icon via slot:
 *   <DanxButton variant="success">
 *     <template #icon><MyIcon /></template>
 *     Save
 *   </DanxButton>
 */
-->

<script setup lang="ts">
import { computed, toRef, useAttrs } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxIcon } from "../icon";
import { DanxTooltip } from "../tooltip";
import type { DanxButtonEmits, DanxButtonProps, DanxButtonSlots } from "./types";

const props = withDefaults(defineProps<DanxButtonProps>(), {
  variant: "",
  size: "md",
  disabled: false,
  loading: false,
});

const emit = defineEmits<DanxButtonEmits>();

defineSlots<DanxButtonSlots>();

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const BUTTON_VARIANT_TOKENS = {
  "--dx-button-bg": "bg",
  "--dx-button-hover-bg": "bg-hover",
  "--dx-button-text": "text",
};

const variantStyle = useVariant(toRef(props, "variant"), "button", BUTTON_VARIANT_TOKENS);

const buttonClasses = computed(() => [
  "danx-button",
  `danx-button--${props.size}`,
  {
    "danx-button--loading": props.loading,
  },
]);

const isDisabled = computed(() => props.disabled || props.loading);

function handleClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<template>
  <DanxTooltip :tooltip="tooltip" :disabled="!tooltip" placement="top">
    <template #trigger>
      <button
        type="button"
        v-bind="attrs"
        :class="buttonClasses"
        :style="variantStyle"
        :disabled="isDisabled"
        @click="handleClick"
      >
        <!-- Loading spinner -->
        <span v-if="loading" class="danx-button__spinner" />

        <!-- Icon (only rendered when icon prop or icon slot is provided) -->
        <span v-if="!loading && ($slots.icon || icon)" class="danx-button__icon">
          <slot name="icon">
            <DanxIcon :icon="icon!" />
          </slot>
        </span>

        <!-- Content -->
        <slot>{{ label }}</slot>
      </button>
    </template>
  </DanxTooltip>
</template>
