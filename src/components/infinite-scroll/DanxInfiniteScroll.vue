<script setup lang="ts">
/**
 * DanxInfiniteScroll Component
 *
 * A scrollable container that emits a loadMore event when the user scrolls
 * near the edge. Uses VueUse's useInfiniteScroll internally for scroll
 * detection with configurable distance and direction.
 *
 * Requires `@vueuse/core` as a peer dependency.
 *
 * ## Features
 * - Configurable scroll distance threshold
 * - Top or bottom scroll direction
 * - Loading and done state indicators with customizable slots
 * - Guard against concurrent loads (loading prop)
 * - Guard against loading when no more items (canLoadMore prop)
 * - Customizable container tag
 * - CSS token system for styling
 * - Zero required props — works with sensible defaults
 *
 * @props
 *   distance?: number - Pixel threshold from edge (default: 200). Read once at mount.
 *   direction?: "top" | "bottom" - Scroll direction to watch (default: "bottom"). Read once at mount.
 *   canLoadMore?: boolean - Whether more items exist (default: true). Reactive.
 *   loading?: boolean - Whether a load is in progress (default: false). Reactive.
 *   tag?: string - HTML tag for container (default: "div")
 *
 * @emits
 *   loadMore - Fired when scroll threshold crossed, guarded by loading and canLoadMore
 *
 * @slots
 *   default - List items content
 *   loading - Loading indicator (default: "Loading..." span)
 *   done - Done indicator (default: "No more items" span)
 *
 * @tokens
 *   --dx-infinite-scroll-loading-color - Loading text color
 *   --dx-infinite-scroll-done-color - Done text color
 *   --dx-infinite-scroll-gap - Gap between content and indicators
 *
 * @example
 *   <DanxInfiniteScroll :loading="isLoading" :canLoadMore="hasMore" @loadMore="fetchMore">
 *     <div v-for="item in items" :key="item.id">{{ item.name }}</div>
 *   </DanxInfiniteScroll>
 */
import { ref, toRef } from "vue";
import { useDanxInfiniteScroll } from "./useInfiniteScroll";
import type { DanxInfiniteScrollProps, DanxInfiniteScrollSlots } from "./types";

const props = withDefaults(defineProps<DanxInfiniteScrollProps>(), {
  distance: 200,
  direction: "bottom",
  canLoadMore: true,
  loading: false,
  tag: "div",
});

const emit = defineEmits<{
  loadMore: [];
}>();
defineSlots<DanxInfiniteScrollSlots>();

const scrollContainer = ref<HTMLElement | null>(null);

useDanxInfiniteScroll(scrollContainer, {
  distance: props.distance,
  direction: props.direction,
  canLoadMore: toRef(props, "canLoadMore"),
  loading: toRef(props, "loading"),
  onLoadMore: () => emit("loadMore"),
});
</script>

<template>
  <component :is="tag" ref="scrollContainer" class="danx-infinite-scroll">
    <!-- For direction="top", status indicators appear before content -->
    <template v-if="direction === 'top'">
      <div v-if="loading" class="danx-infinite-scroll__loading">
        <slot name="loading">
          <span>Loading...</span>
        </slot>
      </div>

      <div v-if="!canLoadMore" class="danx-infinite-scroll__done">
        <slot name="done">
          <span>No more items</span>
        </slot>
      </div>
    </template>

    <slot />

    <!-- For direction="bottom" (default), status indicators appear after content -->
    <template v-if="direction !== 'top'">
      <div v-if="loading" class="danx-infinite-scroll__loading">
        <slot name="loading">
          <span>Loading...</span>
        </slot>
      </div>

      <div v-if="!canLoadMore" class="danx-infinite-scroll__done">
        <slot name="done">
          <span>No more items</span>
        </slot>
      </div>
    </template>
  </component>
</template>
