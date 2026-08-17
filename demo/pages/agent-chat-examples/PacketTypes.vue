<script setup lang="ts">
import { ref } from "vue";
import { DanxAgentChat, DanxAlert } from "danx-ui";
import { createPacketAdapter } from "./useChatDemo.js";

const adapter = createPacketAdapter();
const appliedSql = ref("");

// The real SMS-Analytics consumer applies a packet to its SQL editor only when
// validation passed — invalid packets are rendered but never applied.
function onApply(packet) {
  if (packet.type === "sql_query" && packet.valid !== false) {
    appliedSql.value = packet.payload.sql;
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <DanxAlert v-if="appliedSql" variant="success" title="Applied to editor">
      <code class="text-xs">{{ appliedSql }}</code>
    </DanxAlert>

    <div class="h-[520px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
      <DanxAgentChat
        context-type="demo"
        context-id="packets"
        title="Typed results"
        :api-adapter="adapter"
        :packet-schemas="{
          sql_query: { label: 'SQL', icon: 'database', applyLabel: 'Apply to editor' },
          chart_data: { label: 'Chart', icon: 'table-columns', applyLabel: 'Use chart' },
        }"
        empty-title="Typed packets"
        empty-description="Each reply can carry a structured result the app renders and applies."
        :suggestions="[
          'Give me a query',
          'Show me a chart',
          'Try to drop a table',
          'Send something I can repair',
          'Return an unknown packet',
        ]"
        @apply-packet="onApply"
      >
        <template #packet-sql_query="{ packet }">
          <pre class="overflow-x-auto rounded bg-[var(--color-surface-sunken)] p-2 text-xs">{{ packet.payload.sql }}</pre>
        </template>

        <template #packet-chart_data="{ packet }">
          <div class="flex h-20 items-end gap-2">
            <div
              v-for="(value, i) in packet.payload.values"
              :key="i"
              class="flex-1 rounded-t bg-[var(--color-interactive)]"
              :style="{ height: (value / 19) * 100 + '%' }"
            />
          </div>
          <div class="mt-1 flex gap-2 text-xs text-[var(--color-text-muted)]">
            <span v-for="label in packet.payload.labels" :key="label" class="flex-1 text-center">{{ label }}</span>
          </div>
        </template>
      </DanxAgentChat>
    </div>
  </div>
</template>
