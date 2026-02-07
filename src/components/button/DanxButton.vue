<!--
/**
 * DanxButton Component
 *
 * A button component with semantic color types and decoupled icons.
 * The `type` prop controls color only. Icons are provided via `icon` prop or slot.
 *
 * ## Features
 * - Six color types: blank (default), danger, success, warning, info, muted
 * - Five sizes (xxs, xs, sm, md, lg)
 * - Loading state with spinner
 * - Icons via prop (name string, SVG string, or Component) or slot
 * - Text-only buttons when no icon is provided
 * - CSS token system for complete styling control
 * - Zero external dependencies (inline SVG icons)
 *
 * ## Props
 * | Prop     | Type        | Default  | Description                           |
 * |----------|-------------|----------|---------------------------------------|
 * | type     | ButtonType  | ""       | Semantic color type (blank = no bg)   |
 * | size     | ButtonSize  | "md"     | Button size                           |
 * | icon     | Component | string | - | Icon (name, SVG string, or component) |
 * | disabled | boolean     | false    | Disables the button                   |
 * | loading  | boolean     | false    | Shows spinner, prevents clicks        |
 * | tooltip  | string      | -        | Native title attribute                |
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
 * | Token                     | Default           | Description          |
 * |---------------------------|-------------------|----------------------|
 * | --button-font-family      | --font-sans       | Font family          |
 * | --button-border-radius    | --radius-button   | Corner radius        |
 * | --button-transition       | --transition-fast | Transition timing    |
 * | --button-disabled-opacity | 0.5               | Disabled opacity     |
 *
 * Size tokens (per size: xxs, xs, sm, md, lg):
 * | Token                     | Description       |
 * |---------------------------|-------------------|
 * | --button-{size}-padding-x | Horizontal padding|
 * | --button-{size}-padding-y | Vertical padding  |
 * | --button-{size}-icon-size | Icon dimensions   |
 * | --button-{size}-font-size | Font size         |
 * | --button-{size}-gap       | Icon-text gap     |
 *
 * Type tokens (danger, success, warning, info, muted; blank has no tokens):
 * | Token                   | Description        |
 * |-------------------------|--------------------|
 * | --button-{type}-bg      | Background color   |
 * | --button-{type}-bg-hover| Hover background   |
 * | --button-{type}-text    | Text/icon color    |
 *
 * ## Usage Examples
 *
 * Blank button (default, no background):
 *   <DanxButton icon="edit">Edit</DanxButton>
 *
 * Colored button with icon by name:
 *   <DanxButton type="danger" icon="trash">Delete</DanxButton>
 *
 * Text-only button:
 *   <DanxButton type="success">Save</DanxButton>
 *
 * Icon-only button:
 *   <DanxButton type="danger" icon="trash" tooltip="Delete item" />
 *
 * Different sizes:
 *   <DanxButton type="muted" icon="edit" size="xs">Edit</DanxButton>
 *   <DanxButton type="muted" icon="edit" size="lg">Edit</DanxButton>
 *
 * Loading state:
 *   <DanxButton type="success" icon="save" :loading="isSaving">Save</DanxButton>
 *
 * Custom icon via slot:
 *   <DanxButton type="success">
 *     <template #icon><MyIcon /></template>
 *     Save
 *   </DanxButton>
 */
-->

<script setup lang="ts">
import { computed, h } from "vue";
import { buttonIcons } from "./icons";
import type { DanxButtonProps } from "./types";

const props = withDefaults(defineProps<DanxButtonProps>(), {
  type: "",
  size: "md",
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const buttonClasses = computed(() => [
  "danx-button",
  `danx-button--${props.size}`,
  props.type ? `danx-button--${props.type}` : null,
  {
    "danx-button--loading": props.loading,
  },
]);

const isDisabled = computed(() => props.disabled || props.loading);

function handleClick(event: MouseEvent) {
  emit("click", event);
}

const iconSvg = computed(() => {
  if (!props.icon || typeof props.icon !== "string") return null;
  return buttonIcons[props.icon] ?? props.icon;
});

const IconComponent = computed(() => {
  if (!props.icon) return null;
  if (typeof props.icon === "string") {
    return { render: () => h("span", { innerHTML: iconSvg.value }) };
  }
  return props.icon;
});
</script>

<template>
  <button
    type="button"
    :class="buttonClasses"
    :disabled="isDisabled"
    :title="tooltip"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="danx-button__spinner" />

    <!-- Icon (only rendered when icon prop or icon slot is provided) -->
    <span v-if="!loading && ($slots.icon || icon)" class="danx-button__icon">
      <slot name="icon">
        <component :is="IconComponent" />
      </slot>
    </span>

    <!-- Content -->
    <slot />
  </button>
</template>
