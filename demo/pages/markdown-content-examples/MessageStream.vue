<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

// MarkdownContent has no editor surface, so rendering many instances stays cheap.
const messages = [
  {
    id: 1,
    author: "user",
    body: "Can you show me how to **install** the library?",
  },
  {
    id: 2,
    author: "agent",
    body: `Sure — install it and import the styles:

\`\`\`bash
yarn add danx-ui
\`\`\`

Then in your entry file:

\`\`\`javascript
import "danx-ui/styles.css";
\`\`\`

Let me know if you hit anything unexpected.`,
  },
  {
    id: 3,
    author: "user",
    body: "What about *theming*?",
  },
  {
    id: 4,
    author: "agent",
    body: `Override the tokens on any ancestor:

| Token | Styles |
|-------|--------|
| \`--dx-mde-content-link\` | Link color |
| \`--dx-mde-content-code-bg\` | Inline code background |

> Full list is in the theming docs.`,
  },
];
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div
      v-for="message in messages"
      :key="message.id"
      class="rounded border border-slate-600 p-3"
      :class="message.author === 'user' ? 'bg-slate-800' : 'bg-slate-900'"
    >
      <div class="mb-2 text-xs uppercase tracking-wide text-slate-400">
        {{ message.author }}
      </div>
      <MarkdownContent :content="message.body" />
    </div>
  </div>
</template>
