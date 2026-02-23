<script setup>
import { ref } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const items = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`));
</script>

<template>
  <DanxVirtualScroll
    :items="items"
    :default-item-height="36"
    :totalItems="10000"
    class="w-full h-[300px] border border-border rounded-lg"
  >
    <template #item="{ item, index }">
      <div class="py-2 px-3 border-b border-border text-sm">{{ index }}: {{ item }}</div>
    </template>
  </DanxVirtualScroll>
</template>
