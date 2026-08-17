<!--
/**
 * ChatComposer Component
 *
 * The message input: a full `MarkdownEditor` surface, a send/stop button that
 * swaps in place, a keyboard hint, and an optional character counter.
 * Internal to the agent-chat tree.
 *
 * The editor is the library's own `MarkdownEditor`, so composing a message has
 * the same affordances as writing anywhere else in the app — fenced code with
 * syntax highlighting, block quotes, tables, links and lists, plus the
 * editor's context menu and hotkeys. A chat box people paste code into should
 * render that code, not flatten it into one grey line.
 *
 * Enter sends and Shift+Enter inserts a newline. That works because
 * MarkdownEditor emits `keydown` to its host BEFORE running its own handler
 * and skips that handler when the host has called `preventDefault` — so the
 * editor's own Enter behaviour (list continuation, paragraph splitting) stays
 * intact for the newline case and is suppressed for the sending case.
 *
 * `paste` is re-emitted unhandled. The composer takes no view on what a paste
 * means; the panel above it decides whether a pasted image or an oversized
 * text blob should become an attachment.
 *
 * ## Props
 * | Prop        | Type    | Default           | Description                     |
 * |-------------|---------|-------------------|---------------------------------|
 * | placeholder | string  | "Ask a question…" | Editor placeholder              |
 * | disabled    | boolean | false             | Makes the editor read-only      |
 * | busy        | boolean | false             | Show Stop instead of Send       |
 * | maxLength   | number  | -                 | Character cap + counter         |
 * | showHint    | boolean | true              | Show the Enter/Shift+Enter hint |
 *
 * ## Events
 * | Event | Payload        | Description                             |
 * |-------|----------------|------------------------------------------|
 * | send  | string         | Fired with the trimmed message text      |
 * | stop  | -              | User asked to abort generation           |
 * | paste | ClipboardEvent | A paste landed in the editor, unhandled  |
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxButton } from "../button";
import { DanxKbd } from "../kbd";
import { MarkdownEditor } from "../markdown-editor";

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    disabled?: boolean;
    busy?: boolean;
    maxLength?: number;
    showHint?: boolean;
  }>(),
  {
    placeholder: "Ask a question…",
    disabled: false,
    busy: false,
    showHint: true,
  }
);

const emit = defineEmits<{
  send: [text: string];
  stop: [];
  paste: [event: ClipboardEvent];
}>();

const text = ref("");

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
}

/**
 * Enter sends, Shift+Enter inserts a newline. `preventDefault` is what tells
 * MarkdownEditor to skip its own Enter handling, so it is called only on the
 * sending path — the newline case falls through to the editor untouched.
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
      <MarkdownEditor
        v-model="text"
        class="danx-agent-chat-composer__input"
        :placeholder="placeholder"
        :readonly="disabled"
        hide-footer
        :debounce-ms="0"
        :aria-label="placeholder"
        data-testid="composer-input"
        @keydown="onKeydown"
        @paste="emit('paste', $event)"
      />
      <DanxButton
        v-if="busy"
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
