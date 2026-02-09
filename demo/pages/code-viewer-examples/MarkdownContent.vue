<script setup lang="ts">
import { CodeViewer } from "danx-ui";

const markdown = `# CodeViewer Markdown Mode

Supports **bold**, *italic*, and \`inline code\`.

## Features

- Syntax highlighted code blocks
- Nested language support
- Dark and light themes

\`\`\`yaml
server:
  host: localhost
  port: 3000
\`\`\`

> Blockquotes are rendered with styling too.

| Feature   | Supported |
|-----------|-----------|
| Headings  | Yes       |
| Lists     | Yes       |
| Tables    | Yes       |
`;
</script>

<template>
  <CodeViewer :model-value="markdown" format="markdown" />
</template>
