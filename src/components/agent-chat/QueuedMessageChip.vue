<!--
/**
 * QueuedMessageChip Component
 *
 * One entry in the serial-send queue strip — a message typed while an earlier
 * one is still in flight. Removable, so a user who changes their mind isn't
 * forced to wait for a message they no longer want sent. Internal to the
 * agent-chat tree.
 *
 * ## Props
 * | Prop | Type   | Default | Description             |
 * |------|--------|---------|-------------------------|
 * | text | string | -       | The queued message text |
 *
 * ## Events
 * | Event  | Payload | Description                   |
 * |--------|---------|-------------------------------|
 * | remove | -       | Drop this message from the queue |
 */
-->

<script setup lang="ts">
import { DanxChip } from "../chip";

defineProps<{ text: string }>();

const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <DanxChip
    variant="muted"
    size="xs"
    class="max-w-full"
    removable
    :tooltip="text"
    @remove="emit('remove')"
  >
    <span class="truncate">{{ text }}</span>
  </DanxChip>
</template>
