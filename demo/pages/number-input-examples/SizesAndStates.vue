<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const small = ref(1);
const medium = ref(2);
const large = ref(3);
const invalid = ref(120);
const locked = ref(42);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxNumberInput v-model="small" size="sm" label="Small" />
    <DanxNumberInput v-model="medium" size="md" label="Medium (default)" />
    <DanxNumberInput v-model="large" size="lg" label="Large" />

    <DanxNumberInput v-model="invalid" label="Required" required error="Must be 100 or under" />
    <DanxNumberInput v-model="locked" label="Readonly" readonly />
    <DanxNumberInput v-model="locked" label="Disabled" disabled />
  </div>
</template>
