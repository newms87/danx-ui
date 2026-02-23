<script setup lang="ts">
import { ref } from "vue";
import { DanxInfiniteScroll } from "danx-ui";

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
</script>

<template>
  <DanxInfiniteScroll
    direction="top"
    style="
      height: 300px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      padding: 0.5rem;
    "
    :loading="loading"
    :canLoadMore="canLoadMore"
    @loadMore="loadOlder"
  >
    <div
      v-for="(msg, idx) in messages"
      :key="idx"
      style="padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--color-border)"
    >
      💬 {{ msg }}
    </div>
  </DanxInfiniteScroll>
</template>
