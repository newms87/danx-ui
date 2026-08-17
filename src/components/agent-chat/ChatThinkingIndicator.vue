<!--
/**
 * ChatThinkingIndicator Component
 *
 * The pre-first-token "the agent is working" state: three staggered dots plus
 * an honest phase label. Internal to the agent-chat tree.
 *
 * It is deliberately NOT a progress bar — the backend cannot know how long an
 * agent turn takes, and a bar that fills at an invented rate is a lie. When a
 * job reports elapsed seconds, that real number is shown instead.
 *
 * ## Props
 * | Prop    | Type   | Default          | Description                        |
 * |---------|--------|------------------|------------------------------------|
 * | label   | string | "Working on it…" | Phase label                        |
 * | elapsed | number | -                | Elapsed seconds, rendered as a suffix |
 */
-->

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    elapsed?: number;
  }>(),
  { label: "Working on it…" }
);

const elapsedLabel = computed(() => {
  if (props.elapsed === undefined || props.elapsed < 1) return "";
  if (props.elapsed < 60) return `${Math.round(props.elapsed)}s`;
  const minutes = Math.floor(props.elapsed / 60);
  const seconds = Math.round(props.elapsed % 60);
  return `${minutes}m ${seconds}s`;
});
</script>

<template>
  <div class="danx-agent-chat-thinking" data-testid="working-state">
    <span class="danx-agent-chat-thinking__dots" aria-hidden="true">
      <span class="danx-agent-chat-thinking__dot" />
      <span class="danx-agent-chat-thinking__dot" />
      <span class="danx-agent-chat-thinking__dot" />
    </span>
    <span class="danx-agent-chat-thinking__label">
      {{ label }}
      <template v-if="elapsedLabel"> · {{ elapsedLabel }}</template>
    </span>
  </div>
</template>
