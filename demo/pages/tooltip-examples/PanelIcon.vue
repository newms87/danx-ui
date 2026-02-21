<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip icon="info" tooltip="Panel with info icon" triggerIcon="info" />
    <DanxTooltip
      icon="warning-triangle"
      variant="warning"
      tooltip="Panel with warning icon"
      triggerIcon="info"
    />
    <DanxTooltip icon="question" tooltip="Panel with question icon" triggerIcon="question" />
  </div>
</template>
