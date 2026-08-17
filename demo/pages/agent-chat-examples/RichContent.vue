<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { createRichAdapter } from "./useChatDemo.js";

const adapter = createRichAdapter();
</script>

<template>
  <div class="h-[520px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
    <DanxAgentChat
      context-type="demo"
      context-id="rich"
      title="Steps &amp; citations"
      :api-adapter="adapter"
      :max-visible-chars="320"
      empty-title="Show your work"
      empty-description="Tool calls collapse into flat rows; sources render as chips; long answers clamp behind Show more."
      :suggestions="['How does carrier routing work?']"
    />
  </div>
</template>
