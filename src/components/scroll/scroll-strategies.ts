/**
 * Scroll Recalculation Strategies
 *
 * Two strategies for computing the visible window of items in a virtual scroll:
 *
 * A. Proportional mapping (totalItems known): Maps scroll position directly to
 *    item index for O(1) lookup. totalSize is fixed at totalItems * defaultItemSize.
 *
 * B. Walk-from-zero (totalItems unknown): Walks items from index 0 accumulating
 *    sizes to find the visible range. totalSize is computed from all loaded items.
 */

export interface RecalculateResult {
  newStart: number;
  newEnd: number;
  offset: number;
  totalSize: number;
  placeholdersAfter: number;
}

/** Proportional recalculation when totalItems is known. */
export function recalculateProportional<T>(
  itemList: T[],
  count: number,
  totalItemsCount: number,
  clientSize: number,
  scrollPos: number,
  overscan: number,
  defaultItemSize: number,
  getItemSize: (item: T, index: number) => number
): RecalculateResult {
  const overscanPx = overscan * defaultItemSize;
  const fixedTotal = totalItemsCount * defaultItemSize;

  // Convert scroll position directly to item index. Since totalSize uses
  // defaultItemSize uniformly, scrollPos / defaultItemSize gives the exact
  // item index at the viewport leading edge — no ratio drift at large positions.
  const targetIndex = Math.max(
    0,
    Math.min(Math.floor(scrollPos / defaultItemSize), totalItemsCount - 1)
  );

  // Compute full proportional range (may extend beyond loaded items)
  const fullStart = Math.max(0, targetIndex - overscan);
  const offset = fullStart * defaultItemSize;

  // Walk forward from fullStart using measured/default sizes to fill viewport + overscan
  const fillSize = clientSize + 2 * overscanPx;
  let fullEnd = fullStart;
  let filled = 0;
  for (let i = fullStart; i < totalItemsCount; i++) {
    fullEnd = i;
    // Use measured size for loaded items, default for unloaded
    const s = i < count ? getItemSize(itemList[i]!, i) : defaultItemSize;
    filled += s;
    if (filled >= fillSize) break;
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
    totalSize: fixedTotal,
    placeholdersAfter,
  };
}

/** Walk-from-zero recalculation when totalItems is not known. */
export function recalculateWalkFromZero<T>(
  itemList: T[],
  count: number,
  clientSize: number,
  scrollPos: number,
  overscan: number,
  defaultItemSize: number,
  getItemSize: (item: T, index: number) => number
): RecalculateResult {
  const overscanPx = overscan * defaultItemSize;
  const viewTop = Math.max(0, scrollPos - overscanPx);
  const viewBottom = scrollPos + clientSize + overscanPx;

  let accumulated = 0;
  let newStart = 0;
  let newEnd = count - 1;
  let foundStart = false;
  let offset = 0;

  for (let i = 0; i < count; i++) {
    const s = getItemSize(itemList[i]!, i);
    if (!foundStart && accumulated + s > viewTop) {
      newStart = i;
      offset = accumulated;
      foundStart = true;
    }
    accumulated += s;
    if (foundStart && accumulated >= viewBottom) {
      newEnd = i;
      break;
    }
  }

  if (!foundStart) {
    newStart = Math.max(0, count - 1);
    newEnd = count - 1;
  }

  // Compute totalSize from all loaded items
  let total = accumulated;
  for (let i = newEnd + 1; i < count; i++) {
    total += getItemSize(itemList[i]!, i);
  }

  return {
    newStart,
    newEnd,
    offset,
    totalSize: total,
    placeholdersAfter: 0,
  };
}
