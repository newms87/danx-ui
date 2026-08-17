<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createEscalationAdapter } from "./useChatDemo.js";

const adapter = createEscalationAdapter();
</script>

<template>
  <div class="h-[520px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="escalated"
      title="Long-running work"
      :api-adapter="adapter"
      :packet-schemas="{ sql_query: { label: 'SQL', icon: 'database', applyLabel: 'Apply' } }"
      empty-title="Escalated jobs"
      empty-description="Complex asks dispatch a background job. Steps and elapsed time stream in while it runs; Stop cancels it."
      :suggestions="['Analyze call volume by region']"
    >
      <template #packet-sql_query="{ packet }">
        <pre class="overflow-x-auto rounded bg-[var(--color-surface-sunken)] p-2 text-xs">{{ packet.payload.sql }}</pre>
      </template>
    </DanxAgentChat>
  </div>
</template>
