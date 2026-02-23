<script setup>
import { ref } from "vue";
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

const logs = ref(
  Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - (5000 - i) * 1000).toISOString().slice(11, 23),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  }))
);

const keyFn = (item) => item.id;

function levelColor(level) {
  if (level === "ERROR") return "color: var(--color-danger)";
  if (level === "WARN") return "color: var(--color-warning)";
  if (level === "DEBUG") return "color: var(--color-text-subtle)";
  return "color: var(--color-info)";
}
</script>

<template>
  <DanxVirtualScroll
    :items="logs"
    :default-item-height="28"
    :overscan="5"
    :key-fn="keyFn"
    size="sm"
    class="w-full h-[400px] border border-border rounded-lg bg-gray-950 font-mono text-xs"
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
