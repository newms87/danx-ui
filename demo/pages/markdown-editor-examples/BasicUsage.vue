<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("Type some **markdown** here...");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
    <MarkdownEditor v-model="content" />
    <details style="font-size: 0.8125rem;">
      <summary style="cursor: pointer; opacity: 0.7;">View raw markdown</summary>
      <pre style="margin: 0.5rem 0 0; padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 0.375rem; white-space: pre-wrap; font-size: 0.75rem;">{{ content }}</pre>
    </details>
  </div>
</template>
