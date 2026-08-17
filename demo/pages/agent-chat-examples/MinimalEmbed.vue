<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createBasicAdapter } from "./useChatDemo.js";

const adapter = createBasicAdapter();
</script>

<template>
  <div class="h-[360px] w-full max-w-sm rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="minimal"
      :api-adapter="adapter"
      :show-header="false"
      :show-avatars="false"
      :message-actions="false"
      :markdown="false"
      placeholder="Ask a quick question…"
      empty-title="Minimal"
      empty-description="Header, avatars, actions and markdown all switched off."
    />
  </div>
</template>
