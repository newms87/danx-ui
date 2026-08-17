<!--
/**
 * ChatMessageList Component
 *
 * The scrolling agent-chat thread. Pins to the bottom as new messages arrive
 * and — as a reusable component that must not assume its input is
 * pre-filtered — drops any bookkeeping message (`metadata.type === "system"`)
 * so it never renders in the conversation. Internal to the agent-chat
 * component tree (not exported from the package).
 *
 * ## Props
 * | Prop            | Type                     | Default | Description                      |
 * |-----------------|--------------------------|---------|-----------------------------------|
 * | messages        | ChatMessage[]            | []      | Full message list (unfiltered)    |
 * | maxVisibleChars | number                   | 600     | Passed through to each bubble     |
 * | packetSchemas   | Record<string, ChatPacketSchema> | {} | Passed through to each bubble |
 *
 * ## Slots
 * | Slot              | Description                                          |
 * |-------------------|-------------------------------------------------------|
 * | packet-{type}     | Forwarded down to each ChatMessageBubble              |
 */
-->

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import ChatMessageBubble from "./ChatMessageBubble.vue";
import type { ChatMessage, ChatPacketSchema } from "./types";

const props = withDefaults(
  defineProps<{
    messages?: ChatMessage[];
    maxVisibleChars?: number;
    packetSchemas?: Record<string, ChatPacketSchema>;
  }>(),
  {
    messages: () => [],
    maxVisibleChars: 600,
    packetSchemas: () => ({}),
  }
);

defineSlots<{
  [key: string]: (props: { packet: NonNullable<ChatMessage["packet"]> }) => unknown;
}>();

function isSystem(message: ChatMessage): boolean {
  return message.role === "system" || message.metadata?.type === "system";
}

const visibleMessages = computed(() => (props.messages || []).filter((m) => !isSystem(m)));

const bottom = ref<HTMLElement | null>(null);
watch(
  () => visibleMessages.value.length,
  async () => {
    await nextTick();
    bottom.value?.scrollIntoView?.({ block: "end" });
  }
);
</script>

<template>
  <div class="danx-agent-chat-list">
    <div class="danx-agent-chat-list__inner">
      <ChatMessageBubble
        v-for="message in visibleMessages"
        :key="message.id"
        :message="message"
        :max-visible-chars="maxVisibleChars"
        :packet-schemas="packetSchemas"
      >
        <!-- forward every #packet-{type} slot down to the bubble -->
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
      </ChatMessageBubble>
      <div ref="bottom" class="danx-agent-chat-list__sentinel" aria-hidden="true"></div>
    </div>
  </div>
</template>
