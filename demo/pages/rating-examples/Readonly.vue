<script setup>
import { ref } from "vue";
import { DanxRating } from "danx-ui";

const readonlyValue = ref(4);
const disabledValue = ref(2.5);
</script>

<template>
  <div class="flex flex-col gap-6 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRating v-model="readonlyValue" readonly allowHalf ariaLabel="Readonly rating" />
      <span class="text-xs text-text-muted">readonly (value: {{ readonlyValue }})</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="disabledValue" disabled allowHalf ariaLabel="Disabled rating" />
      <span class="text-xs text-text-muted">disabled (value: {{ disabledValue }})</span>
    </div>
  </div>
</template>
