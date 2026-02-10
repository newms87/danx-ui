<script setup lang="ts">
import { ref } from "vue";
import { DanxPopover } from "danx-ui";

const show = ref(false);
</script>

<template>
  <DanxPopover v-model="show">
    <template #trigger>
      <button class="demo-btn" @click="show = !show">Toggle Popover</button>
    </template>
    <div style="padding: 0.75rem 1rem; max-width: 14rem">
      <p style="margin: 0">This is a basic popover anchored below the trigger button.</p>
      <p style="margin: 0.5rem 0 0; color: var(--color-text-muted); font-size: 0.8125rem">
        Click outside or press Escape to close.
      </p>
    </div>
  </DanxPopover>
</template>
