<script setup lang="ts">
import { DanxBadge, DanxButton } from "danx-ui";
</script>

<template>
  <DanxBadge dot>
    <DanxButton>Default</DanxButton>
  </DanxBadge>

  <DanxBadge dot variant="success">
    <DanxButton>Online</DanxButton>
  </DanxBadge>

  <DanxBadge dot variant="warning">
    <DanxButton>Away</DanxButton>
  </DanxBadge>

  <DanxBadge dot variant="muted">
    <DanxButton>Offline</DanxButton>
  </DanxBadge>
</template>
