<!--
/**
 * ChatEmptyState Component
 *
 * The first thing a user sees when the panel opens: what this assistant is
 * for, plus one-tap prompts. Internal to the agent-chat tree.
 *
 * Rendered statically — never streamed or animated in. The trust clock starts
 * the moment the panel opens, and a greeting that types itself out delays the
 * user's first action for no informational gain.
 *
 * ## Props
 * | Prop        | Type                        | Default          | Description        |
 * |-------------|-----------------------------|------------------|--------------------|
 * | title       | string                      | "How can I help?"| Headline           |
 * | description | string                      | -                | Supporting line    |
 * | suggestions | (ChatSuggestion \| string)[] | []              | One-tap prompts    |
 *
 * ## Events
 * | Event  | Payload | Description                     |
 * |--------|---------|---------------------------------|
 * | select | string  | A suggestion chip was clicked   |
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxEmptyState } from "../empty-state";
import { DanxIcon } from "../icon";
import type { ChatSuggestion } from "./types";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    suggestions?: (ChatSuggestion | string)[];
  }>(),
  { title: "How can I help?", suggestions: () => [] }
);

const emit = defineEmits<{ select: [text: string] }>();

const normalized = computed<ChatSuggestion[]>(() =>
  props.suggestions.map((s) => (typeof s === "string" ? { label: s } : s))
);
</script>

<template>
  <div class="danx-agent-chat-empty" data-testid="chat-empty">
    <DanxEmptyState :title="title" :description="description" size="sm" icon="code">
      <template #actions>
        <div v-if="normalized.length" class="danx-agent-chat-empty__suggestions">
          <button
            v-for="(suggestion, i) in normalized"
            :key="i"
            type="button"
            class="danx-agent-chat-empty__suggestion"
            data-testid="chat-suggestion"
            @click="emit('select', suggestion.text ?? suggestion.label)"
          >
            <DanxIcon v-if="suggestion.icon" :icon="suggestion.icon" />
            <span>{{ suggestion.label }}</span>
          </button>
        </div>
      </template>
    </DanxEmptyState>
  </div>
</template>
