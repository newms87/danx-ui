<script setup lang="ts">
import { DanxChip } from "danx-ui";
</script>

<template>
  <DanxChip>Default</DanxChip>
  <DanxChip variant="danger" icon="trash">Danger</DanxChip>
  <DanxChip variant="success" icon="confirm">Success</DanxChip>
  <DanxChip variant="warning" icon="pause">Warning</DanxChip>
  <DanxChip variant="info" icon="view">Info</DanxChip>
  <DanxChip variant="muted">Muted</DanxChip>
</template>
