<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar } from "danx-ui";

const value = ref(65);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px">
    <DanxProgressBar :value="value" />

    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem">
      Value: {{ value }}%
      <input type="range" v-model.number="value" min="0" max="100" style="flex: 1" />
    </label>
  </div>
</template>
