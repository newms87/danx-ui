<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip variant="" tooltip="Default tooltip" triggerIcon="info" />
    <DanxTooltip variant="danger" icon="stop" tooltip="Danger tooltip" triggerIcon="info" />
    <DanxTooltip variant="success" icon="confirm" tooltip="Success tooltip" triggerIcon="info" />
    <DanxTooltip
      variant="warning"
      icon="warning-triangle"
      tooltip="Warning tooltip"
      triggerIcon="info"
    />
    <DanxTooltip variant="info" icon="info" tooltip="Info tooltip" triggerIcon="question" />
    <DanxTooltip variant="muted" tooltip="Muted tooltip" triggerIcon="info" />
  </div>
</template>
