<script setup lang="ts">
import { DanxBadge, DanxButton } from "danx-ui";
</script>

<template>
  <DanxBadge :value="1" variant="danger">
    <DanxButton>Danger</DanxButton>
  </DanxBadge>

  <DanxBadge :value="2" variant="success">
    <DanxButton>Success</DanxButton>
  </DanxBadge>

  <DanxBadge :value="3" variant="warning">
    <DanxButton>Warning</DanxButton>
  </DanxBadge>

  <DanxBadge :value="4" variant="info">
    <DanxButton>Info</DanxButton>
  </DanxBadge>

  <DanxBadge :value="5" variant="muted">
    <DanxButton>Muted</DanxButton>
  </DanxBadge>

  <DanxBadge value="NEW" variant="info">
    <DanxButton>Label</DanxButton>
  </DanxBadge>
</template>
