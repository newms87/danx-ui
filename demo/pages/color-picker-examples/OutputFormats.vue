<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const hex = ref("#3b82f6");
const rgb = ref("rgb(34, 197, 94)");
const hsl = ref("hsl(280, 60%, 50%)");
</script>

<template>
  <div class="flex flex-col gap-6 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxColorPicker v-model="hex" label="Hex" output="hex" />
      <span class="text-xs text-text-muted">{{ hex }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxColorPicker v-model="rgb" label="RGB" output="rgb" />
      <span class="text-xs text-text-muted">{{ rgb }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxColorPicker v-model="hsl" label="HSL" output="hsl" />
      <span class="text-xs text-text-muted">{{ hsl }}</span>
    </div>
  </div>
</template>
