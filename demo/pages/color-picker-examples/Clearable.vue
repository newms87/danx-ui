<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const color = ref("#10b981");
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxColorPicker
      v-model="color"
      label="Tint"
      :clearable="true"
      clearValue=""
      placeholder="(no color)"
    />
    <div class="text-sm text-text-muted">
      Click <strong>Clear</strong> inside the panel — value resets to <code>clearValue</code>.
    </div>
    <div class="text-sm text-text-muted">
      Current: <code>{{ color || "(empty)" }}</code>
    </div>
  </div>
</template>
