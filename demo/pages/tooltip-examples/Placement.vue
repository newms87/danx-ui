<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-center p-12">
    <DanxTooltip placement="top" tooltip="Placed on top" triggerIcon="info" />
    <DanxTooltip placement="bottom" tooltip="Placed on bottom" triggerIcon="info" />
    <DanxTooltip placement="left" tooltip="Placed on left" triggerIcon="info" />
    <DanxTooltip placement="right" tooltip="Placed on right" triggerIcon="info" />
  </div>
</template>
