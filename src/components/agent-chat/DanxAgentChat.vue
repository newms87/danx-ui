<!--
/**
 * DanxAgentChat Component
 *
 * A domain-agnostic AI chat sidebar. ANY feature plugs in by passing a
 * (contextType, contextId) pair — resolved to a thread by the app-supplied
 * `apiAdapter` — and reacting to the emitted `packet` events. DanxAgentChat
 * ships NO default backend: every app's proxy/auth shape differs, so
 * `apiAdapter` is a REQUIRED prop implementing the `ChatAdapter` interface
 * (see types.ts) — nothing renders until one is provided.
 *
 * Composes ChatMessageList (scrolling thread), ChatInput (composer), and
 * QueuedMessageChip (serial-send queue strip) around the useAgentChat
 * composable, which owns thread resolution, history load, strictly-serial
 * sending, and stateless escalation polling that survives a remount.
 *
 * ## Features
 * - Backend-agnostic via the injectable `apiAdapter` (ChatAdapter contract)
 * - Strictly-serial message sending with a visible queue strip
 * - Long-running (escalated) requests show a working state and poll to
 *   completion, surviving a component remount via sessionStorage
 * - Typed packet results render via a consumer-provided `#packet-{type}`
 *   slot, falling back to a JSON CodeViewer
 * - A distinct "chat unavailable" state (never a hung spinner) when the
 *   thread can't be resolved or the connection is revoked mid-session
 * - CSS token system for complete styling control
 *
 * ## Props
 * | Prop            | Type                     | Default           | Description                          |
 * |------------------|--------------------------|-------------------|---------------------------------------|
 * | contextType      | string                   | -                 | Logical context (required)            |
 * | contextId        | string                   | -                 | Context instance / thread key (required) |
 * | apiAdapter       | ChatAdapter              | -                 | Backend adapter (required, no default)|
 * | packetSchemas    | Record<string, ChatPacketSchema> | {}       | Friendlier packet headings            |
 * | placeholder      | string                   | "Ask a question…" | Composer placeholder                  |
 * | maxVisibleChars  | number                   | 600               | Long-text collapse threshold          |
 * | initialMessage   | string \| null           | null              | Auto-sent once the thread resolves    |
 *
 * ## Events
 * | Event         | Payload   | Description                                    |
 * |---------------|-----------|-------------------------------------------------|
 * | packet        | ChatPacket| Fired whenever a message carries a packet        |
 * | threadReady   | string    | Fired once the thread has resolved + loaded      |
 * | error         | unknown   | Fired on any adapter failure                     |
 *
 * ## Slots
 * | Slot              | Description                                          |
 * |-------------------|-------------------------------------------------------|
 * | packet-{type}     | Consumer-provided renderer for a packet type, forwarded down to each message bubble |
 *
 * ## CSS Tokens
 * See agent-chat-tokens.css for the full `--dx-agent-chat-*` token list.
 *
 * ## Usage Example
 *
 *   <DanxAgentChat
 *     context-type="phone-query"
 *     context-id="saved-query-42"
 *     :api-adapter="myChatAdapter"
 *     :packet-schemas="{ sql_query: { label: 'SQL' } }"
 *     @packet="onPacket"
 *   >
 *     <template #packet-sql_query="{ packet }">
 *       <SqlPreview :sql="packet.payload.sql" />
 *     </template>
 *   </DanxAgentChat>
 *
 *   // myChatAdapter implements ChatAdapter against your own backend proxy —
 *   // there is no default implementation to import.
 */
-->

<script setup lang="ts">
import { onMounted } from "vue";
import { DanxAlert } from "../alert";
import ChatMessageList from "./ChatMessageList.vue";
import ChatInput from "./ChatInput.vue";
import QueuedMessageChip from "./QueuedMessageChip.vue";
import { useAgentChat } from "./useAgentChat";
import type { DanxAgentChatEmits, DanxAgentChatProps, DanxAgentChatSlots } from "./types";

const props = withDefaults(defineProps<DanxAgentChatProps>(), {
  packetSchemas: () => ({}),
  placeholder: "Ask a question…",
  maxVisibleChars: 600,
  initialMessage: null,
});

const emit = defineEmits<DanxAgentChatEmits>();

defineSlots<DanxAgentChatSlots>();

const { messages, queue, sending, status, error, init, send } = useAgentChat({
  apiAdapter: props.apiAdapter,
  contextType: props.contextType,
  contextId: props.contextId,
  onPacket: (packet) => emit("packet", packet),
  onThreadReady: (threadId) => emit("threadReady", threadId),
  onError: (err) => emit("error", err),
});

onMounted(async () => {
  await init();
  if (props.initialMessage) send(props.initialMessage);
});
</script>

<template>
  <aside class="danx-agent-chat" data-testid="agent-chat-sidebar">
    <header class="danx-agent-chat__header">
      <h2 class="danx-agent-chat__title">Assistant</h2>
    </header>

    <DanxAlert
      v-if="status === 'unavailable'"
      variant="warning"
      title="Chat unavailable"
      data-testid="chat-unavailable"
    >
      The assistant can't be reached right now. {{ error }}
    </DanxAlert>

    <template v-else>
      <ChatMessageList
        class="danx-agent-chat__list"
        :messages="messages"
        :max-visible-chars="maxVisibleChars"
        :packet-schemas="packetSchemas"
      >
        <!-- forward consumer #packet-{type} slots through to the bubbles -->
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
      </ChatMessageList>

      <div
        v-if="queue.length"
        class="danx-agent-chat__queue flex flex-wrap items-center gap-1.5"
        data-testid="queue-strip"
      >
        <span class="danx-agent-chat__queue-label">Queued:</span>
        <QueuedMessageChip v-for="(text, i) in queue" :key="i" :text="text" />
      </div>

      <footer class="danx-agent-chat__footer">
        <ChatInput :placeholder="placeholder" :disabled="status !== 'ready'" @send="send" />
        <p v-if="sending" class="danx-agent-chat__hint">
          Sending — new messages will queue and send in order.
        </p>
      </footer>
    </template>
  </aside>
</template>
