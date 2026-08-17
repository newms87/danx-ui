<!--
/**
 * ChatComposer Component
 *
 * The message input: an auto-growing textarea, a send/stop button that swaps
 * in place, a keyboard hint, and an optional character counter. Internal to
 * the agent-chat tree.
 *
 * Uses a NATIVE textarea rather than DanxTextarea so the keydown handler binds
 * directly to the element that receives the key — a component-level listener
 * lands on a wrapper via attribute fallthrough, which makes Enter handling
 * depend on the wrapper's DOM shape.
 *
 * The send button becomes Stop during generation, in the same position, so the
 * layout never shifts and the abort is always one click away.
 *
 * ## Props
 * | Prop        | Type    | Default           | Description                       |
 * |-------------|---------|-------------------|-----------------------------------|
 * | placeholder | string  | "Ask a question…" | Textarea placeholder              |
 * | disabled    | boolean | false             | Disables input and send           |
 * | busy        | boolean | false             | Show Stop instead of Send         |
 * | canStop     | boolean | true              | Whether Stop is offered when busy |
 * | maxLength   | number  | -                 | Character cap + counter           |
 * | showHint    | boolean | true              | Show the Enter/Shift+Enter hint   |
 *
 * ## Events
 * | Event | Payload | Description                        |
 * |-------|---------|-------------------------------------|
 * | send  | string  | Fired with the trimmed message text |
 * | stop  | -       | User asked to abort generation      |
 */
-->

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { DanxButton } from "../button";
import { DanxKbd } from "../kbd";

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    disabled?: boolean;
    busy?: boolean;
    canStop?: boolean;
    maxLength?: number;
    showHint?: boolean;
  }>(),
  {
    placeholder: "Ask a question…",
    disabled: false,
    busy: false,
    canStop: true,
    showHint: true,
  }
);

const emit = defineEmits<{
  send: [text: string];
  stop: [];
}>();

const text = ref("");
const input = ref<HTMLTextAreaElement | null>(null);

const trimmed = computed(() => text.value.trim());
const isOver = computed(() => props.maxLength !== undefined && text.value.length > props.maxLength);
const canSend = computed(() => !!trimmed.value && !props.disabled && !isOver.value);

/** Counter appears only near the limit — a permanent counter is clutter. */
const showCount = computed(
  () => props.maxLength !== undefined && text.value.length > props.maxLength * 0.8
);
const countClass = computed(() => {
  if (isOver.value) return "danx-agent-chat-composer__count--over";
  return "danx-agent-chat-composer__count--warn";
});

function submit() {
  if (!canSend.value) return;
  emit("send", trimmed.value);
  text.value = "";
  // Restore the single-row height after `field-sizing: content` grew it.
  void nextTick(() => input.value?.focus());
}

/**
 * Enter sends, Shift+Enter inserts a newline. `preventDefault` is called only
 * on the sending path so the newline case keeps its native behavior.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey) return;
  // An IME composition session uses Enter to accept a candidate — sending
  // there would eat the character the user was still composing.
  if (event.isComposing) return;
  event.preventDefault();
  submit();
}
</script>

<template>
  <div>
    <div class="danx-agent-chat-composer">
      <textarea
        ref="input"
        v-model="text"
        class="danx-agent-chat-composer__input"
        rows="1"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="placeholder"
        data-testid="composer-input"
        @keydown="onKeydown"
      />
      <DanxButton
        v-if="busy && canStop"
        size="sm"
        variant="muted"
        icon="stop"
        tooltip="Stop generating"
        aria-label="Stop generating"
        data-testid="composer-stop"
        @click="emit('stop')"
      />
      <DanxButton
        v-else
        size="sm"
        variant="info"
        icon="chevron-up"
        :disabled="!canSend"
        tooltip="Send"
        aria-label="Send message"
        data-testid="composer-send"
        @click="submit"
      />
    </div>

    <div v-if="showHint || showCount" class="danx-agent-chat-composer__hint">
      <template v-if="showHint">
        <DanxKbd :keys="['Enter']" /> to send <DanxKbd :keys="['Shift', 'Enter']" /> for newline
      </template>
      <span
        v-if="showCount"
        class="danx-agent-chat-composer__count"
        :class="countClass"
        data-testid="composer-count"
      >
        {{ text.length }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>
