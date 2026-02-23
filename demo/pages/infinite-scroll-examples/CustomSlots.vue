<script setup lang="ts">
import { ref } from "vue";
import { DanxInfiniteScroll } from "danx-ui";

const items = ref(Array.from({ length: 15 }, (_, i) => `Entry ${i + 1}`));
const loading = ref(false);
const canLoadMore = ref(true);

function addEntries(count, maxTotal) {
  items.value = items.value.concat(
    Array.from({ length: count }, (_, i) => "Entry " + (items.value.length + i + 1))
  );
  if (items.value.length >= maxTotal) canLoadMore.value = false;
}

function loadMore() {
  loading.value = true;
  setTimeout(() => {
    addEntries(10, 50);
    loading.value = false;
  }, 1000);
}
</script>

<template>
  <DanxInfiniteScroll
    class="w-full h-[250px] border border-border rounded-lg p-2"
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadMore"
  >
    <div v-for="item in items" :key="item" class="p-2">
      {{ item }}
    </div>

    <template #loading>
      <div class="text-center p-4 text-interactive">⏳ Fetching more data...</div>
    </template>

    <template #done>
      <div class="text-center p-4 text-success font-semibold">✅ You've reached the end!</div>
    </template>
  </DanxInfiniteScroll>
</template>
