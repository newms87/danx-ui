<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

const content = `Fenced code blocks become nested **CodeViewer** instances, so they get syntax
highlighting and a copy button — and they always keep their declared language.

\`\`\`typescript
interface MarkdownContentProps {
  content: string;
  defaultCodeFormat?: "json" | "yaml";
}
\`\`\`

\`\`\`bash
yarn add danx-ui
yarn dev
\`\`\`

\`\`\`json
{ "component": "MarkdownContent", "editable": false }
\`\`\`

\`\`\`css
.docs-body {
  --dx-mde-content-link: #2563eb;
}
\`\`\`
`;
</script>

<template>
  <MarkdownContent :content="content" />
</template>
