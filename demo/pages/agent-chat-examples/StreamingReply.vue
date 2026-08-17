<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createStreamingAdapter } from "./useChatDemo.js";

const adapter = createStreamingAdapter();
</script>

<template>
  <div class="h-[480px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="streaming"
      title="Streaming"
      :api-adapter="adapter"
      empty-title="Watch it stream"
      empty-description="Tokens appear as they arrive. Press Stop mid-answer — the partial reply is kept."
      :suggestions="['Tell me about streaming']"
    />
  </div>
</template>
