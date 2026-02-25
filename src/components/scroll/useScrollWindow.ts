/**
 * useScrollWindow - Virtual scroll composable for windowed rendering
 *
 * Computes which items are visible in a scrollable viewport and provides
 * absolute positioning data so only a window of N items is rendered at a time.
 * Supports variable item sizes via measurement after render.
 *
 * Axis-agnostic: when direction is "vertical" (default), reads scrollTop/clientHeight
 * and positions with height/top. When "horizontal", reads scrollLeft/clientWidth
 * and positions with width/left. The scroll strategies are already axis-agnostic —
 * only the DOM property access layer changes.
 *
 * Uses absolute positioning instead of spacer divs to avoid oscillation:
 * a single container div with size=totalSize holds absolutely-positioned
 * visible items. scroll size is stable (only changes when sizes are
 * measured), so the scrollbar never glitches.
 *
 * Two recalculation strategies:
 *
 * A. Proportional mapping (when totalItems is provided):
 *    Scroll position maps proportionally to item index. totalSize is fixed
 *    at totalItems * defaultItemSize for a stable scrollbar. Dragging to 50%
 *    shows items near the dataset midpoint. startOffset uses defaultItemSize
 *    for consistency with the proportional totalSize (measured sizes only
 *    affect the visible window's internal layout, not scroll mapping).
 *
 * B. Walk-from-zero (when totalItems is not provided):
 *    Walks items from index 0 accumulating sizes (cached or estimated) to
 *    find the visible range. totalSize is computed from all loaded items.
 *
 * Common steps:
 * 1. On scroll (throttled via requestAnimationFrame), read scroll position and client size
 * 2. Find startIndex/endIndex via strategy A or B
 * 3. Compute absolute offset for first visible item
 * 4. After items are measured, recalculate (batched via microtask) to keep
 *    positions consistent with actual sizes
 *
 * @param viewportEl - Ref to the scrollable viewport element
 * @param options - Configuration: items, defaultItemSize, overscan, keyFn, totalItems, direction
 * @returns Visible items, positions, measurement function, scrollToIndex, totalSize
 */
import { type Ref, computed, onUnmounted, ref, watch } from "vue";
import { recalculateProportional, recalculateWalkFromZero } from "./scroll-strategies";
import type { ScrollWindowOptions, ScrollWindowReturn } from "./virtual-scroll-types";

export function useScrollWindow<T>(
  viewportEl: Ref<HTMLElement | null>,
  options: ScrollWindowOptions<T>
): ScrollWindowReturn<T> {
  const {
    items,
    defaultItemSize = 40,
    overscan = 3,
    totalItems,
    direction = "vertical",
    debug,
  } = options;
  const keyFn = options.keyFn ?? ((_item: T, index: number) => index);
  const isHorizontal = direction === "horizontal";

  /** Read the scroll position along the active axis. */
  function scrollPos(el: HTMLElement): number {
    return isHorizontal ? el.scrollLeft : el.scrollTop;
  }

  /** Read the viewport size along the active axis. */
  function clientSize(el: HTMLElement): number {
    return isHorizontal ? el.clientWidth : el.clientHeight;
  }

  /** Read the rendered size of an item along the active axis. */
  function itemSize(el: HTMLElement): number {
    return isHorizontal ? el.offsetWidth : el.offsetHeight;
  }

  /** Set the scroll position along the active axis. */
  function setScrollPos(el: HTMLElement, value: number) {
    if (isHorizontal) {
      el.scrollLeft = value;
    } else {
      el.scrollTop = value;
    }
  }

  const startIndex = ref(0);
  const endIndex = ref(0);

  /**
   * Total size of all items (cached or estimated). Used as the container
   * div size to give the scrollbar the correct extent.
   */
  const totalSize = ref(0);

  /**
   * Absolute offset for the first visible item (startIndex).
   * Each subsequent item is positioned at startOffset + sum of preceding visible sizes.
   */
  const startOffset = ref(0);

  /**
   * Number of skeleton placeholder slots needed after loaded items when scrolled
   * past the loaded range (totalItems mode only). Zero when all visible items are loaded.
   */
  const placeholdersAfter = ref(0);

  /** Size cache keyed by item key. Permanent per key. */
  const sizeCache = new Map<string | number, number>();

  /** Whether a rAF update is already scheduled. */
  let rafPending = false;

  /** Whether measurement-triggered recalculate is batched via microtask. */
  let measureBatchPending = false;

  function getItemSize(item: T, index: number): number {
    const key = keyFn(item, index);
    return sizeCache.get(key) ?? defaultItemSize;
  }

  /**
   * Tracks the last scroll position that triggered a recalculate so we can
   * distinguish scroll-driven recalculates from measurement-driven ones.
   * When measurements trigger a recalculate but scroll position hasn't changed,
   * startIndex is kept stable to prevent oscillation from variable sizes.
   */
  let lastScrollPos = -1;

  /**
   * Recalculate visible range and positioning from current scroll position.
   */
  function recalculate() {
    const el = viewportEl.value;
    if (!el) return;

    const currentScrollPos = scrollPos(el);
    const currentClientSize = clientSize(el);
    const itemList = items.value;
    const count = itemList.length;

    if (count === 0) {
      startIndex.value = 0;
      endIndex.value = 0;
      totalSize.value = totalItems != null ? totalItems * defaultItemSize : 0;
      startOffset.value = 0;
      placeholdersAfter.value = 0;
      lastScrollPos = currentScrollPos;
      return;
    }

    const scrollChanged = currentScrollPos !== lastScrollPos;
    lastScrollPos = currentScrollPos;

    const result =
      totalItems != null
        ? recalculateProportional(
            itemList,
            count,
            totalItems,
            currentClientSize,
            currentScrollPos,
            overscan,
            defaultItemSize,
            getItemSize
          )
        : recalculateWalkFromZero(
            itemList,
            count,
            currentClientSize,
            currentScrollPos,
            overscan,
            defaultItemSize,
            getItemSize
          );

    // Only update startIndex when scroll position actually changed. Measurement-
    // triggered recalculates (same scroll position) can oscillate startIndex ±1
    // with variable sizes, causing visible jitter. Keep startIndex stable
    // and only update totalSize/endIndex for scrollbar accuracy.
    if (debug) {
      console.log(
        `[recalc] scrollPos=${currentScrollPos} scrollChanged=${scrollChanged}` +
          ` result.start=${result.newStart} result.end=${result.newEnd}` +
          ` result.offset=${result.offset} current.start=${startIndex.value}` +
          ` totalSize=${result.totalSize} cacheSize=${sizeCache.size}`
      );
    }
    if (scrollChanged) {
      startIndex.value = result.newStart;
      startOffset.value = result.offset;
    }
    endIndex.value = result.newEnd;
    totalSize.value = result.totalSize;
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
    const size = itemSize(el);
    if (size > 0 && sizeCache.get(key) !== size) {
      if (debug) {
        console.log(`[measure] key=${key} old=${sizeCache.get(key) ?? "none"} new=${size}`);
      }
      sizeCache.set(key, size);
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
   * scrollbar to index N. Without totalItems, walks accumulated sizes.
   */
  function scrollToIndex(index: number) {
    const el = viewportEl.value;
    if (!el) return;

    if (totalItems != null) {
      // Direct conversion: index * defaultItemSize is the scroll position,
      // matching how recalculateProportional derives index from scrollPos.
      setScrollPos(el, index * defaultItemSize);
    } else {
      const itemList = items.value;
      let targetPos = 0;
      for (let i = 0; i < Math.min(index, itemList.length); i++) {
        targetPos += getItemSize(itemList[i]!, i);
      }
      setScrollPos(el, targetPos);
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
    totalSize,
    startOffset,
    placeholdersAfter,
    measureItem,
    scrollToIndex,
    keyFn,
  };
}
