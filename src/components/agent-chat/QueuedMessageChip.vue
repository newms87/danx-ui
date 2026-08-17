<!--
/**
 * QueuedMessageChip Component
 *
 * One entry in DanxAgentChat's serial-send queue strip — a message the user
 * typed while an earlier one is still processing. Purely presentational,
 * internal to the agent-chat component tree (not exported from the package).
 *
 * ## Props
 * | Prop | Type   | Default | Description                 |
 * |------|--------|---------|------------------------------|
 * | text | string | -       | The queued message text     |
 */
-->

<script setup lang="ts">
import { DanxChip } from "../chip";

defineProps<{
  text: string;
}>();
</script>

<template>
  <DanxChip variant="muted" size="sm" class="max-w-full">
    <span class="truncate">{{ text }}</span>
  </DanxChip>
</template>
