<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-center">
    <button id="external-target" class="px-4 py-2 border border-border rounded">
      External target
    </button>
    <DanxTooltip targetId="external-target" tooltip="Anchored to the button via target prop" />
  </div>
</template>
