<script setup lang="ts">
import { CodeViewer } from "danx-ui";

const data = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "editor" },
    { id: 3, name: "Charlie", role: "viewer" },
  ],
  pagination: { page: 1, total: 42 },
};
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <p class="text-sm opacity-70">
      Click the collapsed preview to expand:
    </p>
    <CodeViewer :model-value="data" collapsible :default-collapsed="true" />
  </div>
</template>
