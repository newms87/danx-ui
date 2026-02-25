<script setup>
import { DanxPopover } from "danx-ui";
</script>

<template>
  <div class="flex gap-6 items-center flex-wrap">
    <DanxPopover trigger="hover" variant="danger" placement="top">
      <template #trigger>
        <button class="px-3 py-1.5 rounded bg-danger text-text-inverted text-sm">Danger</button>
      </template>
      <div class="p-3 text-sm">Something went wrong!</div>
    </DanxPopover>

    <DanxPopover trigger="hover" variant="success" placement="top">
      <template #trigger>
        <button class="px-3 py-1.5 rounded bg-success text-text-inverted text-sm">Success</button>
      </template>
      <div class="p-3 text-sm">Operation completed successfully.</div>
    </DanxPopover>

    <DanxPopover trigger="hover" variant="warning" placement="top">
      <template #trigger>
        <button class="px-3 py-1.5 rounded bg-warning text-text-inverted text-sm">Warning</button>
      </template>
      <div class="p-3 text-sm">Proceed with caution.</div>
    </DanxPopover>

    <DanxPopover trigger="hover" variant="info" placement="top">
      <template #trigger>
        <button class="px-3 py-1.5 rounded bg-info text-text-inverted text-sm">Info</button>
      </template>
      <div class="p-3 text-sm">Here is some helpful information.</div>
    </DanxPopover>
  </div>
</template>
