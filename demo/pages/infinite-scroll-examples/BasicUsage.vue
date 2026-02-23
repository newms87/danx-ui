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
    style="
      width: 100%;
      height: 300px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 0.5rem;
    "
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadMore"
  >
    <div
      v-for="item in items"
      :key="item"
      style="padding: 0.75rem; border-bottom: 1px solid var(--color-border)"
    >
      {{ item }}
    </div>
  </DanxInfiniteScroll>
</template>
