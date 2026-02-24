<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("Type some **markdown** here...");
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <MarkdownEditor v-model="content" />
    <details class="text-[0.8125rem]">
      <summary class="cursor-pointer opacity-70">View raw markdown</summary>
      <pre class="mt-2 p-3 bg-black/10 rounded-md whitespace-pre-wrap text-xs">{{ content }}</pre>
    </details>
  </div>
</template>
