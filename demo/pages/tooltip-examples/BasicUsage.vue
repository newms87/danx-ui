<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip tooltip="This is a basic tooltip">
      <template #trigger>
        <button style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem">
          Hover me
        </button>
      </template>
    </DanxTooltip>

    <DanxTooltip tooltip="Tooltip from the prop only" triggerIcon="info" />
  </div>
</template>
