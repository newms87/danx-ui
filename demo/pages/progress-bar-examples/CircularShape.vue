<script setup lang="ts">
import { ref } from "vue";
import { DanxProgressBar } from "danx-ui";

const value = ref(65);
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex items-end gap-6">
      <DanxProgressBar shape="circular" :value="value" size="sm" />
      <DanxProgressBar shape="circular" :value="value" size="md" />
      <DanxProgressBar shape="circular" :value="value" size="lg" variant="success" />
      <DanxProgressBar shape="circular" indeterminate variant="info" size="lg" />
    </div>

    <label class="flex items-center gap-2 text-sm">
      Value: {{ value }}%
      <input type="range" v-model.number="value" min="0" max="100" class="flex-1" />
    </label>

    <div class="flex items-center gap-6">
      <div>
        <div class="text-xs text-text-muted mb-1">Linear</div>
        <DanxProgressBar :value="value" size="lg" />
      </div>
      <div>
        <div class="text-xs text-text-muted mb-1">Circular</div>
        <DanxProgressBar shape="circular" :value="value" size="lg" />
      </div>
    </div>
  </div>
</template>
