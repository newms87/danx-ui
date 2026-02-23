<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { DanxInfiniteScroll } from "danx-ui";

const scrollContainer = ref(null);
const messages = ref(Array.from({ length: 20 }, (_, i) => `Message ${20 - i}`));
const loading = ref(false);
const canLoadMore = ref(true);
const savedScrollHeight = ref(0);

function getScrollEl() {
  return scrollContainer.value && scrollContainer.value.$el;
}

function scrollToBottom() {
  nextTick(() => {
    if (getScrollEl()) getScrollEl().scrollTop = getScrollEl().scrollHeight;
  });
}

function restoreScrollPosition() {
  nextTick(() => {
    if (getScrollEl()) {
      getScrollEl().scrollTop += getScrollEl().scrollHeight - savedScrollHeight.value;
    }
  });
}

function loadOlder() {
  loading.value = true;
  setTimeout(() => {
    savedScrollHeight.value = getScrollEl() ? getScrollEl().scrollHeight : 0;
    messages.value = Array.from(
      { length: 10 },
      (_, i) => "Message " + (messages.value.length + 10 - i)
    ).concat(messages.value);
    if (messages.value.length >= 80) canLoadMore.value = false;
    restoreScrollPosition();
    loading.value = false;
  }, 600);
}

onMounted(scrollToBottom);
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
