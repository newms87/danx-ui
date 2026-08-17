<script setup lang="ts">
import { DanxUsageMeter, formatUsageValue } from "danx-ui";

const context = [
  { id: "instructions", label: "Instructions", value: 8200, variant: "muted" },
  { id: "history", label: "History", value: 46000, variant: "info" },
  { id: "attachments", label: "Attachments", value: 18400, variant: "warning" },
];

const budget = [
  { id: "salaries", label: "Salaries", value: 310000, variant: "info" },
  { id: "cloud", label: "Cloud", value: 95000, variant: "warning" },
  { id: "travel", label: "Travel", value: 12000, variant: "success" },
];

function formatDollars(value) {
  return `$${formatUsageValue(value)}`;
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxUsageMeter label="Default abbreviation" :total="128000" :segments="context" />

    <DanxUsageMeter
      label="Currency formatter"
      :total="500000"
      :segments="budget"
      :format-value="formatDollars"
    />

    <DanxUsageMeter
      label="Custom readout"
      :total="500000"
      :segments="budget"
      :format-value="formatDollars"
    >
      <template #readout="{ formattedRemaining, percentLabel }">
        {{ formattedRemaining }} left · {{ percentLabel }} committed
      </template>
    </DanxUsageMeter>
  </div>
</template>
