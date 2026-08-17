<!--
/**
 * DanxAgentChat Component
 *
 * A domain-agnostic AI chat sidebar. Any feature plugs in by passing a
 * (contextType, contextId) pair — resolved to a thread by the app-supplied
 * `apiAdapter` — and reacting to the emitted `packet` events.
 *
 * DanxAgentChat ships NO default backend: every app's proxy/auth shape
 * differs, so `apiAdapter` is a REQUIRED prop implementing the `ChatAdapter`
 * interface (see types.ts). Nothing loads until one is provided.
 *
 * ## Features
 * - Backend-agnostic via the injectable `apiAdapter` (ChatAdapter contract)
 * - Optional token streaming with a live caret, when the adapter supports it
 * - Strictly-serial sending with a visible, cancellable queue
 * - Escalated (long-running) jobs poll to completion and survive a remount
 * - Stop, retry, copy, and thumbs-up/down message actions
 * - Typed packets rendered via `#packet-{type}` slots with an Apply action,
 *   a JSON fallback, a repaired badge, and a tri-state validity model
 * - Agent steps (tool calls / reasoning) as flat collapsible rows
 * - Markdown rendering, message grouping, day dividers, citations, attachments
 * - Empty state with one-tap suggested prompts
 * - Auto-scroll that never fights a user who scrolled up, plus a jump pill
 * - `role="log"` transcript, per-turn `<article>` labels, reduced-motion support
 *
 * ## Props
 * | Prop            | Type                             | Default           | Description                       |
 * |-----------------|----------------------------------|-------------------|-----------------------------------|
 * | contextType     | string                           | -                 | Logical context (required)        |
 * | contextId       | string                           | -                 | Thread key (required)             |
 * | apiAdapter      | ChatAdapter                      | -                 | Backend adapter (required)        |
 * | packetSchemas   | Record<string, ChatPacketSchema> | {}                | Packet headings + apply labels    |
 * | title           | string                           | "Assistant"       | Panel heading                     |
 * | assistantName   | string                           | "Assistant"       | Name on assistant messages        |
 * | assistantAvatar | string                           | -                 | Avatar image for the assistant    |
 * | userName        | string                           | "You"             | Name on your messages             |
 * | userAvatar      | string                           | -                 | Avatar image for you              |
 * | showAvatars     | boolean                          | true              | Render avatars                    |
 * | showHeader      | boolean                          | true              | Render the panel header           |
 * | placeholder     | string                           | "Ask a question…" | Composer placeholder              |
 * | maxVisibleChars | number                           | 600               | Long-message collapse threshold   |
 * | markdown        | boolean                          | true              | Render assistant text as markdown |
 * | emptyTitle      | string                           | "How can I help?" | Empty-state headline              |
 * | emptyDescription| string                           | -                 | Empty-state supporting line       |
 * | suggestions     | (ChatSuggestion \| string)[]      | []                | One-tap prompts                   |
 * | initialMessage  | string \| null                    | null              | Auto-sent once the thread resolves|
 * | maxLength       | number                           | -                 | Composer character cap            |
 * | messageActions  | boolean                          | true              | Enable copy/retry/feedback        |
 *
 * ## Events
 * | Event        | Payload               | Description                              |
 * |--------------|-----------------------|------------------------------------------|
 * | packet       | ChatPacket            | A message carried a packet               |
 * | applyPacket  | ChatPacket            | User asked to apply a packet             |
 * | openAttachment | ChatAttachment      | User clicked a file attached to a message |
 * | threadReady  | string                | Thread resolved and history loaded       |
 * | error        | unknown               | Any adapter failure                      |
 * | feedback     | { message, feedback } | User rated an assistant message          |
 * | send         | string                | A message was queued for sending         |
 * | clear        | -                     | User cleared the conversation            |
 *
 * ## Slots
 * | Slot          | Description                                                  |
 * |---------------|--------------------------------------------------------------|
 * | packet-{type} | Renderer for a packet type, forwarded down to each message    |
 * | header-actions| Extra controls in the panel header                            |
 * | empty         | Replace the entire empty state                                |
 *
 * ## CSS Tokens
 * See agent-chat-tokens.css for the full `--dx-agent-chat-*` token list.
 *
 * ## Usage Example
 *
 *   <DanxAgentChat
 *     context-type="query_card"
 *     context-id="42"
 *     :api-adapter="myChatAdapter"
 *     :packet-schemas="{ sql_query: { label: 'SQL', applyLabel: 'Apply to editor' } }"
 *     :suggestions="['Show me primary US numbers']"
 *     @apply-packet="applyToEditor"
 *   >
 *     <template #packet-sql_query="{ packet }">
 *       <SqlPreview :sql="packet.payload.sql" />
 *     </template>
 *   </DanxAgentChat>
 */
-->

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { DanxAlert } from "../alert";
import { DanxButton } from "../button";
import { DanxTooltip } from "../tooltip";
import ChatMessageList from "./ChatMessageList.vue";
import ChatComposer from "./ChatComposer.vue";
import ChatEmptyState from "./ChatEmptyState.vue";
import { DanxFile } from "../danx-file";
import { useChatAttachments } from "./useChatAttachments";
import QueuedMessageChip from "./QueuedMessageChip.vue";
import { useAgentChat } from "./useAgentChat";
import type {
  ChatFeedback,
  ChatMessage,
  DanxAgentChatEmits,
  DanxAgentChatProps,
  DanxAgentChatSlots,
} from "./types";

const props = withDefaults(defineProps<DanxAgentChatProps>(), {
  packetSchemas: () => ({}),
  title: "Assistant",
  assistantName: "Assistant",
  userName: "You",
  showAvatars: true,
  showHeader: true,
  placeholder: "Ask a question…",
  maxVisibleChars: 600,
  markdown: true,
  emptyTitle: "How can I help?",
  suggestions: () => [],
  initialMessage: null,
  messageActions: true,
});

const emit = defineEmits<DanxAgentChatEmits>();

defineSlots<DanxAgentChatSlots>();

const chat = useAgentChat({
  apiAdapter: props.apiAdapter,
  contextType: props.contextType,
  contextId: props.contextId,
  onPacket: (packet) => emit("packet", packet),
  onThreadReady: (threadId) => emit("threadReady", threadId),
  onError: (err) => emit("error", err),
});

const { messages, queue, status, error, busy, isEmpty, init, send, stop, retry, dequeue } = chat;

/**
 * Files staged for the next message. Switched off entirely when no upload
 * handler is configured — see the `fileUploadHandler` prop.
 */
const attachments = useChatAttachments({
  uploadHandler: props.fileUploadHandler,
  accept: props.acceptFiles,
  maxFileSize: props.maxFileSize,
  largePasteThreshold: props.largePasteThreshold,
});

const isUnavailable = computed(() => status.value === "unavailable");

const statusDotClass = computed(() => {
  if (status.value === "unavailable") return "danx-agent-chat__status-dot--unavailable";
  if (busy.value) return "danx-agent-chat__status-dot--busy";
  if (status.value === "ready") return "danx-agent-chat__status-dot--ready";
  return "";
});

const statusLabel = computed(() => {
  if (status.value === "unavailable") return "Disconnected";
  if (busy.value) return "Working";
  if (status.value === "ready") return "Connected";
  return "Connecting…";
});

function handleSend(text: string) {
  const files = attachments.take();
  send(text, files);
  emit("send", text);
}

/**
 * A paste only becomes an attachment when it actually produced files —
 * anything else falls through so the editor's own paste handling still runs.
 */
function handlePaste(event: ClipboardEvent) {
  attachments.handlePaste(event);
}

function handleClear() {
  chat.clear();
  emit("clear");
}

function handleFeedback(payload: { message: ChatMessage; feedback: ChatFeedback }) {
  chat.setFeedback(payload.message.id, payload.feedback);
  emit("feedback", payload);
}

onMounted(async () => {
  await init();
  if (props.initialMessage) send(props.initialMessage);
});
</script>

<template>
  <aside class="danx-agent-chat" data-testid="agent-chat-sidebar">
    <header v-if="showHeader" class="danx-agent-chat__header">
      <DanxTooltip :tooltip="statusLabel">
        <template #trigger>
          <span
            class="danx-agent-chat__status-dot"
            :class="statusDotClass"
            data-testid="status-dot"
            :aria-label="statusLabel"
          />
        </template>
      </DanxTooltip>
      <h2 class="danx-agent-chat__title">{{ title }}</h2>
      <div class="danx-agent-chat__header-actions">
        <slot name="header-actions" />
        <DanxButton
          size="xxs"
          variant="blank"
          icon="trash"
          tooltip="Clear conversation"
          aria-label="Clear conversation"
          data-testid="chat-clear"
          :disabled="isEmpty"
          @click="handleClear"
        />
      </div>
    </header>

    <DanxAlert
      v-if="isUnavailable"
      variant="warning"
      title="Chat unavailable"
      class="danx-agent-chat__banner"
      data-testid="chat-unavailable"
    >
      The assistant can't be reached right now. {{ error }}
    </DanxAlert>

    <ChatMessageList
      :messages="messages"
      :max-visible-chars="maxVisibleChars"
      :packet-schemas="packetSchemas"
      :markdown="markdown"
      :show-avatars="showAvatars"
      :actions="messageActions"
      :user-name="userName"
      :assistant-name="assistantName"
      :user-avatar="userAvatar"
      :assistant-avatar="assistantAvatar"
      @apply-packet="emit('applyPacket', $event)"
      @open-attachment="emit('openAttachment', $event)"
      @retry="retry"
      @feedback="handleFeedback"
    >
      <template #empty>
        <slot name="empty">
          <ChatEmptyState
            :title="emptyTitle"
            :description="emptyDescription"
            :suggestions="suggestions"
            @select="handleSend"
          />
        </slot>
      </template>

      <!-- forward consumer #packet-{type} slots down to the messages -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </ChatMessageList>

    <footer class="danx-agent-chat__footer">
      <TransitionGroup
        v-if="queue.length"
        tag="div"
        class="danx-agent-chat-queue"
        data-testid="queue-strip"
        leave-active-class="danx-agent-chat-chip-leave-active"
        leave-to-class="danx-agent-chat-chip-leave-to"
        move-class="danx-agent-chat-chip-move"
      >
        <span key="label">Queued:</span>
        <QueuedMessageChip
          v-for="(queued, i) in queue"
          :key="`${i}-${queued.text}`"
          :text="queued.text"
          @remove="dequeue(i)"
        />
      </TransitionGroup>

      <!-- Files staged for the next message, uploading in place -->
      <div
        v-if="attachments.pending.value.length"
        class="danx-agent-chat-attachments danx-agent-chat-attachments--pending"
        data-testid="pending-attachments"
      >
        <DanxFile
          v-for="file in attachments.pending.value"
          :key="file.id"
          :file="file"
          size="sm"
          show-filename
          show-file-size
          removable
          @remove="attachments.remove(file.id)"
        />
      </div>

      <ChatComposer
        :placeholder="placeholder"
        :disabled="status !== 'ready'"
        :busy="busy"
        :max-length="maxLength"
        :show-hint="isEmpty"
        @send="handleSend"
        @stop="stop"
        @paste="handlePaste"
      />
    </footer>
  </aside>
</template>
