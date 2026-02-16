<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip type="" tooltip="Default tooltip" triggerIcon="info" />
    <DanxTooltip type="danger" icon="stop" tooltip="Danger tooltip" triggerIcon="info" />
    <DanxTooltip type="success" icon="confirm" tooltip="Success tooltip" triggerIcon="info" />
    <DanxTooltip
      type="warning"
      icon="warning-triangle"
      tooltip="Warning tooltip"
      triggerIcon="info"
    />
    <DanxTooltip type="info" icon="info" tooltip="Info tooltip" triggerIcon="question" />
    <DanxTooltip type="muted" tooltip="Muted tooltip" triggerIcon="info" />
  </div>
</template>
