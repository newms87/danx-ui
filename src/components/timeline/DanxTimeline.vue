<!--
/**
 * DanxTimeline - Vertical activity/event timeline
 *
 * Renders a vertical list of DanxTimelineItem entries connected by a line,
 * each with a marker (icon or semantic-colored dot), timestamp, and content.
 * Presentation-only: pass an `items` array for the common case, or use the
 * default slot with DanxTimelineItem children for full control.
 *
 * ## Features
 * - Vertical connector line linking entries
 * - Per-item semantic type (success, error, warning, info, default)
 * - Optional per-item icon, falling back to a colored dot
 * - `items` shorthand or DanxTimelineItem children via the default slot
 * - Full CSS token system for styling
 * - Light and dark theme support
 *
 * ## Props
 * | Prop  | Type               | Default | Description                          |
 * |-------|--------------------|---------|---------------------------------------|
 * | items | DanxTimelineEntry[]| -       | Entries to render (shorthand)          |
 *
 * ## Slots
 * | Slot    | Description                                              |
 * |---------|------------------------------------------------------------|
 * | default | DanxTimelineItem children, used instead of the `items` prop |
 *
 * ## Usage Examples
 *
 * Items shorthand:
 *   <DanxTimeline :items="entries" />
 *
 * Explicit children:
 *   <DanxTimeline>
 *     <DanxTimelineItem type="success" timestamp="2m ago">Deployed</DanxTimelineItem>
 *   </DanxTimeline>
 */
-->

<script setup lang="ts">
import DanxTimelineItem from "./DanxTimelineItem.vue";
import type { DanxTimelineProps } from "./types";

defineProps<DanxTimelineProps>();
</script>

<template>
  <ul class="danx-timeline">
    <template v-if="items && items.length">
      <DanxTimelineItem
        v-for="(item, index) in items"
        :key="index"
        :type="item.type"
        :icon="item.icon"
        :timestamp="item.timestamp"
      >
        {{ item.content }}
      </DanxTimelineItem>
    </template>
    <slot v-else />
  </ul>
</template>
