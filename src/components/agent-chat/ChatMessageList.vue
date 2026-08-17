<!--
/**
 * ChatMessageList Component
 *
 * The scrolling transcript: filters bookkeeping messages, collapses the rest
 * into sender runs, inserts day dividers, animates new runs in, and keeps the
 * view pinned to the newest message WITHOUT overriding a user who scrolled up.
 * Internal to the agent-chat tree.
 *
 * As a reusable component it must not assume its input is pre-filtered — any
 * message marked `role: "system"` or `metadata.type === "system"` is dropped.
 *
 * Marked `role="log"`, which implies `aria-live="polite"`; no explicit
 * aria-live is set (doubling them makes screen readers announce twice).
 *
 * ## Props
 * | Prop            | Type          | Default | Description                     |
 * |-----------------|---------------|---------|---------------------------------|
 * | messages        | ChatMessage[] | []      | Full message list (unfiltered)  |
 * | maxVisibleChars | number        | 600     | Passed to each message          |
 * | packetSchemas   | Record<...>   | {}      | Passed to each message          |
 * | markdown        | boolean       | true    | Passed to each message          |
 * | showAvatars     | boolean       | true    | Render avatars                  |
 * | actions         | boolean       | true    | Show per-message actions        |
 * | userName / assistantName / userAvatar / assistantAvatar — identity labels  |
 *
 * ## Events
 * | Event       | Payload               | Description               |
 * |-------------|-----------------------|---------------------------|
 * | applyPacket | ChatPacket            | Apply a packet            |
 * | retry       | -                     | Retry the failed turn     |
 * | feedback    | { message, feedback } | Rate an assistant message |
 *
 * ## Slots
 * | Slot          | Description                          |
 * |---------------|--------------------------------------|
 * | packet-{type} | Forwarded down to each message       |
 * | empty         | Shown when there is nothing to render|
 */
-->

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { DanxButton } from "../button";
import ChatMessageGroup from "./ChatMessageGroup.vue";
import { useChatGrouping } from "./useChatGrouping";
import { useChatAutoScroll } from "./useChatAutoScroll";
import { fDayLabel } from "../../shared/formatters/relativeTime";
import type {
  ChatFeedback,
  ChatMessage,
  ChatPacket,
  ChatPacketSchema,
  ChatPacketSlotProps,
} from "./types";

const props = withDefaults(
  defineProps<{
    messages?: ChatMessage[];
    maxVisibleChars?: number;
    packetSchemas?: Record<string, ChatPacketSchema>;
    markdown?: boolean;
    showAvatars?: boolean;
    actions?: boolean;
    userName?: string;
    assistantName?: string;
    userAvatar?: string;
    assistantAvatar?: string;
  }>(),
  {
    messages: () => [],
    maxVisibleChars: 600,
    packetSchemas: () => ({}),
    markdown: true,
    showAvatars: true,
    actions: true,
    userName: "You",
    assistantName: "Assistant",
  }
);

const emit = defineEmits<{
  applyPacket: [packet: ChatPacket];
  retry: [];
  feedback: [payload: { message: ChatMessage; feedback: ChatFeedback }];
}>();

defineSlots<{ [key: string]: (props: ChatPacketSlotProps) => unknown }>();

const { visibleMessages, groups } = useChatGrouping(toRef(props, "messages") as never);

const scroller = ref<HTMLElement | null>(null);
const { hasUnread, onScroll, scrollToBottom } = useChatAutoScroll({
  container: scroller,
  // Re-pin on any change to the rendered content, including streamed text
  // growing inside an existing message.
  trigger: () => visibleMessages.value.map((m) => m.text?.length ?? 0).join(","),
});

const isEmpty = computed(() => visibleMessages.value.length === 0);
</script>

<template>
  <div class="danx-agent-chat__body">
    <div
      ref="scroller"
      class="danx-agent-chat-list"
      role="log"
      aria-label="Conversation"
      data-testid="chat-log"
      @scroll="onScroll"
    >
      <div v-if="isEmpty" class="danx-agent-chat-empty">
        <slot name="empty" />
      </div>

      <TransitionGroup
        v-else
        tag="div"
        class="danx-agent-chat-list__inner"
        enter-active-class="danx-agent-chat-enter-active"
        enter-from-class="danx-agent-chat-enter-from"
      >
        <template v-for="group in groups" :key="group.id">
          <div v-if="group.dayBoundary" :key="`${group.id}-day`" class="danx-agent-chat-day">
            {{ fDayLabel(group.timestamp) }}
          </div>

          <ChatMessageGroup
            :group="group"
            :show-avatar="showAvatars"
            :user-name="userName"
            :assistant-name="assistantName"
            :user-avatar="userAvatar"
            :assistant-avatar="assistantAvatar"
            :max-visible-chars="maxVisibleChars"
            :packet-schemas="packetSchemas"
            :markdown="markdown"
            :actions="actions"
            @apply-packet="emit('applyPacket', $event)"
            @retry="emit('retry')"
            @feedback="emit('feedback', $event)"
          >
            <template v-for="(_, name) in $slots" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps ?? {}" />
            </template>
          </ChatMessageGroup>
        </template>
      </TransitionGroup>
    </div>

    <!-- Only offered once the user has scrolled away from the newest message -->
    <DanxButton
      v-if="hasUnread"
      class="danx-agent-chat__jump"
      size="xs"
      variant="muted"
      icon="chevron-down"
      data-testid="jump-to-latest"
      @click="scrollToBottom()"
    >
      New messages
    </DanxButton>
  </div>
</template>
