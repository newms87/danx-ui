<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopconfirm } from "danx-ui";

const lastAction = ref("none");
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxPopconfirm
      title="Discard changes?"
      message="Close, press Escape, or click outside to cancel."
      @confirm="lastAction = 'confirmed'"
      @cancel="lastAction = 'cancelled'"
    >
      <template #trigger>
        <DanxButton variant="danger">Discard</DanxButton>
      </template>
    </DanxPopconfirm>
    <p class="text-text-muted text-[0.8125rem] m-0">Last action: {{ lastAction }}</p>
  </div>
</template>
