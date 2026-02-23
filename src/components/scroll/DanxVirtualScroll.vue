<script setup lang="ts" generic="T">
/**
 * DanxVirtualScroll - Windowed rendering for large lists
 *
 * Renders only the items visible in the viewport (plus an overscan buffer),
 * using spacer divs to maintain correct scroll height. Built on top of
 * DanxScroll for custom overlay scrollbars.
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

const keyFn = props.keyFn ?? ((_item: T, index: number) => index);

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

const { visibleItems, startIndex, topSpacerHeight, bottomSpacerHeight, measureItem } =
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
    <!-- Top spacer -->
    <div :style="{ height: topSpacerHeight + 'px' }" />

    <!-- Visible items -->
    <div
      v-for="(item, i) in visibleItems"
      :key="keyFn(item, startIndex + i)"
      :ref="itemRef(startIndex + i)"
    >
      <slot name="item" :item="item" :index="startIndex + i" />
    </div>

    <!-- Bottom spacer -->
    <div :style="{ height: bottomSpacerHeight + 'px' }" />

    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>

    <template v-if="$slots.done" #done>
      <slot name="done" />
    </template>
  </DanxScroll>
</template>
