<script setup>
import { ref } from "vue";
import { DanxScroll } from "danx-ui";

const items = ref(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
const loading = ref(false);
const canLoadMore = ref(true);

function loadMore() {
  loading.value = true;
  setTimeout(() => {
    Array.from({ length: 10 }, (_, i) => items.value.push(`Item ${items.value.length + 1}`));
    loading.value = false;
    if (items.value.length >= 80) {
      canLoadMore.value = false;
    }
  }, 1000);
}
</script>

<template>
  <DanxScroll
    infiniteScroll
    :loading="loading"
    :canLoadMore="canLoadMore"
    class="w-full h-[300px] border border-border rounded-lg p-2"
    @loadMore="loadMore"
  >
    <div v-for="(item, index) in items" :key="index" class="py-2 px-3 border-b border-border">
      {{ item }}
    </div>
  </DanxScroll>
</template>
