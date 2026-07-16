<script setup>
import { ref } from "vue";
import { DanxAccordion, DanxBadge } from "danx-ui";

const openValue = ref("one");
const items = [
  { value: "one", label: "Open Tasks", count: 3 },
  { value: "two", label: "In Review", count: 1 },
];
</script>

<template>
  <DanxAccordion v-model="openValue" :items="items">
    <template #header="{ item, isOpen }">
      <span class="flex items-center gap-2">
        <span :class="{ 'font-semibold': isOpen }">{{ item.label }}</span>
        <DanxBadge>{{ item.count }}</DanxBadge>
      </span>
    </template>
    <template #panel="{ item }">{{ item.count }} item(s) in {{ item.label }}.</template>
  </DanxAccordion>
</template>
