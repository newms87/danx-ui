<!--
/**
 * ChatMessageBubble Component
 *
 * Renders one agent-chat message — user or assistant, plain text or a typed
 * packet. Owns: long-text collapse/expand, a relative timestamp that reveals
 * the absolute time on hover, and the packet display (a consumer-provided
 * `#packet-{type}` slot, falling back to a JSON CodeViewer). A packet that
 * failed validation shows a visible "didn't pass validation" state and is
 * never silently hidden. Internal to the agent-chat component tree (not
 * exported from the package).
 *
 * ## Props
 * | Prop            | Type                     | Default | Description                          |
 * |-----------------|--------------------------|---------|---------------------------------------|
 * | message         | ChatMessage              | -       | The message to render (required)      |
 * | maxVisibleChars | number                   | 600     | Collapse threshold for long text      |
 * | packetSchemas   | Record<string, ChatPacketSchema> | {} | Friendlier packet headings   |
 *
 * ## Slots
 * | Slot              | Description                                          |
 * |-------------------|-------------------------------------------------------|
 * | packet-{type}     | Consumer-provided renderer for a packet type          |
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { CodeViewer } from "../code-viewer";
import { DanxAlert } from "../alert";
import { DanxTooltip } from "../tooltip";
import { fRelativeTime, fAbsoluteTime } from "../../shared/formatters/relativeTime";
import type { ChatMessage, ChatPacketSchema } from "./types";

const props = withDefaults(
  defineProps<{
    message: ChatMessage;
    maxVisibleChars?: number;
    packetSchemas?: Record<string, ChatPacketSchema>;
  }>(),
  {
    maxVisibleChars: 600,
    packetSchemas: () => ({}),
  }
);

defineSlots<{
  [key: string]: (props: { packet: NonNullable<ChatMessage["packet"]> }) => unknown;
}>();

const expanded = ref(false);

const text = computed(() => props.message.text || "");
const isLong = computed(() => text.value.length > props.maxVisibleChars);
const displayedText = computed(() =>
  isLong.value && !expanded.value ? `${text.value.slice(0, props.maxVisibleChars)}…` : text.value
);

const packet = computed(() => props.message.packet || null);
const packetInvalid = computed(() => packet.value != null && packet.value.valid === false);
const packetLabel = computed(
  () =>
    (packet.value ? props.packetSchemas?.[packet.value.type]?.label : undefined) ??
    packet.value?.type
);

const relativeTime = computed(() =>
  props.message.timestamp ? fRelativeTime(props.message.timestamp) : null
);
const absoluteTime = computed(() =>
  props.message.timestamp ? fAbsoluteTime(props.message.timestamp) : ""
);

const roleClass = computed(() =>
  props.message.role === "user"
    ? "danx-agent-chat-bubble--user"
    : "danx-agent-chat-bubble--assistant"
);
</script>

<template>
  <div class="danx-agent-chat-bubble" :class="roleClass" :data-role="message.role">
    <!-- Escalation in progress -->
    <div v-if="message.working" class="danx-agent-chat-bubble__working" data-testid="working-state">
      <span class="danx-agent-chat-bubble__spinner" aria-hidden="true"></span>
      Working on it…
    </div>

    <!-- Plain text (collapsible past maxVisibleChars) -->
    <template v-else>
      <p v-if="text" class="danx-agent-chat-bubble__text whitespace-pre-wrap">
        {{ displayedText }}
      </p>
      <button
        v-if="isLong"
        type="button"
        class="danx-agent-chat-bubble__toggle"
        data-testid="collapse-toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Show less" : "Show more" }}
      </button>

      <!-- Typed packet -->
      <div v-if="packet" class="danx-agent-chat-bubble__packet" data-testid="packet">
        <DanxAlert
          v-if="packetInvalid"
          variant="danger"
          title="Didn't pass validation"
          class="mb-2"
          data-testid="packet-invalid"
        >
          {{ packet.error || "This result could not be validated and was not applied." }}
        </DanxAlert>
        <div class="danx-agent-chat-bubble__packet-label">{{ packetLabel }}</div>
        <slot :name="`packet-${packet.type}`" :packet="packet">
          <CodeViewer :model-value="packet.payload as object | string | null" format="json" />
        </slot>
      </div>
    </template>

    <!-- Per-message error (send failed / status failed / timeout) -->
    <DanxAlert v-if="message.error" variant="danger" class="mt-2" data-testid="message-error">
      {{ message.error }}
    </DanxAlert>

    <DanxTooltip v-if="relativeTime" :tooltip="absoluteTime" class="danx-agent-chat-bubble__time">
      <template #trigger>
        <time :datetime="message.timestamp" data-testid="relative-time">{{ relativeTime }}</time>
      </template>
    </DanxTooltip>
  </div>
</template>
