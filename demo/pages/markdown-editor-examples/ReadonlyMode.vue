<script setup lang="ts">
import { MarkdownEditor } from "danx-ui";

const content = `# Readonly Markdown

This editor is in **readonly** mode. The content is rendered but cannot be edited.

- Item one
- Item two
- Item three

> Blockquotes display correctly in readonly mode too.`;
</script>

<template>
  <div class="w-full">
    <MarkdownEditor :model-value="content" readonly />
  </div>
</template>
