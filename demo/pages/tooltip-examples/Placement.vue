<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center; padding: 3rem">
    <DanxTooltip placement="top" tooltip="Placed on top" triggerIcon="info" />
    <DanxTooltip placement="bottom" tooltip="Placed on bottom" triggerIcon="info" />
    <DanxTooltip placement="left" tooltip="Placed on left" triggerIcon="info" />
    <DanxTooltip placement="right" tooltip="Placed on right" triggerIcon="info" />
  </div>
</template>
