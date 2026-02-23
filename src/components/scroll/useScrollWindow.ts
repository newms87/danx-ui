/**
 * useScrollWindow - Virtual scroll composable for windowed rendering
 *
 * Computes which items are visible in a scrollable viewport and provides
 * absolute positioning data so only a window of N items is rendered at a time.
 * Supports variable item heights via measurement after render.
 *
 * Uses absolute positioning instead of spacer divs to avoid oscillation:
 * a single container div with height=totalHeight holds absolutely-positioned
 * visible items. scrollHeight is stable (only changes when heights are
 * measured), so the scrollbar never glitches.
 *
 * Two recalculation strategies:
 *
 * A. Proportional mapping (when totalItems is provided):
 *    Scroll position maps proportionally to item index. totalHeight is fixed
 *    at totalItems * defaultItemHeight for a stable scrollbar. Dragging to 50%
 *    shows items near the dataset midpoint. startOffset uses defaultItemHeight
 *    for consistency with the proportional totalHeight (measured heights only
 *    affect the visible window's internal layout, not scroll mapping).
 *
 * B. Walk-from-zero (when totalItems is not provided):
 *    Walks items from index 0 accumulating heights (cached or estimated) to
 *    find the visible range. totalHeight is computed from all loaded items.
 *
 * Common steps:
 * 1. On scroll (throttled via requestAnimationFrame), read scrollTop and clientHeight
 * 2. Find startIndex/endIndex via strategy A or B
 * 3. Compute absolute top offset for first visible item
 * 4. After items are measured, recalculate (batched via microtask) to keep
 *    positions consistent with actual heights
 *
 * @param viewportEl - Ref to the scrollable viewport element
 * @param options - Configuration: items, defaultItemHeight, overscan, keyFn, totalItems
 * @returns Visible items, positions, measurement function, scrollToIndex, totalHeight
 */
import { type Ref, computed, onUnmounted, ref, watch } from "vue";
import type { ScrollWindowOptions, ScrollWindowReturn } from "./virtual-scroll-types";

/** Proportional recalculation when totalItems is known. */
function recalculateProportional<T>(
  itemList: T[],
  count: number,
  clientHeight: number,
  scrollTop: number,
  overscan: number,
  defaultItemHeight: number,
  totalItemsCount: number,
  getItemHeight: (item: T, index: number) => number
) {
  const overscanPx = overscan * defaultItemHeight;
  const fixedTotal = totalItemsCount * defaultItemHeight;

  // Convert scroll position directly to item index. Since totalHeight uses
  // defaultItemHeight uniformly, scrollTop / defaultItemHeight gives the exact
  // item index at the viewport top — no ratio drift at large scroll positions.
  const targetIndex = Math.max(
    0,
    Math.min(Math.floor(scrollTop / defaultItemHeight), totalItemsCount - 1)
  );

  // Clamp newStart to loaded item range so visibleItems slice is valid
  let newStart = Math.min(Math.max(0, targetIndex - overscan), Math.max(0, count - 1));
  const offset = newStart * defaultItemHeight;

  // Walk forward from newStart using measured heights to fill viewport + overscan
  const fillHeight = clientHeight + 2 * overscanPx;
  let newEnd = count - 1; // Fallback if loop doesn't fill
  let filled = 0;
  for (let i = newStart; i < count; i++) {
    newEnd = i;
    filled += getItemHeight(itemList[i]!, i);
    if (filled >= fillHeight) break;
  }

  return { newStart, newEnd, offset, totalHeight: fixedTotal };
}

/** Walk-from-zero recalculation when totalItems is not known. */
function recalculateWalkFromZero<T>(
  itemList: T[],
  count: number,
  clientHeight: number,
  scrollTop: number,
  overscan: number,
  defaultItemHeight: number,
  getItemHeight: (item: T, index: number) => number
) {
  const overscanPx = overscan * defaultItemHeight;
  const viewTop = Math.max(0, scrollTop - overscanPx);
  const viewBottom = scrollTop + clientHeight + overscanPx;

  let accumulated = 0;
  let newStart = 0;
  let newEnd = count - 1;
  let foundStart = false;
  let offset = 0;

  for (let i = 0; i < count; i++) {
    const h = getItemHeight(itemList[i]!, i);
    if (!foundStart && accumulated + h > viewTop) {
      newStart = i;
      offset = accumulated;
      foundStart = true;
    }
    accumulated += h;
    if (foundStart && accumulated >= viewBottom) {
      newEnd = i;
      break;
    }
  }

  if (!foundStart) {
    newStart = Math.max(0, count - 1);
    newEnd = count - 1;
  }

  // Compute totalHeight from all loaded items
  let total = accumulated;
  for (let i = newEnd + 1; i < count; i++) {
    total += getItemHeight(itemList[i]!, i);
  }

  return { newStart, newEnd, offset, totalHeight: total };
}

export function useScrollWindow<T>(
  viewportEl: Ref<HTMLElement | null>,
  options: ScrollWindowOptions<T>
): ScrollWindowReturn<T> {
  const { items, defaultItemHeight = 40, overscan = 3, totalItems } = options;
  const keyFn = options.keyFn ?? ((_item: T, index: number) => index);

  const startIndex = ref(0);
  const endIndex = ref(0);

  /**
   * Total height of all items (cached or estimated). Used as the container
   * div height to give the scrollbar the correct size.
   */
  const totalHeight = ref(0);

  /**
   * Absolute top offset for the first visible item (startIndex).
   * Each subsequent item is positioned at startOffset + sum of preceding visible heights.
   */
  const startOffset = ref(0);

  /** Height cache keyed by item key. Permanent per key. */
  const heightCache = new Map<string | number, number>();

  /** Whether a rAF update is already scheduled. */
  let rafPending = false;

  /** Whether measurement-triggered recalculate is batched via microtask. */
  let measureBatchPending = false;

  function getItemHeight(item: T, index: number): number {
    const key = keyFn(item, index);
    return heightCache.get(key) ?? defaultItemHeight;
  }

  /**
   * Recalculate visible range and positioning from current scroll position.
   */
  function recalculate() {
    const el = viewportEl.value;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    const itemList = items.value;
    const count = itemList.length;

    if (count === 0) {
      startIndex.value = 0;
      endIndex.value = 0;
      totalHeight.value = totalItems != null ? totalItems * defaultItemHeight : 0;
      startOffset.value = 0;
      return;
    }

    const result =
      totalItems != null
        ? recalculateProportional(
            itemList,
            count,
            clientHeight,
            scrollTop,
            overscan,
            defaultItemHeight,
            totalItems,
            getItemHeight
          )
        : recalculateWalkFromZero(
            itemList,
            count,
            clientHeight,
            scrollTop,
            overscan,
            defaultItemHeight,
            getItemHeight
          );

    startIndex.value = result.newStart;
    endIndex.value = result.newEnd;
    startOffset.value = result.offset;
    totalHeight.value = result.totalHeight;
  }

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      recalculate();
    });
  }

  // Track the current listener so we can clean up on viewport change
  let currentEl: HTMLElement | null = null;

  function attachListener(el: HTMLElement | null) {
    if (currentEl) {
      currentEl.removeEventListener("scroll", onScroll);
    }
    currentEl = el;
    if (el) {
      el.addEventListener("scroll", onScroll, { passive: true });
      recalculate();
    }
  }

  // Watch for viewport element changes
  watch(viewportEl, (el) => attachListener(el), { immediate: true });

  // Recalculate when items array changes (e.g. remote load adds items)
  watch(
    () => items.value.length,
    () => recalculate()
  );

  onUnmounted(() => {
    if (currentEl) {
      currentEl.removeEventListener("scroll", onScroll);
      currentEl = null;
    }
  });

  function measureItem(key: string | number, el: HTMLElement | null) {
    if (!el) return;
    const height = el.offsetHeight;
    if (height > 0 && heightCache.get(key) !== height) {
      heightCache.set(key, height);
      // Batch measurement-triggered recalculates via microtask so all items
      // measured in a single render cycle produce one recalculate, keeping
      // positions consistent with cached measurements.
      if (!measureBatchPending) {
        measureBatchPending = true;
        queueMicrotask(() => {
          measureBatchPending = false;
          recalculate();
        });
      }
    }
  }

  /**
   * Scroll the viewport to bring the given item index into view.
   * When totalItems is provided, uses proportional scroll mapping so that
   * scrollToIndex(N) produces the same scroll position as dragging the
   * scrollbar to index N. Without totalItems, walks accumulated heights.
   */
  function scrollToIndex(index: number) {
    const el = viewportEl.value;
    if (!el) return;

    if (totalItems != null) {
      // Direct conversion: index * defaultItemHeight is the scroll position,
      // matching how recalculateProportional derives index from scrollTop.
      el.scrollTop = index * defaultItemHeight;
    } else {
      const itemList = items.value;
      let targetTop = 0;
      for (let i = 0; i < Math.min(index, itemList.length); i++) {
        targetTop += getItemHeight(itemList[i]!, i);
      }
      el.scrollTop = targetTop;
    }
  }

  const visibleItems = computed(() => {
    if (!viewportEl.value) return [];
    const itemList = items.value;
    if (itemList.length === 0) return [];
    return itemList.slice(startIndex.value, endIndex.value + 1);
  });

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    startOffset,
    measureItem,
    scrollToIndex,
    keyFn,
  };
}
