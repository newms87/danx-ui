<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <DanxPopover trigger="click">
    <template #trigger>
      <button class="demo-btn">Click to toggle</button>
    </template>
    <div class="px-4 py-3 max-w-56">
      <p>This popover toggles on click. No v-model needed.</p>
      <p class="mt-2 text-text-muted text-[0.8125rem]">
        Click outside or press Escape to close.
      </p>
    </div>
  </DanxPopover>
</template>
