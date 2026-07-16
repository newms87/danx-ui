<script setup>
import { ref } from "vue";
import { DanxAccordion } from "danx-ui";

const openValue = ref(null);
const items = [
  { value: "one", label: "What is danx-ui?" },
  { value: "two", label: "Does it require Tailwind?" },
  { value: "three", label: "Is it tree-shakeable?" },
];
</script>

<template>
  <DanxAccordion v-model="openValue" :items="items">
    <template #panel="{ item }">
      <span v-if="item.value === 'one'">
        A zero-dependency Vue 3 + Tailwind CSS v4 component library.
      </span>
      <span v-else-if="item.value === 'two'">
        Yes, styling is built on Tailwind utility classes.
      </span>
      <span v-else> Yes — every component is a named export, so unused ones are dropped. </span>
    </template>
  </DanxAccordion>
</template>
