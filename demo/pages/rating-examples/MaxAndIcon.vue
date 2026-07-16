<script setup>
import { ref } from "vue";
import { DanxRating } from "danx-ui";

const stars = ref(7);
const hearts = ref(2);
</script>

<template>
  <div class="flex flex-col gap-6 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRating v-model="stars" :max="10" ariaLabel="Rating out of 10" />
      <span class="text-xs text-text-muted">max=10 (value: {{ stars }})</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="hearts" icon="confirm" :max="3" ariaLabel="Custom icon rating" />
      <span class="text-xs text-text-muted">custom icon (value: {{ hearts }})</span>
    </div>
  </div>
</template>
