<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopconfirm } from "danx-ui";

const status = ref("idle");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleConfirm() {
  status.value = "saving";
  await sleep(1200);
  status.value = "saved";
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxPopconfirm
      message="Publish these changes? This may take a moment."
      confirm-text="Publish"
      confirm-variant="success"
      @confirm="handleConfirm"
    >
      <template #trigger>
        <DanxButton variant="success">Publish</DanxButton>
      </template>
    </DanxPopconfirm>
    <p class="text-text-muted text-[0.8125rem] m-0">Status: {{ status }}</p>
  </div>
</template>
