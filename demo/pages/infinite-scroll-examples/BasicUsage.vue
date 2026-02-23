<script setup lang="ts">
import { ref } from "vue";
import { DanxInfiniteScroll } from "danx-ui";

const items = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
const loading = ref(false);
const canLoadMore = ref(true);

function addItems(count, maxTotal) {
  items.value = items.value.concat(
    Array.from({ length: count }, (_, i) => "Item " + (items.value.length + i + 1))
  );
  if (items.value.length >= maxTotal) canLoadMore.value = false;
}

function loadMore() {
  loading.value = true;
  setTimeout(() => {
    addItems(10, 100);
    loading.value = false;
  }, 800);
}
</script>

<template>
  <DanxInfiniteScroll
    class="w-full h-[300px] border border-border rounded-lg p-2"
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadMore"
  >
    <div v-for="item in items" :key="item" class="py-3 px-3 border-b border-border">
      {{ item }}
    </div>
  </DanxInfiniteScroll>
</template>
