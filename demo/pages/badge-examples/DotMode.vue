<script setup lang="ts">
import { DanxBadge, DanxButton } from "danx-ui";
</script>

<template>
  <DanxBadge dot>
    <DanxButton>Default</DanxButton>
  </DanxBadge>

  <DanxBadge dot type="success">
    <DanxButton>Online</DanxButton>
  </DanxBadge>

  <DanxBadge dot type="warning">
    <DanxButton>Away</DanxButton>
  </DanxBadge>

  <DanxBadge dot type="muted">
    <DanxButton>Offline</DanxButton>
  </DanxBadge>
</template>
