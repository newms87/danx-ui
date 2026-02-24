<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <DanxPopover trigger="focus">
    <template #trigger>
      <input
        type="text"
        placeholder="Focus this input..."
        class="px-3 py-2 border border-border rounded bg-surface text-text w-64"
      />
    </template>
    <div class="px-4 py-3 max-w-64">
      <p class="m-0 font-semibold">Hint</p>
      <p class="mt-1 text-text-muted text-[0.8125rem]">
        This popover appears when the input is focused and hides when focus moves elsewhere.
      </p>
    </div>
  </DanxPopover>
</template>
