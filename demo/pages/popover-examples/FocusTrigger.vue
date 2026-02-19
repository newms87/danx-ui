<script setup lang="ts">
import { DanxPopover } from "danx-ui";
</script>

<template>
  <DanxPopover trigger="focus">
    <template #trigger>
      <input
        type="text"
        placeholder="Focus this input..."
        style="
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 0.375rem;
          background: var(--color-surface);
          color: var(--color-text);
          width: 16rem;
        "
      />
    </template>
    <div style="padding: 0.75rem 1rem; max-width: 16rem">
      <p style="margin: 0; font-weight: 600">Hint</p>
      <p style="margin: 0.25rem 0 0; color: var(--color-text-muted); font-size: 0.8125rem">
        This popover appears when the input is focused and hides when focus moves elsewhere.
      </p>
    </div>
  </DanxPopover>
</template>
