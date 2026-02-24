<script setup lang="ts">
import { CodeViewer } from "danx-ui";

const data = {
  theme: "comparison",
  colors: { primary: "#2563eb", accent: "#7c3aed" },
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div>
      <p class="mb-2 text-sm font-semibold">Dark (default)</p>
      <CodeViewer :model-value="data" theme="dark" />
    </div>
    <div>
      <p class="mb-2 text-sm font-semibold">Light</p>
      <CodeViewer :model-value="data" theme="light" />
    </div>
  </div>
</template>
