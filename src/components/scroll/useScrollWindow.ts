/**
 * useScrollWindow - Virtual scroll composable for windowed rendering
 *
 * Computes which items are visible in a scrollable viewport and provides
 * spacer heights so only a window of N items is rendered at any time.
 * Supports variable item heights via measurement after render.
 *
 * Algorithm:
 * 1. On scroll (throttled via requestAnimationFrame), read scrollTop and clientHeight
 * 2. Walk items from index 0, accumulating heights (cached or estimated)
 * 3. Find startIndex/endIndex for the visible + overscan range
 * 4. Compute top/bottom spacer heights for correct scroll position
 *
 * @param viewportEl - Ref to the scrollable viewport element
 * @param options - Configuration: items array, defaultItemHeight, overscan, keyFn
 * @returns Visible items, spacer heights, measurement function, scrollToIndex, totalHeight
 */
import { type Ref, computed, onUnmounted, ref, watch } from "vue";
import type { ScrollWindowOptions, ScrollWindowReturn } from "./virtual-scroll-types";

export function useScrollWindow<T>(
  viewportEl: Ref<HTMLElement | null>,
  options: ScrollWindowOptions<T>
): ScrollWindowReturn<T> {
  const { items, defaultItemHeight = 40, overscan = 3 } = options;
  const keyFn = options.keyFn ?? ((_item: T, index: number) => index);

  const startIndex = ref(0);
  const endIndex = ref(0);
  const topSpacerHeight = ref(0);
  const bottomSpacerHeight = ref(0);

  /** Height cache keyed by item key. Permanent per key. */
  const heightCache = new Map<string | number, number>();

  /** Whether a rAF update is already scheduled. */
  let rafPending = false;

  function getItemHeight(item: T, index: number): number {
    const key = keyFn(item, index);
    return heightCache.get(key) ?? defaultItemHeight;
  }

  /**
   * Recalculate visible range and spacer heights from current scroll position.
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
      topSpacerHeight.value = 0;
      bottomSpacerHeight.value = 0;
      return;
    }

    // Overscan buffer in pixels
    const overscanPx = overscan * defaultItemHeight;

    const viewTop = Math.max(0, scrollTop - overscanPx);
    const viewBottom = scrollTop + clientHeight + overscanPx;

    let accumulated = 0;
    let newStart = 0;
    let newEnd = count - 1;
    let foundStart = false;

    for (let i = 0; i < count; i++) {
      const h = getItemHeight(itemList[i]!, i);
      if (!foundStart && accumulated + h > viewTop) {
        newStart = i;
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

    // Compute top spacer: sum of heights for items before startIndex
    let topHeight = 0;
    for (let i = 0; i < newStart; i++) {
      topHeight += getItemHeight(itemList[i]!, i);
    }

    // Compute bottom spacer: sum of heights for items after endIndex
    let bottomHeight = 0;
    for (let i = newEnd + 1; i < count; i++) {
      bottomHeight += getItemHeight(itemList[i]!, i);
    }

    startIndex.value = newStart;
    endIndex.value = newEnd;
    topSpacerHeight.value = topHeight;
    bottomSpacerHeight.value = bottomHeight;
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
    if (height > 0) {
      heightCache.set(key, height);
    }
  }

  function scrollToIndex(index: number) {
    const el = viewportEl.value;
    if (!el) return;
    const itemList = items.value;
    let targetTop = 0;
    for (let i = 0; i < Math.min(index, itemList.length); i++) {
      targetTop += getItemHeight(itemList[i]!, i);
    }
    el.scrollTop = targetTop;
  }

  const visibleItems = computed(() => {
    const itemList = items.value;
    if (itemList.length === 0) return [];
    return itemList.slice(startIndex.value, endIndex.value + 1);
  });

  const totalHeight = computed(() => {
    const itemList = items.value;
    let total = 0;
    for (let i = 0; i < itemList.length; i++) {
      total += getItemHeight(itemList[i]!, i);
    }
    return total;
  });

  return {
    visibleItems,
    startIndex,
    endIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    measureItem,
    scrollToIndex,
    totalHeight,
  };
}
