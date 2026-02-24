<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-center">
    <DanxTooltip tooltip="This is a basic tooltip">
      <template #trigger>
        <button class="px-4 py-2 border border-border rounded">Hover me</button>
      </template>
    </DanxTooltip>

    <DanxTooltip tooltip="Tooltip from the prop only" triggerIcon="info" />
  </div>
</template>
