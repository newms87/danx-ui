<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createBasicAdapter } from "./useChatDemo.js";

const adapter = createBasicAdapter();
</script>

<template>
  <div class="agent-chat-branded h-[460px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="theming"
      title="Branded"
      :api-adapter="adapter"
      empty-title="Fully themeable"
      empty-description="Every surface is a --dx-agent-chat-* token. No styling props required."
      :suggestions="['Say something']"
    />
  </div>
</template>

<style>
.agent-chat-branded {
  --dx-agent-chat-user-bg: var(--color-info-subtle);
  --dx-agent-chat-user-radius: 1.125rem;
  --dx-agent-chat-gap-inter: 1.75rem;
  --dx-agent-chat-avatar-size: 1.75rem;
  --dx-agent-chat-composer-radius: 1.25rem;
  --dx-agent-chat-composer-focus-border: var(--color-success);
  --dx-agent-chat-caret-color: var(--color-success);
}
</style>
