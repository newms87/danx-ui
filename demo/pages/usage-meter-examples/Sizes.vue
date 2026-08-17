<script setup lang="ts">
import { DanxUsageMeter } from "danx-ui";

const segments = [
  { id: "reads", label: "Reads", value: 4100, variant: "info" },
  { id: "writes", label: "Writes", value: 1800, variant: "success" },
  { id: "admin", label: "Admin", value: 300, variant: "warning" },
];
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxUsageMeter label="Small" size="sm" :total="10000" :segments="segments" />
    <DanxUsageMeter label="Medium (default)" size="md" :total="10000" :segments="segments" />
    <DanxUsageMeter label="Large" size="lg" :total="10000" :segments="segments" />
  </div>
</template>
