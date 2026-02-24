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
import { recalculateProportional, recalculateWalkFromZero } from "./scroll-strategies";
import type { ScrollWindowOptions, ScrollWindowReturn } from "./virtual-scroll-types";

export function useScrollWindow<T>(
  viewportEl: Ref<HTMLElement | null>,
  options: ScrollWindowOptions<T>
): ScrollWindowReturn<T> {
  const { items, defaultItemHeight = 40, overscan = 3, totalItems, debug } = options;
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

  /**
   * Number of skeleton placeholder rows needed after loaded items when scrolled
   * past the loaded range (totalItems mode only). Zero when all visible items are loaded.
   */
  const placeholdersAfter = ref(0);

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
   * Tracks the last scrollTop that triggered a recalculate so we can
   * distinguish scroll-driven recalculates from measurement-driven ones.
   * When measurements trigger a recalculate but scrollTop hasn't changed,
   * startIndex is kept stable to prevent oscillation from variable heights.
   */
  let lastScrollTop = -1;

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
      placeholdersAfter.value = 0;
      lastScrollTop = scrollTop;
      return;
    }

    const scrollChanged = scrollTop !== lastScrollTop;
    lastScrollTop = scrollTop;

    const result =
      totalItems != null
        ? recalculateProportional(
            itemList,
            count,
            totalItems,
            clientHeight,
            scrollTop,
            overscan,
            defaultItemHeight,
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

    // Only update startIndex when scrollTop actually changed. Measurement-
    // triggered recalculates (same scrollTop) can oscillate startIndex ±1
    // with variable heights, causing visible jitter. Keep startIndex stable
    // and only update totalHeight/endIndex for scrollbar accuracy.
    if (debug) {
      console.log(
        `[recalc] scrollTop=${scrollTop} scrollChanged=${scrollChanged}` +
          ` result.start=${result.newStart} result.end=${result.newEnd}` +
          ` result.offset=${result.offset} current.start=${startIndex.value}` +
          ` totalHeight=${result.totalHeight} cacheSize=${heightCache.size}`
      );
    }
    if (scrollChanged) {
      startIndex.value = result.newStart;
      startOffset.value = result.offset;
    }
    endIndex.value = result.newEnd;
    totalHeight.value = result.totalHeight;
    placeholdersAfter.value = result.placeholdersAfter;
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
      if (debug) {
        console.log(`[measure] key=${key} old=${heightCache.get(key) ?? "none"} new=${height}`);
      }
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
    placeholdersAfter,
    measureItem,
    scrollToIndex,
    keyFn,
  };
}
