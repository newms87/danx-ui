<script setup lang="ts">
import { DanxChip } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <DanxChip variant="success" icon="confirm">By Name</DanxChip>
  <DanxChip variant="warning" :icon="starIcon">By Import</DanxChip>
  <DanxChip variant="info">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </template>
    By Slot
  </DanxChip>
</template>
