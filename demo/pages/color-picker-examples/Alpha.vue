<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const color = ref("rgba(59, 130, 246, 0.5)");
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker v-model="color" label="Overlay" :alpha="true" output="rgba" />
    <div class="text-sm text-text-muted">Bound value: {{ color }}</div>
    <div class="h-12 rounded border border-border" :style="{ background: color }"></div>
  </div>
</template>
