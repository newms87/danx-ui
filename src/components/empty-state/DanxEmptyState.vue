<!--
/**
 * DanxEmptyState Component
 *
 * A declarative placeholder for empty lists, empty search results, and
 * zero-data states — icon or illustration, title, description, and actions.
 *
 * ## Features
 * - Icon (via prop, rendered through DanxIcon) or a fully custom illustration slot
 * - Required title, optional description
 * - Actions slot for calls-to-action (e.g. DanxButton)
 * - Three sizes (sm/md/lg)
 * - CSS token system for complete styling control
 * - Zero external dependencies
 *
 * ## Props
 * | Prop        | Type                             | Default | Description                          |
 * |-------------|-----------------------------------|---------|---------------------------------------|
 * | icon        | Component \| IconName \| string   | -       | Icon shown above the title            |
 * | size        | EmptyStateSize                    | "md"    | Empty state size                      |
 * | title       | string                            | -       | Heading text (required)               |
 * | description | string                            | -       | Supporting copy                       |
 *
 * ## Slots
 * | Slot         | Description                                          |
 * |--------------|-------------------------------------------------------|
 * | illustration | Custom illustration, replaces the `icon` prop entirely |
 * | actions      | Action buttons shown below the description            |
 *
 * ## CSS Tokens
 * Global tokens:
 * | Token                          | Default        | Description         |
 * |---------------------------------|----------------|----------------------|
 * | --dx-empty-state-font-family    | --font-sans    | Font family          |
 * | --dx-empty-state-title-weight   | --font-medium  | Title font weight    |
 * | --dx-empty-state-title-color    | --color-text   | Title color          |
 * | --dx-empty-state-description-color | --color-text-muted | Description color |
 *
 * Size tokens (per size: sm, md, lg):
 * | Token                                | Description          |
 * |----------------------------------------|-----------------------|
 * | --dx-empty-state-{size}-icon-size      | Icon/illustration size |
 * | --dx-empty-state-{size}-gap            | Vertical gap between blocks |
 * | --dx-empty-state-{size}-padding        | Outer padding         |
 * | --dx-empty-state-{size}-title-size     | Title font size       |
 * | --dx-empty-state-{size}-description-size | Description font size |
 *
 * ## Usage Examples
 *
 * Minimal:
 *   <DanxEmptyState title="No results" />
 *
 * With icon and description:
 *   <DanxEmptyState icon="search" title="No results" description="Try a different search term." />
 *
 * With actions:
 *   <DanxEmptyState icon="folder" title="No files yet">
 *     <template #actions>
 *       <DanxButton variant="success">Upload a file</DanxButton>
 *     </template>
 *   </DanxEmptyState>
 *
 * Custom illustration:
 *   <DanxEmptyState title="No results">
 *     <template #illustration><MyIllustration /></template>
 *   </DanxEmptyState>
 *
 * Sizes:
 *   <DanxEmptyState size="sm" title="No results" />
 *   <DanxEmptyState size="lg" title="No results" />
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxIcon } from "../icon";
import type { DanxEmptyStateProps, DanxEmptyStateSlots } from "./types";

const props = withDefaults(defineProps<DanxEmptyStateProps>(), {
  size: "md",
});

const slots = defineSlots<DanxEmptyStateSlots>();

const emptyStateClasses = computed(() => ["danx-empty-state", `danx-empty-state--${props.size}`]);
</script>

<template>
  <div :class="emptyStateClasses">
    <div v-if="slots.illustration || icon" class="danx-empty-state__illustration">
      <slot name="illustration">
        <DanxIcon :icon="icon!" class="danx-empty-state__icon" />
      </slot>
    </div>
    <p class="danx-empty-state__title">{{ title }}</p>
    <p v-if="description" class="danx-empty-state__description">{{ description }}</p>
    <div v-if="slots.actions" class="danx-empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>
