<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const color = ref("#22c55e");
const swatches = [
  "#000000",
  "#374151",
  "#9ca3af",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
];
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker
      v-model="color"
      label="Accent"
      :swatches="swatches"
      :paletteCols="8"
      storageKey="demo-palette"
    />
    <div class="text-sm text-text-muted">
      Open the swatch — palette + recents (persisted under <code>demo-palette</code>) are visible.
    </div>
  </div>
</template>
