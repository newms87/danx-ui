<script setup lang="ts">
import { DanxBadge, DanxButton } from "danx-ui";
</script>

<template>
  <DanxBadge :value="1" placement="top-left">
    <DanxButton>Top Left</DanxButton>
  </DanxBadge>

  <DanxBadge :value="2" placement="top-right">
    <DanxButton>Top Right</DanxButton>
  </DanxBadge>

  <DanxBadge :value="3" placement="bottom-left">
    <DanxButton>Bottom Left</DanxButton>
  </DanxBadge>

  <DanxBadge :value="4" placement="bottom-right">
    <DanxButton>Bottom Right</DanxButton>
  </DanxBadge>
</template>
