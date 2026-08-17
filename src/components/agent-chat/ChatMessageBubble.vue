<!--
/**
 * ChatMessageBubble Component
 *
 * Renders ONE message: text (plain or markdown), a live streaming caret, agent
 * steps, a typed packet, citations, attachments, and any per-message error.
 * Internal to the agent-chat tree.
 *
 * Role styling is asymmetric by design — the user's turn gets a filled,
 * width-capped bubble; the assistant's runs full-bleed with no container so
 * markdown, tables, and code aren't boxed at sidebar widths.
 *
 * A packet that failed validation shows a visible "didn't pass validation"
 * state and is never silently hidden or applied.
 *
 * ## Props
 * | Prop            | Type                             | Default | Description                       |
 * |-----------------|----------------------------------|---------|-----------------------------------|
 * | message         | ChatMessage                      | -       | The message to render (required)  |
 * | maxVisibleChars | number                           | 600     | Collapse threshold for long text  |
 * | packetSchemas   | Record<string, ChatPacketSchema> | {}      | Packet heading + apply labels     |
 * | markdown        | boolean                          | true    | Render text as markdown          |
 *
 * ## Events
 * | Event       | Payload    | Description                        |
 * |-------------|------------|-------------------------------------|
 * | applyPacket | ChatPacket | User asked to apply this packet     |
 *
 * ## Slots
 * | Slot          | Description                                 |
 * |---------------|---------------------------------------------|
 * | packet-{type} | Consumer renderer for a packet type         |
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { CodeViewer } from "../code-viewer";
import { DanxAlert } from "../alert";
import { DanxBadge } from "../badge";
import { DanxButton } from "../button";
import { DanxChip } from "../chip";
import { DanxIcon } from "../icon";
import ChatStepList from "./ChatStepList.vue";
import ChatThinkingIndicator from "./ChatThinkingIndicator.vue";
import { renderMarkdown } from "../../shared/markdown";
import type { ChatMessage, ChatPacket, ChatPacketSchema, ChatPacketSlotProps } from "./types";

const props = withDefaults(
  defineProps<{
    message: ChatMessage;
    maxVisibleChars?: number;
    packetSchemas?: Record<string, ChatPacketSchema>;
    markdown?: boolean;
  }>(),
  { maxVisibleChars: 600, packetSchemas: () => ({}), markdown: true }
);

const emit = defineEmits<{ applyPacket: [packet: ChatPacket] }>();

defineSlots<{ [key: string]: (props: ChatPacketSlotProps) => unknown }>();

const expanded = ref(false);

const isUser = computed(() => props.message.role === "user");
const text = computed(() => props.message.text || "");
const isLong = computed(() => text.value.length > props.maxVisibleChars);
const displayedText = computed(() =>
  isLong.value && !expanded.value ? `${text.value.slice(0, props.maxVisibleChars)}…` : text.value
);

/**
 * Markdown is rendered for the assistant only. A user's own text is shown
 * verbatim — silently reinterpreting what someone typed (turning `_x_` into
 * italics, or eating a `#`) misrepresents their input.
 * `renderMarkdown` escapes HTML, so this is XSS-safe by construction.
 */
const useMarkdown = computed(() => props.markdown && !isUser.value && !props.message.streaming);
const renderedHtml = computed(() => renderMarkdown(displayedText.value));

const packet = computed(() => props.message.packet || null);
/** Tri-state: only an explicit `false` marks a packet invalid. */
const packetInvalid = computed(() => packet.value?.valid === false);
const packetSchema = computed(() =>
  packet.value ? props.packetSchemas?.[packet.value.type] : undefined
);
const packetLabel = computed(() => packetSchema.value?.label ?? packet.value?.type);
const canApply = computed(() => !!packet.value && packet.value.valid !== false);
</script>

<template>
  <div
    class="danx-agent-chat-message"
    :class="{
      'danx-agent-chat-message--user': isUser,
      'danx-agent-chat-message--assistant': !isUser,
      'danx-agent-chat-message--pending': message.pending,
    }"
    :data-role="message.role"
  >
    <!-- Agent steps run above the answer they produced -->
    <ChatStepList v-if="message.steps?.length" :steps="message.steps" />

    <!-- Escalation in progress, before any text has arrived -->
    <ChatThinkingIndicator
      v-if="message.working"
      :elapsed="message.job?.elapsed_seconds"
      :label="message.job?.summary || 'Working on it…'"
    />

    <template v-else>
      <!-- Body -->
      <div v-if="useMarkdown && text" class="danx-agent-chat-markdown" v-html="renderedHtml" />
      <p v-else-if="text" class="danx-agent-chat-message__text whitespace-pre-wrap">
        {{ displayedText
        }}<span v-if="message.streaming" class="danx-agent-chat-caret" aria-hidden="true" />
      </p>
      <span
        v-else-if="message.streaming"
        class="danx-agent-chat-caret"
        aria-hidden="true"
        data-testid="streaming-caret"
      />

      <button
        v-if="isLong"
        type="button"
        class="danx-agent-chat-message__toggle"
        data-testid="collapse-toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Show less" : "Show more" }}
      </button>

      <!-- Typed packet -->
      <div v-if="packet" class="danx-agent-chat-packet" data-testid="packet">
        <DanxAlert
          v-if="packetInvalid"
          variant="danger"
          title="Didn't pass validation"
          class="mb-2"
          data-testid="packet-invalid"
        >
          {{ packet.error || "This result could not be validated and was not applied." }}
        </DanxAlert>

        <div class="danx-agent-chat-packet__head">
          <DanxIcon v-if="packetSchema?.icon" :icon="packetSchema.icon" />
          <span>{{ packetLabel }}</span>
          <DanxBadge
            v-if="packet.repaired"
            variant="warning"
            label="repaired"
            data-testid="packet-repaired"
          />
          <div class="danx-agent-chat-packet__actions">
            <DanxButton
              v-if="canApply"
              size="xxs"
              variant="info"
              icon="check"
              :tooltip="packetSchema?.applyLabel || 'Apply this result'"
              data-testid="packet-apply"
              @click="emit('applyPacket', packet)"
            >
              {{ packetSchema?.applyLabel || "Apply" }}
            </DanxButton>
          </div>
        </div>

        <slot :name="`packet-${packet.type}`" :packet="packet">
          <CodeViewer :model-value="packet.payload as object | string | null" format="json" />
        </slot>
      </div>

      <!-- Attachments -->
      <div v-if="message.attachments?.length" class="danx-agent-chat-attachments">
        <DanxChip
          v-for="file in message.attachments"
          :key="file.id"
          size="xs"
          variant="muted"
          icon="document"
          :label="file.name"
        />
      </div>

      <!-- Citations -->
      <div v-if="message.citations?.length" class="danx-agent-chat-citations">
        <DanxChip
          v-for="citation in message.citations"
          :key="citation.id"
          size="xs"
          variant="muted"
          :tooltip="citation.url || citation.title"
          :label="citation.source || citation.title"
        />
      </div>
    </template>

    <!-- Per-message error (send failed / job failed / timeout) -->
    <DanxAlert
      v-if="message.error"
      variant="danger"
      class="danx-agent-chat-message__error"
      data-testid="message-error"
    >
      {{ message.error }}
    </DanxAlert>
  </div>
</template>
