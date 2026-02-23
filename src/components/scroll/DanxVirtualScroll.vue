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
 * - Remote: Items grow via infinite scroll (DanxScroll handles load-more trigger)
 *
 * Items can have variable heights — measured after render via ref callbacks.
 *
 * @props
 *   items: T[] - Array of items to render (required)
 *   defaultItemHeight?: number - Estimated height for unmeasured items (default: 40)
 *   overscan?: number - Extra items above/below viewport (default: 3)
 *   keyFn?: (item: T, index: number) => string | number - Unique key extractor (default: index)
 *   ...DanxScrollProps - All DanxScroll props pass through
 *
 * @emits
 *   loadMore - Passed through to DanxScroll (only when infiniteScroll=true)
 *
 * @slots
 *   item - Scoped slot receiving { item, index } for each visible item
 *   loading - Passed through to DanxScroll
 *   done - Passed through to DanxScroll
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
 * DanxScroll passthrough props — all props except virtual-scroll-specific ones.
 * DanxScroll applies its own defaults, so we only forward what was explicitly set.
 */
const scrollProps = computed(() => {
  const { items: _, defaultItemHeight: _d, overscan: _o, keyFn: _k, ...rest } = props;
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

const { visibleItems, startIndex, totalHeight, startOffset, measureItem, keyFn } =
  useScrollWindow<T>(viewportEl, {
    items: toRef(props, "items"),
    defaultItemHeight: props.defaultItemHeight,
    overscan: props.overscan,
    keyFn: props.keyFn,
  });

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
  <DanxScroll ref="scrollRef" v-bind="scrollProps" @load-more="emit('loadMore')">
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
      </div>
    </div>

    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>

    <template v-if="$slots.done" #done>
      <slot name="done" />
    </template>
  </DanxScroll>
</template>
