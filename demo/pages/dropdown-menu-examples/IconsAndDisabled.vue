<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDropdownMenu } from "danx-ui";

const lastSelection = ref("");

const items = [
  {
    label: "Edit",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>',
    action: () => (lastSelection.value = "Edit"),
  },
  {
    label: "Duplicate",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>',
    action: () => (lastSelection.value = "Duplicate"),
  },
  {
    label: "Archive (coming soon)",
    disabled: true,
  },
];
</script>

<template>
  <div class="flex flex-col items-start gap-2">
    <DanxDropdownMenu :items="items">
      <DanxButton>Row Actions</DanxButton>
    </DanxDropdownMenu>
    <p v-if="lastSelection" class="text-sm text-text-muted">
      Last selection: <strong>{{ lastSelection }}</strong>
    </p>
  </div>
</template>
