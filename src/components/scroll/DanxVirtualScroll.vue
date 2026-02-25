<script setup lang="ts" generic="T">
/**
 * DanxVirtualScroll - Windowed rendering for large lists
 *
 * Renders only the items visible in the viewport (plus an overscan buffer),
 * using absolute positioning within a fixed-size container. Built on top of
 * DanxScroll for custom overlay scrollbars.
 *
 * Supports both vertical (default) and horizontal scrolling via the inherited
 * direction prop. In horizontal mode, items flow left-to-right and the virtual
 * window uses width/left instead of height/top.
 *
 * Uses absolute positioning instead of spacer divs: a single container div
 * with size=totalSize holds the visible items at their computed offsets.
 * This keeps scroll size stable and prevents scrollbar oscillation.
 *
 * Supports two modes:
 * - Local: All items passed upfront, only visible window rendered
 * - Remote: Items grow via infinite scroll (DanxVirtualScroll handles load-more directly)
 *
 * Items can have variable sizes — measured after render via ref callbacks.
 *
 * @props
 *   items: T[] - Array of items to render (required)
 *   defaultItemSize?: number - Estimated size (height or width) for unmeasured items (default: 40)
 *   overscan?: number - Extra items above/below (or before/after) viewport (default: 3)
 *   keyFn?: (item: T, index: number) => string | number - Unique key extractor (default: index)
 *   totalItems?: number - Total items in full dataset (for stable scrollbar in remote mode)
 *   direction?: ScrollDirection - Scroll axis: "vertical" (default) or "horizontal"
 *   infiniteScroll?: boolean - Enable infinite scroll (read once at mount, not reactive) (default: false)
 *   loading?: boolean - Load in progress (default: false)
 *   canLoadMore?: boolean - Whether more items exist (default: true)
 *   distance?: number - Pixel threshold for infinite trigger (default: 200)
 *   infiniteDirection?: InfiniteScrollEdge - Edge for loading (default: "bottom")
 *   scrollPosition?: number - v-model for current first visible item index (default: 0).
 *     Updates on scroll; setting from parent scrolls to that index.
 *   debug?: boolean - Enable debug console logging for this instance (default: false)
 *   ...DanxScrollProps - Non-infinite-scroll DanxScroll props pass through
 *
 * @emits
 *   update:scrollPosition - Emitted when the first visible item index changes
 *   loadMore - Fired when scroll threshold crossed (only when infiniteScroll=true)
 *
 * @slots
 *   item - Scoped slot receiving { item, index } for each visible item
 *   placeholder - Skeleton slot for unloaded items (totalItems mode). Receives { index }. Default: DanxSkeleton rounded bar.
 *   loading - Loading indicator (shown at end of visible items when loading=true)
 *   done - Done indicator (shown at end of visible items when canLoadMore=false)
 *
 * @tokens
 *   Inherits all DanxScroll CSS tokens
 *   --dx-virtual-scroll-skeleton-padding - Placeholder cell padding (default: 0 0.75rem)
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
 *     direction="horizontal"
 *     :defaultItemSize="120"
 *     class="h-48"
 *   >
 *     <template #item="{ item }">
 *       <div class="w-28 h-full">{{ item.name }}</div>
 *     </template>
 *   </DanxVirtualScroll>
 */
import { type ComponentPublicInstance, computed, onMounted, ref, toRef, watch } from "vue";
import { DanxSkeleton } from "../skeleton";
import DanxScroll from "./DanxScroll.vue";
import { setupScrollInfinite } from "./useScrollInfinite";
import { useScrollWindow } from "./useScrollWindow";
import type { DanxVirtualScrollProps, DanxVirtualScrollSlots } from "./virtual-scroll-types";

const props = withDefaults(defineProps<DanxVirtualScrollProps<T>>(), {
  defaultItemSize: 40,
  overscan: 3,
  canLoadMore: true,
});

const emit = defineEmits<{
  loadMore: [];
}>();

const scrollPosition = defineModel<number>("scrollPosition", { default: 0 });

defineSlots<DanxVirtualScrollSlots<T>>();

const isHorizontal = computed(() => props.direction === "horizontal");

/**
 * DanxScroll passthrough props — virtual-scroll-specific and infinite scroll props
 * are filtered out. DanxVirtualScroll handles infinite scroll directly so that
 * loading/done indicators render inside the positioned wrapper instead of at the
 * bottom of the viewport where absolute positioning would misplace them.
 */
const scrollProps = computed(() => {
  const {
    items: _,
    defaultItemSize: _d,
    overscan: _o,
    keyFn: _k,
    totalItems: _t,
    infiniteScroll: _is,
    loading: _l,
    canLoadMore: _c,
    distance: _dist,
    infiniteDirection: _dir,
    debug: _dbg,
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

const {
  visibleItems,
  startIndex,
  endIndex,
  totalSize,
  startOffset,
  placeholdersAfter,
  measureItem,
  scrollToIndex,
  keyFn,
} = useScrollWindow<T>(viewportEl, {
  items: toRef(props, "items"),
  defaultItemSize: props.defaultItemSize,
  overscan: props.overscan,
  keyFn: props.keyFn,
  totalItems: props.totalItems,
  direction: props.direction,
  debug: props.debug,
});

// DanxVirtualScroll handles infinite scroll directly so indicators render
// inside the positioned wrapper (not at the bottom of DanxScroll's viewport).
// When totalItems is set, the scroll container is sized for the full dataset
// so distance-based triggering (useScrollInfinite) never fires — instead we
// watch endIndex to trigger when the visible window reaches loaded items.
if (props.infiniteScroll) {
  if (props.totalItems != null) {
    watch(endIndex, (end) => {
      if (end >= props.items.length - 1 && !props.loading && props.canLoadMore) {
        emit("loadMore");
      }
    });
  } else {
    setupScrollInfinite(viewportEl, props, emit);
  }
}

// Bidirectional sync between scrollPosition model and startIndex.
// Two guard flags prevent circular updates and jitter:
// - scrollPositionUpdating: parent set scrollPosition → suppress startIndex echo
// - fromScrollEvent: startIndex updated scrollPosition → suppress scrollToIndex
let scrollPositionUpdating = false;
let fromScrollEvent = false;

watch(startIndex, (index) => {
  if (!scrollPositionUpdating && index !== scrollPosition.value) {
    if (props.debug)
      console.log(`[scroll→model] startIndex=${index} scrollPosition=${scrollPosition.value}`);
    fromScrollEvent = true;
    scrollPosition.value = index;
  }
});

watch(scrollPosition, (index) => {
  if (fromScrollEvent) {
    if (props.debug) console.log(`[model skip] fromScrollEvent, index=${index}`);
    fromScrollEvent = false;
    return;
  }
  if (index !== startIndex.value) {
    if (props.debug)
      console.log(
        `[model→scroll] scrollPosition=${index} startIndex=${startIndex.value} → scrollToIndex`
      );
    scrollPositionUpdating = true;
    scrollToIndex(index);
    requestAnimationFrame(() => {
      scrollPositionUpdating = false;
    });
  }
});

/** Whether the user has scrolled to the end of loaded items */
const isAtEnd = computed(() => endIndex.value >= props.items.length - 1);

/** Axis property names derived from direction. */
const sizeProp = computed(() => (isHorizontal.value ? "width" : "height"));
const posProp = computed(() => (isHorizontal.value ? "left" : "top"));
const crossProp = computed(() => (isHorizontal.value ? "height" : "width"));

/** Container style: sets the total scrollable size along the active axis. */
const containerStyle = computed(() => ({
  [sizeProp.value]: totalSize.value + "px",
  [crossProp.value]: isHorizontal.value ? "100%" : undefined,
  position: "relative" as const,
  flexShrink: 0,
}));

/** Positioned wrapper style: offsets visible items along the active axis. */
const wrapperStyle = computed(() => ({
  position: "absolute" as const,
  [posProp.value]: startOffset.value + "px",
  [crossProp.value]: "100%",
  ...(isHorizontal.value ? { display: "flex", flexDirection: "row" as const } : {}),
}));

/** Placeholder sizing style: uses size along the active axis. */
const placeholderStyle = computed(() => ({
  [sizeProp.value]: props.defaultItemSize + "px",
}));

function itemRef(index: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    if (!el || !(el instanceof HTMLElement)) return;
    const key = keyFn(props.items[index]!, index);
    measureItem(key, el);
  };
}
</script>

<template>
  <DanxScroll ref="scrollRef" v-bind="scrollProps">
    <!-- Container sized to total content size for correct scrollbar -->
    <div :style="containerStyle">
      <!--
        Single absolutely-positioned wrapper at startOffset.
        Visible items flow naturally inside it.
        In vertical mode: items stack top-to-bottom (default block flow).
        In horizontal mode: items flow left-to-right (flexbox row).
      -->
      <div :style="wrapperStyle">
        <div
          v-for="(item, i) in visibleItems"
          :key="keyFn(item, startIndex + i)"
          :ref="itemRef(startIndex + i)"
        >
          <slot name="item" :item="item" :index="startIndex + i" />
        </div>

        <!-- Placeholder skeleton slots for unloaded items (totalItems mode) -->
        <div
          v-for="p in placeholdersAfter"
          :key="'placeholder-' + (endIndex + p)"
          :style="placeholderStyle"
          class="danx-virtual-scroll__placeholder"
        >
          <slot name="placeholder" :index="endIndex + p">
            <DanxSkeleton
              shape="rounded"
              style="--dx-skeleton-width: 60%; --dx-skeleton-height: 40%"
            />
          </slot>
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

<style>
.danx-virtual-scroll__placeholder {
  display: flex;
  align-items: center;
  padding: var(--dx-virtual-scroll-skeleton-padding, 0 0.75rem);
}
</style>
