<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const description = ref("");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea v-model="description" label="Description" placeholder="Enter a description..." />
    <p class="text-sm text-slate-500">Value: {{ description || "(empty)" }}</p>
  </div>
</template>
