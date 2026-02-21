<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";

const value = ref(75);
const buffer = ref(90);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <DanxProgressBar
      :value="value"
      :buffer="buffer"
      type="danger"
      size="lg"
      :icon="starIcon"
      striped
      animateStripes
      glow
      shimmer
      gradient
    />

    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem">
      Value: {{ value }}%
      <input type="range" v-model.number="value" min="0" max="100" style="flex: 1" />
    </label>

    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem">
      Buffer: {{ buffer }}%
      <input type="range" v-model.number="buffer" min="0" max="100" style="flex: 1" />
    </label>
  </div>
</template>
