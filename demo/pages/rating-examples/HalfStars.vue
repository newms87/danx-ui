<script setup>
import { ref } from "vue";
import { DanxRating } from "danx-ui";

const value = ref(3.5);
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxRating v-model="value" allowHalf ariaLabel="Half-star rating" />
    <div class="text-sm text-text-muted">Value: {{ value }}</div>
  </div>
</template>
