<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-center">
    <DanxTooltip interaction="click" tooltip="Click to toggle this tooltip">
      <template #trigger>
        <button class="px-4 py-2 border border-border rounded">Click me</button>
      </template>
    </DanxTooltip>

    <DanxTooltip interaction="focus" tooltip="Focus the input to see this tooltip">
      <template #trigger>
        <input type="text" placeholder="Focus me" class="p-2 border border-border rounded" />
      </template>
    </DanxTooltip>
  </div>
</template>
