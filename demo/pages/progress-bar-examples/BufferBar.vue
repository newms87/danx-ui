<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar } from "danx-ui";

const value = ref(30);
const buffer = ref(60);
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxProgressBar :value="value" :buffer="buffer" size="lg" />

    <label class="flex items-center gap-2 text-sm">
      Value: {{ value }}%
      <input type="range" v-model.number="value" min="0" max="100" class="flex-1" />
    </label>

    <label class="flex items-center gap-2 text-sm">
      Buffer: {{ buffer }}%
      <input type="range" v-model.number="buffer" min="0" max="100" class="flex-1" />
    </label>
  </div>
</template>
