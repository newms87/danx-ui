<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref(
  "Try pasting rich content copied from Word, Google Docs, or a web page here.\n\n" +
    "Hold **Shift** while pasting to insert the clipboard's plain text instead, " +
    "skipping HTML normalization entirely."
);
</script>

<template>
  <div class="w-full">
    <MarkdownEditor v-model="content" placeholder="Paste some content..." />
  </div>
</template>
