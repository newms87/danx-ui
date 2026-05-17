<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const color = ref("#3b82f6");
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker v-model="color" label="Brand" test-id="basic" />
    <div class="text-sm text-text-muted">Bound value: {{ color }}</div>
  </div>
</template>
