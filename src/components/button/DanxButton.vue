<!--
/**
 * DanxButton Component
 *
 * A semantic button component where the type determines both icon and color.
 * No color prop - colors are controlled via CSS tokens.
 *
 * ## Features
 * - Semantic button types (trash, save, edit, etc.) with predefined icons and colors
 * - Five sizes (xxs, xs, sm, md, lg)
 * - Loading state with spinner
 * - CSS token system for complete styling control
 * - Zero external dependencies (inline SVG icons)
 *
 * ## Props
 * | Prop     | Type        | Default | Description                           |
 * |----------|-------------|---------|---------------------------------------|
 * | type     | ButtonType  | -       | Semantic type (determines icon/color) |
 * | size     | ButtonSize  | "md"    | Button size                           |
 * | icon     | Component   | -       | Custom icon component                 |
 * | disabled | boolean     | false   | Disables the button                   |
 * | loading  | boolean     | false   | Shows spinner, prevents clicks        |
 * | tooltip  | string      | -       | Native title attribute                |
 *
 * ## Events
 * | Event | Payload    | Description                              |
 * |-------|------------|------------------------------------------|
 * | click | MouseEvent | Fired when clicked (not if disabled/loading) |
 *
 * ## Slots
 * | Slot    | Description                    |
 * |---------|--------------------------------|
 * | icon    | Override icon rendering        |
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
 * Type tokens (per type):
 * | Token                   | Description        |
 * |-------------------------|--------------------|
 * | --button-{type}-bg      | Background color   |
 * | --button-{type}-bg-hover| Hover background   |
 * | --button-{type}-text    | Text/icon color    |
 *
 * ## Usage Examples
 *
 * Basic button:
 *   <DanxButton type="save">Save</DanxButton>
 *
 * Icon-only button:
 *   <DanxButton type="trash" tooltip="Delete item" />
 *
 * Different sizes:
 *   <DanxButton type="edit" size="xs">Edit</DanxButton>
 *   <DanxButton type="edit" size="lg">Edit</DanxButton>
 *
 * Loading state:
 *   <DanxButton type="save" :loading="isSaving">Save</DanxButton>
 *
 * Custom icon:
 *   <DanxButton type="save" :icon="MyCustomIcon">Save</DanxButton>
 *
 * Custom icon via slot:
 *   <DanxButton type="save">
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
  `danx-button--${props.type}`,
  {
    "danx-button--loading": props.loading,
  },
]);

const isDisabled = computed(() => props.disabled || props.loading);

const iconSvg = computed(() => buttonIcons[props.type]);

function handleClick(event: MouseEvent) {
  emit("click", event);
}

const IconComponent = computed(() => {
  if (props.icon) {
    return props.icon;
  }
  return {
    render: () => h("span", { innerHTML: iconSvg.value }),
  };
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

    <!-- Icon -->
    <span v-else class="danx-button__icon">
      <slot name="icon">
        <component :is="IconComponent" />
      </slot>
    </span>

    <!-- Content -->
    <slot />
  </button>
</template>
