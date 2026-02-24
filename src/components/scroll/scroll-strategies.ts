/**
 * Scroll Recalculation Strategies
 *
 * Two strategies for computing the visible window of items in a virtual scroll:
 *
 * A. Proportional mapping (totalItems known): Maps scroll position directly to
 *    item index for O(1) lookup. totalHeight is fixed at totalItems * defaultItemHeight.
 *
 * B. Walk-from-zero (totalItems unknown): Walks items from index 0 accumulating
 *    heights to find the visible range. totalHeight is computed from all loaded items.
 */

export interface RecalculateResult {
  newStart: number;
  newEnd: number;
  offset: number;
  totalHeight: number;
  placeholdersAfter: number;
}

/** Proportional recalculation when totalItems is known. */
export function recalculateProportional<T>(
  itemList: T[],
  count: number,
  totalItemsCount: number,
  clientHeight: number,
  scrollTop: number,
  overscan: number,
  defaultItemHeight: number,
  getItemHeight: (item: T, index: number) => number
): RecalculateResult {
  const overscanPx = overscan * defaultItemHeight;
  const fixedTotal = totalItemsCount * defaultItemHeight;

  // Convert scroll position directly to item index. Since totalHeight uses
  // defaultItemHeight uniformly, scrollTop / defaultItemHeight gives the exact
  // item index at the viewport top — no ratio drift at large scroll positions.
  const targetIndex = Math.max(
    0,
    Math.min(Math.floor(scrollTop / defaultItemHeight), totalItemsCount - 1)
  );

  // Compute full proportional range (may extend beyond loaded items)
  const fullStart = Math.max(0, targetIndex - overscan);
  const offset = fullStart * defaultItemHeight;

  // Walk forward from fullStart using measured/default heights to fill viewport + overscan
  const fillHeight = clientHeight + 2 * overscanPx;
  let fullEnd = fullStart;
  let filled = 0;
  for (let i = fullStart; i < totalItemsCount; i++) {
    fullEnd = i;
    // Use measured height for loaded items, default for unloaded
    const h = i < count ? getItemHeight(itemList[i]!, i) : defaultItemHeight;
    filled += h;
    if (filled >= fillHeight) break;
  }

  // Clamp visible (loaded) range to items that actually exist
  const newStart = Math.min(fullStart, Math.max(0, count - 1));
  const newEnd = Math.min(fullEnd, Math.max(0, count - 1));

  // Placeholders: indices in the full range that fall outside loaded items
  const placeholdersAfter = Math.max(0, fullEnd - Math.max(0, count - 1));

  return {
    newStart,
    newEnd,
    offset,
    totalHeight: fixedTotal,
    placeholdersAfter,
  };
}

/** Walk-from-zero recalculation when totalItems is not known. */
export function recalculateWalkFromZero<T>(
  itemList: T[],
  count: number,
  clientHeight: number,
  scrollTop: number,
  overscan: number,
  defaultItemHeight: number,
  getItemHeight: (item: T, index: number) => number
): RecalculateResult {
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

  return {
    newStart,
    newEnd,
    offset,
    totalHeight: total,
    placeholdersAfter: 0,
  };
}
