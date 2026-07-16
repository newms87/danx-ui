<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDropdownMenu } from "danx-ui";

const lastSelection = ref("");

const items = [
  { label: "Cut", action: () => (lastSelection.value = "Cut") },
  { label: "Copy", action: () => (lastSelection.value = "Copy") },
  {
    label: "Share",
    children: [
      { label: "Email", action: () => (lastSelection.value = "Share > Email") },
      { label: "Slack", action: () => (lastSelection.value = "Share > Slack") },
      { label: "Copy Link", action: () => (lastSelection.value = "Share > Copy Link") },
    ],
  },
];
</script>

<template>
  <div class="flex flex-col items-start gap-2">
    <DanxDropdownMenu :items="items">
      <DanxButton>More</DanxButton>
    </DanxDropdownMenu>
    <p v-if="lastSelection" class="text-sm text-text-muted">
      Last selection: <strong>{{ lastSelection }}</strong>
    </p>
  </div>
</template>
