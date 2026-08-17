<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

const content = `### Themed via inherited tokens

MarkdownContent has no tokens of its own. It inherits \`--dx-mde-content-*\`
for the rendered elements and \`--dx-code-viewer-*\` for embedded code.

- A [link](https://example.com) picks up the link token
- \`inline code\` picks up the code tokens
- ==highlights== pick up the mark token

> Blockquotes pick up their own border, background, and text tokens.

\`\`\`json
{ "codeBlock": "inherits --dx-code-viewer-* tokens" }
\`\`\`
`;
</script>

<template>
  <div class="demo-themed-markdown w-full">
    <MarkdownContent :content="content" />
  </div>
</template>

<style>
.demo-themed-markdown {
  --dx-mde-content-link: #22d3ee;
  --dx-mde-content-code-bg: rgba(34, 211, 238, 0.15);
  --dx-mde-content-code-color: #67e8f9;
  --dx-mde-content-blockquote-border: #22d3ee;
  --dx-mde-content-blockquote-bg: rgba(34, 211, 238, 0.08);
  --dx-mde-content-mark-bg: rgba(34, 211, 238, 0.35);
  --dx-code-viewer-font-size: 0.8125rem;
}
</style>
