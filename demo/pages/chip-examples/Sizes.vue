<script setup lang="ts">
import { DanxChip } from "danx-ui";
</script>

<template>
  <div class="grid grid-cols-2 gap-x-12 gap-y-4">
    <div
      v-for="size in ['xxs', 'xs', 'sm', 'md', 'lg', 'xl']"
      :key="size"
      class="flex items-center gap-2"
    >
      <DanxChip type="success" icon="confirm" :size="size">{{ size.toUpperCase() }}</DanxChip>
      <DanxChip type="info" :size="size">{{ size.toUpperCase() }}</DanxChip>
    </div>
  </div>
</template>
