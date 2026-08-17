<script setup lang="ts">
import { ref } from "vue";
import { DanxAgentChat } from "danx-ui";
import { createBasicAdapter } from "./useChatDemo.js";

const adapter = createBasicAdapter();
const modelId = ref("opus");

const HOUR = 3600000;

const contextUsage = {
  total: 1000000,
  segments: [
    { id: "system", label: "System prompt", value: 40000, variant: "muted" },
    { id: "tools", label: "Tool definitions", value: 15400, variant: "warning" },
    { id: "history", label: "Conversation", value: 300000, variant: "info" },
  ],
};

const usageLimits = [
  {
    id: "5h",
    label: "5-hour limit",
    percent: 9,
    resetsAt: new Date(Date.now() + 3.5 * HOUR).toISOString(),
  },
  {
    id: "week-all",
    label: "Weekly · all models",
    percent: 20,
    resetsAt: new Date(Date.now() + 72 * HOUR).toISOString(),
  },
  {
    id: "week-fable",
    label: "Weekly · Fable",
    percent: 12,
    resetsAt: new Date(Date.now() + 72 * HOUR).toISOString(),
  },
];

const models = [
  { id: "fable", label: "Fable 5", shortcut: "1" },
  { id: "opus", label: "Opus 5", shortcut: "2" },
  { id: "sonnet", label: "Sonnet 5", shortcut: "3" },
  { id: "haiku", label: "Haiku 4.5", group: "More models" },
  { id: "opus48", label: "Opus 4.8", group: "More models" },
];
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      class="h-[560px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden"
    >
      <DanxAgentChat
        v-model:model="modelId"
        context-type="demo"
        context-id="session-bar"
        title="With telemetry"
        :api-adapter="adapter"
        :session-stats="{ elapsedMs: 94000, tokens: 1600, runningTasks: 1 }"
        :context-usage="contextUsage"
        :usage-limits="usageLimits"
        :models="models"
      />
    </div>
    <p class="text-sm text-slate-500">
      Click the counters above the composer for the context meter and quota rows. Selected model:
      <strong>{{ modelId }}</strong>
    </p>
  </div>
</template>
