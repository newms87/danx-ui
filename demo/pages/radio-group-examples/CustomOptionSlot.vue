<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const value = ref("visa");

const options = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
];
</script>

<template>
  <DanxRadioGroup v-model="value" :options="options" label="Payment method">
    <template #option="{ option, checked }">
      <span :class="{ 'font-semibold': checked }">{{ option.label }}</span>
    </template>
  </DanxRadioGroup>
</template>
