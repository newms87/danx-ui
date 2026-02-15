<script setup lang="ts">
import { DanxChip } from "danx-ui";
</script>

<template>
  <DanxChip>Default</DanxChip>
  <DanxChip type="danger" icon="trash">Danger</DanxChip>
  <DanxChip type="success" icon="confirm">Success</DanxChip>
  <DanxChip type="warning" icon="pause">Warning</DanxChip>
  <DanxChip type="info" icon="view">Info</DanxChip>
  <DanxChip type="muted">Muted</DanxChip>
</template>
