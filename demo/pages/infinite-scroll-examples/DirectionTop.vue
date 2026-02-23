<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { DanxInfiniteScroll } from "danx-ui";

const scrollContainer = ref(null);
const messages = ref(Array.from({ length: 20 }, (_, i) => `Message ${20 - i}`));
const loading = ref(false);
const canLoadMore = ref(true);

function prependMessages(count, maxTotal) {
  messages.value = Array.from(
    { length: count },
    (_, i) => "Message " + (messages.value.length + count - i)
  ).concat(messages.value);
  if (messages.value.length >= maxTotal) canLoadMore.value = false;
}

function loadOlder() {
  loading.value = true;
  setTimeout(() => {
    prependMessages(10, 80);
    loading.value = false;
  }, 600);
}

onMounted(() => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.$el.scrollTop = scrollContainer.value.$el.scrollHeight;
    }
  });
});
</script>

<template>
  <DanxInfiniteScroll
    ref="scrollContainer"
    direction="top"
    class="w-full h-[300px] border border-border rounded-lg p-2"
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadOlder"
  >
    <div v-for="(msg, idx) in messages" :key="idx" class="py-2 px-3 border-b border-border">
      💬 {{ msg }}
    </div>
  </DanxInfiniteScroll>
</template>
