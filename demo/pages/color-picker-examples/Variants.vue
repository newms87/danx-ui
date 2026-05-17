<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const danger = ref("#ef4444");
const success = ref("#22c55e");
const warning = ref("#f59e0b");
const info = ref("#3b82f6");
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker v-model="danger" variant="danger" label="Danger" />
    <DanxColorPicker v-model="success" variant="success" label="Success" />
    <DanxColorPicker v-model="warning" variant="warning" label="Warning" />
    <DanxColorPicker v-model="info" variant="info" label="Info" />
  </div>
</template>
