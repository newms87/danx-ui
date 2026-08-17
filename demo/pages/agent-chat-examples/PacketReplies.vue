<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Proves DanxAgentChat is genuinely backend-agnostic: the SAME component,
// with no changes, renders two INDEPENDENT packet types purely from what
// this mock adapter decides to send back — sql_query via a custom slot,
// chart_data via a different custom slot, and anything else falls back to
// the built-in JSON CodeViewer.
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

      const lower = text.toLowerCase();
      const reply = { id: `local-${nextId++}`, role: "assistant", timestamp };
      if (lower.includes("query") || lower.includes("sql")) {
        reply.packet = {
          type: "sql_query",
          payload: { sql: "SELECT id, name FROM routes WHERE active = true" },
          valid: true,
        };
        reply.text = "Here's the query.";
      } else if (lower.includes("chart") || lower.includes("graph")) {
        reply.packet = {
          type: "chart_data",
          payload: { labels: ["Mon", "Tue", "Wed"], values: [12, 19, 7] },
          valid: true,
        };
        reply.text = "Here's the breakdown.";
      } else {
        reply.text = `You asked: "${text}". Try asking for a "query" or a "chart".`;
      }
      threads[threadId].push(reply);

      return { dispatched: false, reply: reply.text, packet: reply.packet };
    },
    async getJob() {
      return { status: "complete" };
    },
  };
}

const mockAdapter = createMockAdapter();
</script>

<template>
  <div class="h-[480px] w-full max-w-md rounded-lg border border-[var(--color-border)] p-3">
    <DanxAgentChat
      context-type="demo"
      context-id="packet-replies"
      :api-adapter="mockAdapter"
      :packet-schemas="{ sql_query: { label: 'SQL' }, chart_data: { label: 'Chart' } }"
      placeholder="Try: 'show me a query' or 'show me a chart'"
    >
      <template #packet-sql_query="{ packet }">
        <pre class="overflow-x-auto rounded bg-[var(--color-surface-sunken)] p-2 text-xs">{{
          packet.payload.sql
        }}</pre>
      </template>
      <template #packet-chart_data="{ packet }">
        <div class="flex h-16 items-end gap-2">
          <div
            v-for="(value, i) in packet.payload.values"
            :key="i"
            class="flex-1 rounded-t bg-[var(--color-interactive)]"
            :style="{ height: `${(value / Math.max(...packet.payload.values)) * 100}%` }"
          />
        </div>
        <div class="mt-1 flex gap-2 text-xs">
          <span v-for="label in packet.payload.labels" :key="label" class="flex-1 text-center">{{
            label
          }}</span>
        </div>
      </template>
    </DanxAgentChat>
  </div>
</template>
