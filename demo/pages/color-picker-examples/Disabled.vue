<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const a = ref("#3b82f6");
const b = ref("#ef4444");
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker v-model="a" label="Disabled" :disabled="true" />
    <DanxColorPicker v-model="b" label="Panel disabled" :panelDisabled="true" />
  </div>
</template>
