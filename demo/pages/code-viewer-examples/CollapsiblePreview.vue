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
  <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
    <p style="margin: 0; font-size: 0.875rem; opacity: 0.7;">
      Click the collapsed preview to expand:
    </p>
    <CodeViewer :model-value="data" collapsible :default-collapsed="true" />
  </div>
</template>
