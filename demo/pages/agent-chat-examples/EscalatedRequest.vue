<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulates a backend that ESCALATES a "complex" request to a background job
// instead of replying synchronously — DanxAgentChat shows a "Working on it…"
// placeholder and polls getJob until it reaches a terminal status.
function createMockAdapter() {
  const threads = {};
  const jobs = {};
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
      await delay(200);
      threads[threadId].push({
        id: `local-${nextId++}`,
        role: "user",
        text,
        timestamp: new Date().toISOString(),
      });

      const jobId = `job-${nextId++}`;
      jobs[jobId] = { threadId, pollCount: 0 };
      return { dispatched: true, job_id: jobId };
    },
    async getJob(jobId) {
      await delay(700);
      const job = jobs[jobId];
      job.pollCount += 1;
      // "Completes" after a couple of polls, so the working state is visible.
      if (job.pollCount < 2) return { status: "running" };

      threads[job.threadId].push({
        id: `local-${nextId++}`,
        role: "assistant",
        text: "Finished the long-running analysis.",
        packet: {
          type: "sql_query",
          payload: { sql: "SELECT region, SUM(volume) FROM calls GROUP BY region" },
          valid: true,
        },
        timestamp: new Date().toISOString(),
      });
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
      context-id="escalated-request"
      :api-adapter="mockAdapter"
      :packet-schemas="{ sql_query: { label: 'SQL' } }"
      placeholder="Type anything — every send escalates in this demo"
    />
  </div>
</template>
