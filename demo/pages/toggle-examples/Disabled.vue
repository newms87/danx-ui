<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const offDisabled = ref(false);
const onDisabled = ref(true);
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="flex flex-col items-center gap-2">
      <DanxToggle v-model="offDisabled" disabled />
      <span class="text-xs text-text-muted">disabled, off</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <DanxToggle v-model="onDisabled" disabled />
      <span class="text-xs text-text-muted">disabled, on</span>
    </div>
  </div>
</template>
