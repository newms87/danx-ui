<script setup lang="ts">
import { ref } from "vue";
import { DanxAgentChat } from "danx-ui";
import { createAttachmentAdapter } from "./useChatDemo.js";

const adapter = createAttachmentAdapter();
const opened = ref("");

function onOpen(file) {
  opened.value = `${file.name} (${file.mime})`;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      class="h-[560px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden"
    >
      <DanxAgentChat
        context-type="demo"
        context-id="attachments"
        title="With attachments"
        :api-adapter="adapter"
        @open-attachment="onOpen"
      />
    </div>
    <p class="text-sm text-slate-500">
      Clicked attachment: {{ opened || "none yet — click a file above" }}
    </p>
  </div>
</template>
