<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const title = ref("Edit me — commit triggers a fake 1s PATCH");
const saving = ref(false);

function onUpdate(value) {
  saving.value = true;
  setTimeout(() => {
    title.value = value;
    saving.value = false;
  }, 1000);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv :model-value="title" :saving="saving" @update:model-value="onUpdate" />
    <div class="text-sm text-text-muted">{{ saving ? "Saving..." : "Idle" }}</div>
  </div>
</template>
