<script setup>
import { ref } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const items = ref(
  Array.from({ length: 500 }, (_, i) => ({
    id: i,
    label: `Card ${i + 1}`,
    color: `hsl(${(i * 37) % 360}, 70%, 85%)`,
  }))
);
</script>

<template>
  <DanxVirtualScroll
    :items="items"
    direction="horizontal"
    :default-item-size="160"
    :totalItems="500"
    class="w-full h-52 border border-border rounded-lg"
  >
    <template #item="{ item }">
      <div
        class="flex flex-col items-center justify-center w-36 h-40 my-2 mx-2 rounded-lg text-sm font-medium shadow-sm shrink-0"
        :style="{ backgroundColor: item.color }"
      >
        <span class="text-gray-700">{{ item.label }}</span>
        <span class="text-xs text-gray-500 mt-1">ID: {{ item.id }}</span>
      </div>
    </template>
  </DanxVirtualScroll>
</template>
