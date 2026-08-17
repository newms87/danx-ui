<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const value = ref(3);
</script>

<template>
  <div class="number-input-branded flex flex-col gap-4">
    <DanxNumberInput v-model="value" label="Pill field" :min="0" :max="20" />
    <p class="text-sm text-slate-500">
      No styling props — the wrapper below sets --dx-number-input-* tokens.
    </p>
  </div>
</template>

<style>
.number-input-branded {
  --dx-number-input-border-radius: 9999px;
  --dx-number-input-stepper-color: var(--color-interactive);
  --dx-number-input-md-height: 3rem;
  --dx-number-input-md-padding-x: 1.25rem;
}
</style>
