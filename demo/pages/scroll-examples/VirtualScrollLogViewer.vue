<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
const messages = [
  "Request received from 192.168.1.42",
  "Database query executed in 23ms",
  "Cache miss for key user:1234",
  "Connection pool: 5/10 active",
  "Failed to parse JSON payload\n  at line 42, column 8\n  unexpected token '}'",
  "Retrying operation (attempt 2/3)",
  "Memory usage: 256MB / 512MB",
  "Background job completed: email_batch_42",
  "Rate limit exceeded for client api-key-xyz",
  "SSL certificate expires in 14 days",
  "Worker process spawned (PID 12847)",
  "Slow query detected (>500ms):\n  SELECT * FROM orders\n  WHERE created_at > '2024-01-01'\n  ORDER BY total DESC",
];

let nextId = 100;

function createLog() {
  return {
    id: nextId++,
    timestamp: new Date().toISOString().slice(11, 23),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  };
}

const logs = ref(Array.from({ length: 100 }, () => createLog()));
const scrollPosition = ref(0);
const autoScroll = ref(true);

const keyFn = (item) => item.id;

function levelColor(level) {
  if (level === "ERROR") return "color: var(--color-danger)";
  if (level === "WARN") return "color: var(--color-warning)";
  if (level === "DEBUG") return "color: var(--color-text-subtle)";
  return "color: var(--color-info)";
}

// Auto-scroll to bottom when new logs arrive (if autoScroll is on)
function scrollToBottom() {
  if (autoScroll.value) {
    scrollPosition.value = logs.value.length - 1;
  }
}

// Detect when user scrolls away from the bottom — pause auto-scroll.
// Resume when they scroll back to the bottom.
function onScrollPositionUpdate(index) {
  autoScroll.value = index >= logs.value.length - 20;
}

let timer = null;

function scheduleNextLog() {
  timer = setTimeout(
    () => {
      logs.value = [...logs.value, createLog()];
      nextTick(scrollToBottom);
      scheduleNextLog();
    },
    1000 + Math.random() * 4000
  );
}

onMounted(() => {
  nextTick(scrollToBottom);
  scheduleNextLog();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="flex items-center gap-3 mb-3 text-sm">
    <span class="font-medium">{{ logs.length }} lines</span>
    <span :class="autoScroll ? 'text-green-500' : 'text-gray-400'">
      {{ autoScroll ? "Auto-scrolling" : "Paused — scroll to bottom to resume" }}
    </span>
  </div>

  <DanxVirtualScroll
    v-model:scrollPosition="scrollPosition"
    :items="logs"
    :default-item-height="28"
    :overscan="5"
    :key-fn="keyFn"
    size="sm"
    class="w-full h-[400px] border border-border rounded-lg bg-gray-950 font-mono text-xs"
    @update:scrollPosition="onScrollPositionUpdate"
  >
    <template #item="{ item }">
      <div class="flex gap-3 px-3 py-1 border-b border-gray-800 whitespace-pre-wrap">
        <span class="text-gray-500 shrink-0">{{ item.timestamp }}</span>
        <span class="shrink-0 w-12 font-bold" :style="levelColor(item.level)">{{
          item.level
        }}</span>
        <span class="text-gray-300">{{ item.message }}</span>
      </div>
    </template>
  </DanxVirtualScroll>
</template>
