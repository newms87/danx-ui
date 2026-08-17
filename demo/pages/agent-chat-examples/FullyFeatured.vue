<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createBasicAdapter } from "./useChatDemo.js";

const adapter = createBasicAdapter();
</script>

<template>
  <div class="h-[520px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="fully-featured"
      title="SQL Assistant"
      assistant-name="Danx"
      user-name="You"
      :api-adapter="adapter"
      empty-title="How can I help?"
      empty-description="I can query your call data and explain what I find."
      :suggestions="[
        'Show me the top routes this week',
        'Which numbers are primary?',
        'Explain how routing works',
      ]"
      :max-length="2000"
    />
  </div>
</template>
