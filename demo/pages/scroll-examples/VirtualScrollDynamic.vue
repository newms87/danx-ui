<script setup>
import { ref } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const items = ref(Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`));
const loading = ref(false);
const canLoadMore = ref(true);

function loadMore() {
  loading.value = true;
  setTimeout(() => {
    items.value.push(...Array.from({ length: 50 }, (_, i) => `Item ${items.value.length + i + 1}`));
    loading.value = false;
    if (items.value.length >= 500) {
      canLoadMore.value = false;
    }
  }, 800);
}
</script>

<template>
  <DanxVirtualScroll
    :items="items"
    :default-item-size="36"
    infiniteScroll
    :loading="loading"
    :canLoadMore="canLoadMore"
    class="w-full h-[300px] border border-border rounded-lg"
    @loadMore="loadMore"
  >
    <template #item="{ item, index }">
      <div class="py-2 px-3 border-b border-border text-sm">{{ index }}: {{ item }}</div>
    </template>
  </DanxVirtualScroll>
</template>
