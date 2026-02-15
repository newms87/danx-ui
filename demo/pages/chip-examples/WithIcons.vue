<script setup lang="ts">
import { DanxChip } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <DanxChip type="success" icon="confirm">By Name</DanxChip>
  <DanxChip type="warning" :icon="starIcon">By Import</DanxChip>
  <DanxChip type="info">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </template>
    By Slot
  </DanxChip>
</template>
