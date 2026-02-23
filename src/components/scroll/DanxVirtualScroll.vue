<script setup lang="ts" generic="T">
/**
 * DanxVirtualScroll - Windowed rendering for large lists
 *
 * Renders only the items visible in the viewport (plus an overscan buffer),
 * using absolute positioning within a fixed-height container. Built on top of
 * DanxScroll for custom overlay scrollbars.
 *
 * Uses absolute positioning instead of spacer divs: a single container div
 * with height=totalHeight holds the visible items at their computed offsets.
 * This keeps scrollHeight stable and prevents scrollbar oscillation.
 *
 * Supports two modes:
 * - Local: All items passed upfront, only visible window rendered
 * - Remote: Items grow via infinite scroll (DanxVirtualScroll handles load-more directly)
 *
 * Items can have variable heights — measured after render via ref callbacks.
 *
 * @props
 *   items: T[] - Array of items to render (required)
 *   defaultItemHeight?: number - Estimated height for unmeasured items (default: 40)
 *   overscan?: number - Extra items above/below viewport (default: 3)
 *   keyFn?: (item: T, index: number) => string | number - Unique key extractor (default: index)
 *   totalItems?: number - Total items in full dataset (for stable scrollbar in remote mode)
 *   infiniteScroll?: boolean - Enable infinite scroll (read once at mount, not reactive) (default: false)
 *   loading?: boolean - Load in progress (default: false)
 *   canLoadMore?: boolean - Whether more items exist (default: true)
 *   distance?: number - Pixel threshold for infinite trigger (default: 200)
 *   infiniteDirection?: InfiniteScrollEdge - Edge for loading (default: "bottom")
 *   ...DanxScrollProps - Non-infinite-scroll DanxScroll props pass through
 *
 * @emits
 *   loadMore - Fired when scroll threshold crossed (only when infiniteScroll=true)
 *
 * @slots
 *   item - Scoped slot receiving { item, index } for each visible item
 *   loading - Loading indicator (shown at end of visible items when loading=true)
 *   done - Done indicator (shown at end of visible items when canLoadMore=false)
 *
 * @tokens
 *   Inherits all DanxScroll CSS tokens
 *
 * @example
 *   <DanxVirtualScroll :items="items" class="h-96">
 *     <template #item="{ item, index }">
 *       <div>{{ index }}: {{ item.name }}</div>
 *     </template>
 *   </DanxVirtualScroll>
 *
 * @example
 *   <DanxVirtualScroll
 *     :items="items"
 *     infiniteScroll
 *     :loading="loading"
 *     :canLoadMore="hasMore"
 *     @loadMore="fetchMore"
 *   >
 *     <template #item="{ item }">
 *       <LogLine :entry="item" />
 *     </template>
 *   </DanxVirtualScroll>
 */
import { type ComponentPublicInstance, computed, onMounted, ref, toRef } from "vue";
import DanxScroll from "./DanxScroll.vue";
import { useScrollInfinite } from "./useScrollInfinite";
import { useScrollWindow } from "./useScrollWindow";
import type { DanxVirtualScrollProps, DanxVirtualScrollSlots } from "./virtual-scroll-types";

const props = withDefaults(defineProps<DanxVirtualScrollProps<T>>(), {
  defaultItemHeight: 40,
  overscan: 3,
});

const emit = defineEmits<{
  loadMore: [];
}>();

defineSlots<DanxVirtualScrollSlots<T>>();

/**
 * DanxScroll passthrough props — virtual-scroll-specific and infinite scroll props
 * are filtered out. DanxVirtualScroll handles infinite scroll directly so that
 * loading/done indicators render inside the positioned wrapper instead of at the
 * bottom of the viewport where absolute positioning would misplace them.
 */
const scrollProps = computed(() => {
  const {
    items: _,
    defaultItemHeight: _d,
    overscan: _o,
    keyFn: _k,
    totalItems: _t,
    infiniteScroll: _is,
    loading: _l,
    canLoadMore: _c,
    distance: _dist,
    infiniteDirection: _dir,
    ...rest
  } = props;
  return rest;
});

const scrollRef = ref<InstanceType<typeof DanxScroll> | null>(null);
const viewportEl = ref<HTMLElement | null>(null);

// Couples to DanxScroll's internal DOM class. If DanxScroll renames this
// class, this query will silently fail and viewportEl stays null.
onMounted(() => {
  if (scrollRef.value?.$el) {
    viewportEl.value = scrollRef.value.$el.querySelector(".danx-scroll__viewport");
  }
});

const { visibleItems, startIndex, endIndex, totalHeight, startOffset, measureItem, keyFn } =
  useScrollWindow<T>(viewportEl, {
    items: toRef(props, "items"),
    defaultItemHeight: props.defaultItemHeight,
    overscan: props.overscan,
    keyFn: props.keyFn,
    totalItems: props.totalItems,
  });

// DanxVirtualScroll handles infinite scroll directly so indicators render
// inside the positioned wrapper (not at the bottom of DanxScroll's viewport)
if (props.infiniteScroll) {
  useScrollInfinite(viewportEl, {
    distance: props.distance,
    direction: props.infiniteDirection,
    canLoadMore: toRef(props, "canLoadMore"),
    loading: toRef(props, "loading"),
    onLoadMore: () => emit("loadMore"),
  });
}

/** Whether the user has scrolled to the end of loaded items */
const isAtEnd = computed(() => endIndex.value >= props.items.length - 1);

function itemRef(index: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    if (!el || !(el instanceof HTMLElement)) return;
    const item = props.items[index];
    if (item === undefined) return;
    const key = keyFn(item, index);
    measureItem(key, el);
  };
}
</script>

<template>
  <DanxScroll ref="scrollRef" v-bind="scrollProps">
    <!-- Container sized to total content height for correct scrollbar -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <!--
        Single absolutely-positioned wrapper at startOffset.
        Visible items flow naturally (static positioning) inside it,
        so each item stacks below the previous one without needing
        individual top offsets.
      -->
      <div :style="{ position: 'absolute', top: startOffset + 'px', width: '100%' }">
        <div
          v-for="(item, i) in visibleItems"
          :key="keyFn(item, startIndex + i)"
          :ref="itemRef(startIndex + i)"
        >
          <slot name="item" :item="item" :index="startIndex + i" />
        </div>

        <!-- Infinite scroll indicators — rendered at the end of visible items -->
        <template v-if="infiniteScroll && isAtEnd">
          <div v-if="loading" class="danx-scroll__loading">
            <slot name="loading">
              <span>Loading...</span>
            </slot>
          </div>

          <div v-if="!canLoadMore" class="danx-scroll__done">
            <slot name="done">
              <span>No more items</span>
            </slot>
          </div>
        </template>
      </div>
    </div>
  </DanxScroll>
</template>
