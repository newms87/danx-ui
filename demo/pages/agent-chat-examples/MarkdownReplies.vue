<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createMarkdownAdapter } from "./useChatDemo.js";

const adapter = createMarkdownAdapter();
</script>

<template>
  <div class="h-[520px] w-full max-w-lg rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="markdown"
      title="Markdown rendering"
      :api-adapter="adapter"
      empty-title="Ask anything"
      empty-description="Replies render as markdown — tables, code, lists and quotes."
      :suggestions="['Show me the top routes']"
    />
  </div>
</template>
