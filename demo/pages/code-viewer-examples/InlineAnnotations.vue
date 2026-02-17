<script setup lang="ts">
import { ref } from "vue";
import { CodeViewer } from "danx-ui";

const data = ref({
  name: "",
  version: "0.1.0",
  config: {
    theme: "invalid-theme",
    maxRetries: -1,
  },
  tags: ["alpha", "beta", ""],
});

const annotations = ref([
  { path: "name", message: "Name is required", type: "error" },
  { path: "config.theme", message: 'Must be "dark" or "light"', type: "warning" },
  { path: "config.maxRetries", message: "Must be a non-negative integer", type: "error" },
  { path: "tags.2", message: "Empty tags are not allowed", type: "info" },
]);
</script>

<template>
  <div class="flex gap-4">
    <CodeViewer :model-value="data" format="json" :annotations="annotations" class="flex-1" />
    <CodeViewer :model-value="data" format="yaml" :annotations="annotations" class="flex-1" />
  </div>
</template>
