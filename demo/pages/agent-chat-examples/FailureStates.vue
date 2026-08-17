<script setup lang="ts">
import { ref, computed } from "vue";
import { DanxAgentChat, DanxButtonGroup } from "danx-ui";
import { createFailureAdapter } from "./useChatDemo.js";

const mode = ref("unavailable");
const modes = [
  { label: "Chat unavailable", value: "unavailable" },
  { label: "Send fails (retryable)", value: "send-failed" },
  { label: "Job fails", value: "job-failed" },
];

// A fresh adapter per mode; the key below remounts the chat when it changes.
const adapter = computed(() => createFailureAdapter(mode.value));
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <DanxButtonGroup v-model="mode" :items="modes" size="sm" />

    <div class="h-[440px] w-full max-w-md rounded-xl border border-[var(--color-border)] overflow-hidden">
      <DanxAgentChat
        :key="mode"
        context-type="demo"
        :context-id="'failure-' + mode"
        title="Failure handling"
        :api-adapter="adapter"
        empty-title="Failures stay visible"
        empty-description="Nothing fails silently — every error is shown in place with a retry where one makes sense."
        :suggestions="['Run something that breaks']"
      />
    </div>
  </div>
</template>
