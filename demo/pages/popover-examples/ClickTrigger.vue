<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <DanxPopover trigger="click">
    <template #trigger>
      <button class="demo-btn">Click to toggle</button>
    </template>
    <div style="padding: 0.75rem 1rem; max-width: 14rem">
      <p style="margin: 0">This popover toggles on click. No v-model needed.</p>
      <p style="margin: 0.5rem 0 0; color: var(--color-text-muted); font-size: 0.8125rem">
        Click outside or press Escape to close.
      </p>
    </div>
  </DanxPopover>
</template>
