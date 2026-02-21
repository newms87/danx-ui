<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip tooltip="Default tooltip" triggerIcon="info" />
    <DanxTooltip variant="danger" tooltip="Danger tooltip" triggerIcon="info" />
    <DanxTooltip variant="success" tooltip="Success tooltip" triggerIcon="info" />
    <DanxTooltip variant="warning" tooltip="Warning tooltip" triggerIcon="info" />
    <DanxTooltip variant="info" tooltip="Info tooltip" triggerIcon="info" />
    <DanxTooltip variant="muted" tooltip="Muted tooltip" triggerIcon="info" />
  </div>
</template>
