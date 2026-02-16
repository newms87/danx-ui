<script setup lang="ts">
import { DanxBadge, DanxButton } from "danx-ui";
</script>

<template>
  <DanxBadge :value="1" type="danger">
    <DanxButton>Danger</DanxButton>
  </DanxBadge>

  <DanxBadge :value="2" type="success">
    <DanxButton>Success</DanxButton>
  </DanxBadge>

  <DanxBadge :value="3" type="warning">
    <DanxButton>Warning</DanxButton>
  </DanxBadge>

  <DanxBadge :value="4" type="info">
    <DanxButton>Info</DanxButton>
  </DanxBadge>

  <DanxBadge :value="5" type="muted">
    <DanxButton>Muted</DanxButton>
  </DanxBadge>

  <DanxBadge value="NEW" type="info">
    <DanxButton>Label</DanxButton>
  </DanxBadge>
</template>
