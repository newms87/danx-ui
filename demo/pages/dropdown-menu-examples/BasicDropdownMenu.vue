<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDropdownMenu } from "danx-ui";

const lastSelection = ref("");

const items = [
  { label: "New File", action: () => (lastSelection.value = "New File") },
  { label: "New Folder", action: () => (lastSelection.value = "New Folder") },
  { label: "", separator: true },
  { label: "Rename", action: () => (lastSelection.value = "Rename") },
  { label: "Delete", action: () => (lastSelection.value = "Delete") },
];
</script>

<template>
  <div class="flex flex-col items-start gap-2">
    <DanxDropdownMenu :items="items">
      <DanxButton>Actions</DanxButton>
    </DanxDropdownMenu>
    <p v-if="lastSelection" class="text-sm text-text-muted">
      Last selection: <strong>{{ lastSelection }}</strong>
    </p>
  </div>
</template>
