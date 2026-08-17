<script setup lang="ts">
import { ref } from "vue";
import { MarkdownContent } from "danx-ui";

const source = ref(`## Type on the left

Every keystroke re-tokenizes and re-renders.

- Lists update instantly
- So do | tables |
- And \`code spans\`

> MarkdownContent is cheap enough to re-render on every keystroke.
`);
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    <textarea
      v-model="source"
      rows="14"
      class="w-full rounded border border-slate-600 bg-slate-900 p-3 font-mono text-sm text-slate-100"
    />
    <div class="rounded border border-slate-600 p-3">
      <MarkdownContent :content="source" />
    </div>
  </div>
</template>
