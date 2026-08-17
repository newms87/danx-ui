<!--
/**
 * ChatMessageActions Component
 *
 * Per-message copy / retry / feedback toolbar. Internal to the agent-chat tree.
 *
 * Revealed on hover via CSS, but ALWAYS present in the DOM and focusable —
 * keyboard and screen-reader users never get a hover event, so hiding these
 * with `v-if` would make them unreachable.
 *
 * ## Props
 * | Prop      | Type         | Default | Description                          |
 * |-----------|--------------|---------|--------------------------------------|
 * | text      | string       | ""      | Text placed on the clipboard         |
 * | canRetry  | boolean      | false   | Show the retry action                |
 * | canCopy   | boolean      | true    | Show the copy action                 |
 * | feedback  | ChatFeedback | -       | Currently-recorded rating            |
 * | showFeedback | boolean   | false   | Show the helpful/not-helpful pair    |
 *
 * ## Events
 * | Event    | Payload      | Description                    |
 * |----------|--------------|--------------------------------|
 * | retry    | -            | Retry this turn                |
 * | feedback | ChatFeedback | User rated the message         |
 */
-->

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { DanxButton } from "../button";
import type { ChatFeedback } from "./types";

const props = withDefaults(
  defineProps<{
    text?: string;
    canRetry?: boolean;
    canCopy?: boolean;
    feedback?: ChatFeedback;
    showFeedback?: boolean;
  }>(),
  { text: "", canRetry: false, canCopy: true, showFeedback: false }
);

const emit = defineEmits<{
  retry: [];
  feedback: [value: ChatFeedback];
}>();

const copied = ref(false);

/** How long the "Copied" confirmation stays up. */
const COPIED_RESET_MS = 1500;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard?.writeText(props.text);
    copied.value = true;
    // Restart the window on every copy. Without this, a second copy inherits
    // the first copy's remaining time and the confirmation blinks out early.
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied.value = false), COPIED_RESET_MS);
  } catch {
    // Clipboard is permission-gated and unavailable over plain HTTP. Failing
    // silently is correct here — the user still has the text on screen.
  }
}

// Never let the reset fire into a component that is already gone.
onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <div class="danx-agent-chat-actions" data-testid="message-actions">
    <DanxButton
      v-if="canCopy && text"
      size="xxs"
      variant="blank"
      :icon="copied ? 'check' : 'copy'"
      :tooltip="copied ? 'Copied' : 'Copy'"
      :aria-label="copied ? 'Copied' : 'Copy message'"
      data-testid="action-copy"
      @click="copy"
    />
    <DanxButton
      v-if="canRetry"
      size="xxs"
      variant="blank"
      icon="refresh"
      tooltip="Retry"
      aria-label="Retry message"
      data-testid="action-retry"
      @click="emit('retry')"
    />
    <template v-if="showFeedback">
      <DanxButton
        size="xxs"
        :variant="feedback === 'up' ? 'success' : 'blank'"
        icon="confirm"
        tooltip="Helpful"
        aria-label="Mark as helpful"
        data-testid="action-thumbs-up"
        @click="emit('feedback', 'up')"
      />
      <DanxButton
        size="xxs"
        :variant="feedback === 'down' ? 'danger' : 'blank'"
        icon="cancel"
        tooltip="Not helpful"
        aria-label="Mark as not helpful"
        data-testid="action-thumbs-down"
        @click="emit('feedback', 'down')"
      />
    </template>
  </div>
</template>
