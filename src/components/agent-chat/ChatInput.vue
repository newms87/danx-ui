<!--
/**
 * ChatInput Component
 *
 * The agent-chat composer. Auto-resizing textarea + send button. Enter sends,
 * Shift+Enter inserts a newline. Disabled while the chat is unavailable.
 * Internal to the agent-chat component tree (not exported from the package).
 *
 * ## Props
 * | Prop        | Type    | Default          | Description                |
 * |-------------|---------|------------------|----------------------------|
 * | placeholder | string  | "Ask a question…"| Textarea placeholder        |
 * | disabled    | boolean | false            | Disables input and send    |
 *
 * ## Events
 * | Event | Payload | Description                        |
 * |-------|---------|-------------------------------------|
 * | send  | string  | Fired with the trimmed message text |
 */
-->

<script setup lang="ts">
import { ref } from "vue";
import { DanxButton } from "../button";
import { DanxTextarea } from "../textarea";

withDefaults(
  defineProps<{
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    placeholder: "Ask a question…",
    disabled: false,
  }
);

const emit = defineEmits<{
  send: [text: string];
}>();

const text = ref("");

function submit() {
  // Both trigger points (button click, Enter keydown) are on natively
  // `disabled`-bound elements, which browsers block from dispatching
  // user-interaction events — no separate disabled check needed here.
  const value = text.value.trim();
  if (!value) return;
  emit("send", value);
  text.value = "";
}
</script>

<template>
  <div class="flex items-end gap-2">
    <DanxTextarea
      v-model="text"
      auto-resize
      :rows="1"
      :placeholder="placeholder"
      :disabled="disabled"
      class="flex-1"
      @keydown.enter.exact.prevent="submit"
    />
    <DanxButton variant="info" :disabled="disabled || !text.trim()" @click="submit"
      >Send</DanxButton
    >
  </div>
</template>
