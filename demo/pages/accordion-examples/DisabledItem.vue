<script setup>
import { ref } from "vue";
import { DanxAccordion } from "danx-ui";

const openValue = ref(null);
const items = [
  { value: "one", label: "Available Section" },
  { value: "two", label: "Locked Section", disabled: true },
];
</script>

<template>
  <DanxAccordion v-model="openValue" :items="items">
    <template #panel="{ item }">Content for {{ item.label }}.</template>
  </DanxAccordion>
</template>
