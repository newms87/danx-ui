<script setup>
import { ref } from "vue";
import { DanxButton, DanxVirtualScroll } from "danx-ui";

const items = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`));
const position = ref(0);

function jumpTo(index) {
  position.value = index;
}
</script>

<template>
  <div class="flex items-center gap-3 mb-3 text-sm">
    <span class="font-medium">Position: {{ position }}</span>
    <DanxButton @click="jumpTo(0)">Top</DanxButton>
    <DanxButton @click="jumpTo(5000)">Middle</DanxButton>
    <DanxButton @click="jumpTo(9999)">Bottom</DanxButton>
  </div>

  <DanxVirtualScroll
    v-model:scrollPosition="position"
    :items="items"
    :default-item-size="36"
    :totalItems="10000"
    class="w-full h-[300px] border border-border rounded-lg"
  >
    <template #item="{ item, index }">
      <div class="py-2 px-3 border-b border-border text-sm">{{ index }}: {{ item }}</div>
    </template>
  </DanxVirtualScroll>
</template>
