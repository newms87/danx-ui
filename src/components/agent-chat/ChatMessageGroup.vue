<!--
/**
 * ChatMessageGroup Component
 *
 * One run of consecutive messages from the same sender: a single avatar and
 * meta row (author + time) followed by the run's messages. Internal to the
 * agent-chat tree.
 *
 * Grouping is what makes a transcript scannable — repeating the avatar and
 * timestamp on every message is the fastest way to make a chat feel cluttered
 * and unfinished, especially at sidebar widths.
 *
 * ## Props
 * | Prop            | Type             | Default | Description                       |
 * |-----------------|------------------|---------|-----------------------------------|
 * | group           | ChatMessageGroup | -       | The run to render (required)      |
 * | showAvatar      | boolean          | true    | Render the avatar column          |
 * | userName        | string           | "You"   | Author label for user runs        |
 * | assistantName   | string           | -       | Author label for assistant runs   |
 * | userAvatar      | string           | -       | Avatar image for user runs        |
 * | assistantAvatar | string           | -       | Avatar image for assistant runs   |
 * | maxVisibleChars | number           | 600     | Passed to each message            |
 * | packetSchemas   | Record<...>      | {}      | Passed to each message            |
 * | markdown        | boolean          | true    | Passed to each message            |
 * | actions         | boolean          | true    | Show per-message actions          |
 *
 * ## Events
 * | Event       | Payload                     | Description                |
 * |-------------|-----------------------------|-----------------------------|
 * | applyPacket | ChatPacket                  | Apply a packet              |
 * | retry       | -                           | Retry the failed turn       |
 * | feedback    | { message, feedback }       | Rate an assistant message   |
 *
 * ## Slots
 * | Slot          | Description                         |
 * |---------------|-------------------------------------|
 * | packet-{type} | Forwarded down to each message      |
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxAvatar } from "../avatar";
import { DanxTooltip } from "../tooltip";
import ChatMessageBubble from "./ChatMessageBubble.vue";
import ChatMessageActions from "./ChatMessageActions.vue";
import { fAbsoluteTime, fClockTime } from "../../shared/formatters/relativeTime";
import type { ChatMessageGroup } from "./useChatGrouping";
import type {
  ChatFeedback,
  ChatMessage,
  ChatPacket,
  ChatPacketSchema,
  ChatPacketSlotProps,
} from "./types";

const props = withDefaults(
  defineProps<{
    group: ChatMessageGroup;
    showAvatar?: boolean;
    userName?: string;
    assistantName?: string;
    userAvatar?: string;
    assistantAvatar?: string;
    maxVisibleChars?: number;
    packetSchemas?: Record<string, ChatPacketSchema>;
    markdown?: boolean;
    actions?: boolean;
  }>(),
  {
    showAvatar: true,
    userName: "You",
    assistantName: "Assistant",
    maxVisibleChars: 600,
    packetSchemas: () => ({}),
    markdown: true,
    actions: true,
  }
);

const emit = defineEmits<{
  applyPacket: [packet: ChatPacket];
  openAttachment: [file: ChatAttachment];
  retry: [];
  feedback: [payload: { message: ChatMessage; feedback: ChatFeedback }];
}>();

defineSlots<{ [key: string]: (props: ChatPacketSlotProps) => unknown }>();

const isUser = computed(() => props.group.role === "user");
const authorName = computed(
  () => props.group.author || (isUser.value ? props.userName : props.assistantName)
);
const avatarSrc = computed(() => (isUser.value ? props.userAvatar : props.assistantAvatar));
const clock = computed(() => fClockTime(props.group.timestamp));
const absolute = computed(() => fAbsoluteTime(props.group.timestamp));

/** The last message carries the run's actions — one toolbar per turn, not per line. */
const lastMessage = computed(() => props.group.messages[props.group.messages.length - 1]!);
const retryable = computed(() => props.group.messages.some((m) => m.retryable));
const actionText = computed(() =>
  props.group.messages
    .map((m) => m.text ?? "")
    .filter(Boolean)
    .join("\n\n")
);
</script>

<template>
  <article
    class="danx-agent-chat-group"
    :class="{
      'danx-agent-chat-group--user': isUser,
      'danx-agent-chat-group--assistant': !isUser,
    }"
    :aria-label="`${authorName}${clock ? `, ${clock}` : ''}`"
  >
    <DanxAvatar
      v-if="showAvatar"
      class="danx-agent-chat-group__avatar"
      :src="avatarSrc"
      :name="authorName"
      :icon="!avatarSrc && !isUser ? 'code' : undefined"
      shape="square"
      :size="22"
    />

    <div class="danx-agent-chat-group__column">
      <div class="danx-agent-chat-group__meta">
        <span class="danx-agent-chat-group__author">{{ authorName }}</span>
        <DanxTooltip v-if="clock" :tooltip="absolute">
          <template #trigger>
            <time :datetime="group.timestamp" data-testid="group-time">{{ clock }}</time>
          </template>
        </DanxTooltip>
      </div>

      <ChatMessageBubble
        v-for="message in group.messages"
        :key="message.id"
        :message="message"
        :max-visible-chars="maxVisibleChars"
        :packet-schemas="packetSchemas"
        :markdown="markdown"
        @apply-packet="emit('applyPacket', $event)"
        @open-attachment="emit('openAttachment', $event)"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
      </ChatMessageBubble>

      <ChatMessageActions
        v-if="actions && !lastMessage.working"
        :text="actionText"
        :can-retry="retryable"
        :show-feedback="!isUser && !retryable"
        :feedback="lastMessage.feedback"
        @retry="emit('retry')"
        @feedback="emit('feedback', { message: lastMessage, feedback: $event })"
      />
    </div>
  </article>
</template>
