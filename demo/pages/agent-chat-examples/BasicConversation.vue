<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A mock ChatAdapter — DanxAgentChat ships no default implementation, so
// every consumer (including this demo) provides its own. Real adapters call
// an app's own backend proxy instead of an in-memory object.
function createMockAdapter() {
  const threads = {};
  let nextId = 1;

  return {
    async resolveThread({ contextType, contextId }) {
      await delay(150);
      const threadId = `${contextType}:${contextId}`;
      if (!threads[threadId]) threads[threadId] = [];
      return { thread_id: threadId };
    },
    async getThread(threadId) {
      await delay(100);
      return { messages: threads[threadId] || [] };
    },
    async sendMessage(threadId, text) {
      await delay(250);
      const timestamp = new Date().toISOString();
      threads[threadId].push({ id: `local-${nextId++}`, role: "user", text, timestamp });
      const reply = `Got it — you said "${text}". Try sending a few messages in a row to see the serial queue strip.`;
      threads[threadId].push({
        id: `local-${nextId++}`,
        role: "assistant",
        text: reply,
        timestamp,
      });
      return { dispatched: false, reply };
    },
    async getJob() {
      return { status: "complete" };
    },
  };
}

const mockAdapter = createMockAdapter();
</script>

<template>
  <div class="h-[420px] w-full max-w-md rounded-lg border border-[var(--color-border)] p-3">
    <DanxAgentChat
      context-type="demo"
      context-id="basic-conversation"
      :api-adapter="mockAdapter"
      initial-message="Hi! What can you help me with?"
    />
  </div>
</template>
