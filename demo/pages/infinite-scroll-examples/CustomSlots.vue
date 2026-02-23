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
    style="
      height: 250px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 0.5rem;
    "
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadMore"
  >
    <div v-for="item in items" :key="item" style="padding: 0.5rem">
      {{ item }}
    </div>

    <template #loading>
      <div style="text-align: center; padding: 1rem; color: var(--color-interactive)">
        ⏳ Fetching more data...
      </div>
    </template>

    <template #done>
      <div style="text-align: center; padding: 1rem; color: var(--color-success); font-weight: 600">
        ✅ You've reached the end!
      </div>
    </template>
  </DanxInfiniteScroll>
</template>
