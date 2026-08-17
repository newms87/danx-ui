<script setup lang="ts">
import { DanxUsageMeter } from "danx-ui";

const health = [
  { id: "healthy", label: "Healthy", value: 40, variant: "success" },
  { id: "degraded", label: "Degraded", value: 25, variant: "warning" },
  { id: "failing", label: "Failing", value: 10, variant: "danger" },
];

const single = [{ id: "used", label: "Used", value: 62 }];

const teams = [
  { id: "platform", label: "Platform", value: 30, color: "var(--color-teal-500)" },
  { id: "growth", label: "Growth", value: 25, color: "var(--color-fuchsia-500)" },
  { id: "bugfix", label: "Bugfix", value: 15, color: "var(--color-orange-400)" },
];
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxUsageMeter label="Per-segment variants" :total="100" :segments="health" />

    <DanxUsageMeter
      label="One variant for the meter"
      variant="info"
      :total="100"
      :segments="single"
    />

    <DanxUsageMeter label="Explicit colors" :total="100" :segments="teams" />
  </div>
</template>
