<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <div class="flex gap-6 items-center">
    <DanxPopover trigger="hover">
      <template #trigger>
        <button class="demo-btn">Hover me</button>
      </template>
      <div class="px-4 py-3 max-w-56">
        <p class="m-0">
          This popover opens on hover. Move your cursor to this panel — it stays open.
        </p>
        <p class="mt-2 text-text-muted text-[0.8125rem]">
          Move away to close (200ms delay).
        </p>
      </div>
    </DanxPopover>

    <DanxPopover trigger="hover" :hover-delay="500">
      <template #trigger>
        <button class="demo-btn">500ms delay</button>
      </template>
      <div class="px-4 py-3 max-w-56">
        <p class="m-0">This popover has a longer 500ms close delay.</p>
      </div>
    </DanxPopover>
  </div>
</template>
