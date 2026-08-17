<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

const content = `# Release Notes

MarkdownContent renders markdown **read-only** — no editor, no toolbar, no
contenteditable. Just the rendered result.

It handles *italic*, **bold**, \`inline code\`, [links](https://example.com),
and ~~strikethrough~~ inline, plus every block type markdown offers.

> Reach for it whenever you are *displaying* markdown rather than authoring it.
`;
</script>

<template>
  <MarkdownContent :content="content" />
</template>
