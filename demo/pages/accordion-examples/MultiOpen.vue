<script setup>
import { ref } from "vue";
import { DanxAccordion } from "danx-ui";

const openValues = ref(["one"]);
const items = [
  { value: "one", label: "Billing" },
  { value: "two", label: "Notifications" },
  { value: "three", label: "Security" },
];
</script>

<template>
  <DanxAccordion v-model="openValues" :items="items" multiple>
    <template #panel="{ item }">Settings for {{ item.label }}.</template>
  </DanxAccordion>
</template>
