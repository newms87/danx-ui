<script setup lang="ts">
import { ref } from "vue";
import { CodeViewer } from "danx-ui";

const data = ref({
  name: "danx-ui",
  version: "0.1.0",
  features: ["buttons", "dialogs", "code-viewer", "markdown-editor"],
  config: {
    theme: "dark",
    language: "en",
    debug: false,
  },
});
</script>

<template>
  <CodeViewer :model-value="data" />
</template>
