<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createHistoryAdapter } from "./useChatDemo.js";

const adapter = createHistoryAdapter();
</script>

<template>
  <div class="h-[560px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="history"
      title="Existing thread"
      :api-adapter="adapter"
      :packet-schemas="{ sql_query: { label: 'SQL', icon: 'database', applyLabel: 'Apply' } }"
    >
      <template #packet-sql_query="{ packet }">
        <pre class="overflow-x-auto rounded bg-[var(--color-surface-sunken)] p-2 text-xs">{{ packet.payload.sql }}</pre>
      </template>
    </DanxAgentChat>
  </div>
</template>
