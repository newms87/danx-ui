<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 1.5rem; align-items: center">
    <DanxPopover trigger="hover">
      <template #trigger>
        <button class="demo-btn">Hover me</button>
      </template>
      <div style="padding: 0.75rem 1rem; max-width: 14rem">
        <p style="margin: 0">
          This popover opens on hover. Move your cursor to this panel — it stays open.
        </p>
        <p style="margin: 0.5rem 0 0; color: var(--color-text-muted); font-size: 0.8125rem">
          Move away to close (200ms delay).
        </p>
      </div>
    </DanxPopover>

    <DanxPopover trigger="hover" :hover-delay="500">
      <template #trigger>
        <button class="demo-btn">500ms delay</button>
      </template>
      <div style="padding: 0.75rem 1rem; max-width: 14rem">
        <p style="margin: 0">This popover has a longer 500ms close delay.</p>
      </div>
    </DanxPopover>
  </div>
</template>
