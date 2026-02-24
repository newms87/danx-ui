<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-center">
    <DanxTooltip triggerIcon="info" tooltip="Uses the info icon as trigger" />
    <DanxTooltip triggerIcon="question" tooltip="Uses the question icon as trigger" />
    <DanxTooltip triggerIcon="warning-triangle" tooltip="Uses the warning icon as trigger" />
  </div>
</template>
