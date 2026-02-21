<script setup lang="ts">
import { DanxButton } from "danx-ui";
</script>

<template>
  <div class="grid grid-cols-2 gap-x-12 gap-y-4">
    <div
      v-for="size in ['xxs', 'xs', 'sm', 'md', 'lg', 'xl']"
      :key="size"
      class="flex items-center gap-2"
    >
      <DanxButton variant="success" :size="size">{{ size.toUpperCase() }}</DanxButton>
      <DanxButton variant="success" icon="save" :size="size">{{ size.toUpperCase() }}</DanxButton>
      <DanxButton variant="success" :loading="true" :size="size">{{ size.toUpperCase() }}</DanxButton>
    </div>
  </div>
</template>
