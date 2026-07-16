<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const plan = ref("free");

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise (unavailable)", disabled: true },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <DanxRadioGroup v-model="plan" :options="options" label="Individually disabled option" />
    <DanxRadioGroup v-model="plan" :options="options" label="Entire group disabled" disabled />
  </div>
</template>
