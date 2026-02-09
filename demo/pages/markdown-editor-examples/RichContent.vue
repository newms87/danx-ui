<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref(`# Rich Markdown Content

This demonstrates the **full range** of markdown features supported by the editor.

## Text Formatting

You can use **bold**, *italic*, and \`inline code\` in your text.

## Lists

- First item
- Second item with **bold**
- Third item

1. Numbered one
2. Numbered two
3. Numbered three

## Code Block

\`\`\`yaml
server:
  host: localhost
  port: 3000
\`\`\`

## Table

| Name    | Role   | Status |
|---------|--------|--------|
| Alice   | Admin  | Active |
| Bob     | Editor | Active |

## Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

## Link

Visit [danx-ui docs](https://example.com) for more information.`);
</script>

<template>
  <div style="width: 100%;">
    <MarkdownEditor v-model="content" />
  </div>
</template>
