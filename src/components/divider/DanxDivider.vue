<!--
/**
 * DanxDivider Component
 *
 * A thin line separating content, with optional inset margin and an optional
 * label projected into the line (common "OR" pattern between two sections).
 *
 * ## Features
 * - Horizontal (default) or vertical orientation
 * - Optional inset margin along the cross-axis
 * - Optional label slot, rendered inline within the line (horizontal only)
 * - CSS token system for complete styling control
 * - Zero external dependencies
 *
 * ## Props
 * | Prop        | Type               | Default      | Description                |
 * |-------------|--------------------|--------------|-----------------------------|
 * | orientation | DividerOrientation | "horizontal" | Line direction              |
 * | inset       | boolean            | false        | Adds cross-axis margin      |
 *
 * ## Slots
 * | Slot    | Description                                          |
 * |---------|-------------------------------------------------------|
 * | default | Label content projected into the line (horizontal only) |
 *
 * ## CSS Tokens
 * | Token                      | Default          | Description        |
 * |-----------------------------|------------------|---------------------|
 * | --dx-divider-color          | --color-border   | Line color          |
 * | --dx-divider-thickness      | 1px              | Line thickness      |
 * | --dx-divider-inset          | 1rem             | Inset margin        |
 * | --dx-divider-label-color    | --color-text-muted | Label text color  |
 * | --dx-divider-label-font-size| 0.875rem         | Label font size     |
 * | --dx-divider-label-gap      | 0.75rem          | Gap between line and label |
 *
 * ## Usage Examples
 *
 * Horizontal divider:
 *   <DanxDivider />
 *
 * Vertical divider (e.g. between toolbar buttons):
 *   <DanxDivider orientation="vertical" />
 *
 * Inset divider:
 *   <DanxDivider inset />
 *
 * Divider with a label:
 *   <DanxDivider>OR</DanxDivider>
 */
-->

<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { DanxDividerProps, DanxDividerSlots } from "./types";

const props = withDefaults(defineProps<DanxDividerProps>(), {
  orientation: "horizontal",
  inset: false,
});

defineSlots<DanxDividerSlots>();

const slots = useSlots();

const hasLabel = computed(() => props.orientation === "horizontal" && !!slots.default);

const dividerClasses = computed(() => [
  "danx-divider",
  `danx-divider--${props.orientation}`,
  {
    "danx-divider--inset": props.inset,
    "danx-divider--with-label": hasLabel.value,
  },
]);
</script>

<template>
  <div :class="dividerClasses" role="separator" :aria-orientation="orientation">
    <template v-if="hasLabel">
      <span class="danx-divider__line" />
      <span class="danx-divider__label"><slot /></span>
      <span class="danx-divider__line" />
    </template>
  </div>
</template>
