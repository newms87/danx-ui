<!--
/**
 * DanxTimelineItem - A single vertical timeline entry
 *
 * Renders a marker (icon or colored dot) on a connector line, an optional
 * timestamp, and a content slot. Used as a DanxTimeline child, either
 * directly or generated from the `items` prop shorthand.
 *
 * ## Props
 * | Prop      | Type                               | Default   | Description                    |
 * |-----------|-------------------------------------|-----------|--------------------------------|
 * | timestamp | string                              | -         | Timestamp text                 |
 * | type      | TimelineItemType                    | "default" | Marker color                   |
 * | icon      | Component \| IconName \| string     | -         | Marker icon, falls back to dot |
 *
 * ## Slots
 * | Slot      | Description                          |
 * |-----------|---------------------------------------|
 * | default   | Entry content                         |
 * | timestamp | Overrides the timestamp text          |
 */
-->

<script setup lang="ts">
import { DanxIcon } from "../icon";
import type { DanxTimelineItemProps } from "./types";

withDefaults(defineProps<DanxTimelineItemProps>(), {
  type: "default",
});
</script>

<template>
  <li class="danx-timeline-item" :class="`is-${type}`">
    <div class="danx-timeline-item__rail">
      <span class="danx-timeline-item__marker">
        <DanxIcon v-if="icon" :icon="icon" class="danx-timeline-item__icon" />
      </span>
      <span class="danx-timeline-item__connector" />
    </div>

    <div class="danx-timeline-item__content">
      <div v-if="timestamp" class="danx-timeline-item__timestamp">
        <slot name="timestamp">{{ timestamp }}</slot>
      </div>
      <div class="danx-timeline-item__body">
        <slot />
      </div>
    </div>
  </li>
</template>
