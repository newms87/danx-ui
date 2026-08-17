<script setup lang="ts">
import { DanxUsageMeter } from "danx-ui";

const segments = [
  { id: "photos", label: "Photos", value: 180, variant: "info" },
  { id: "video", label: "Video", value: 120, variant: "warning" },
  { id: "documents", label: "Documents", value: 34, variant: "success" },
  { id: "system", label: "System", value: 40, variant: "muted" },
];

function formatGb(value) {
  return `${value} GB`;
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxUsageMeter
      label="Drive storage"
      :total="512"
      :segments="segments"
      :format-value="formatGb"
    />

    <p class="text-sm text-slate-500 dark:text-slate-400">
      Hover any slice for its label, size, and share of the drive.
    </p>
  </div>
</template>
