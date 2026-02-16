<!--
/**
 * DanxIcon Component
 *
 * A standardized icon renderer that resolves built-in icon names, raw SVG
 * strings, and Vue components into a consistently sized flex container.
 * The SVG always fills its container, and the container size is controlled
 * externally via CSS classes or the --dx-icon-size token.
 *
 * ## Features
 * - Resolves named icons from the built-in icon registry (e.g. "trash", "save")
 * - Renders raw SVG strings via innerHTML (preserving currentColor)
 * - Renders Vue components via <component :is>
 * - Consistent inline-flex display with SVG-fills-container sizing
 * - Flex-shrink-0 prevents icon compression in flex layouts
 *
 * ## Props
 * | Prop | Type                         | Description                        |
 * |------|------------------------------|------------------------------------|
 * | icon | Component | IconName | string | Icon name, SVG string, or component |
 *
 * ## CSS Tokens
 * | Token           | Default | Description          |
 * |-----------------|---------|----------------------|
 * | --dx-icon-size  | 1em     | Width and height     |
 *
 * ## Usage Examples
 *
 * By name:
 *   <DanxIcon icon="trash" />
 *
 * By raw SVG string:
 *   <DanxIcon :icon="mySvgString" />
 *
 * By Vue component:
 *   <DanxIcon :icon="MyIconComponent" />
 *
 * Custom size via class:
 *   <DanxIcon icon="edit" class="w-6 h-6" />
 *
 * Custom size via token:
 *   <DanxIcon icon="edit" style="--dx-icon-size: 2rem" />
 */
-->

<script setup lang="ts">
import { computed, h } from "vue";
import type { IconName } from "./icons";
import { iconRegistry } from "./icons";
import type { DanxIconProps } from "./types";

const props = defineProps<DanxIconProps>();

const IconComponent = computed(() => {
  if (typeof props.icon === "string") {
    const svg = iconRegistry[props.icon as IconName] ?? props.icon;
    return { render: () => h("span", { innerHTML: svg }) };
  }
  return props.icon;
});
</script>

<template>
  <span class="danx-icon">
    <component :is="IconComponent" />
  </span>
</template>
