import type { PageWindowEntry } from "./types";

/**
 * Compute the visible page-button window for a pagination control.
 *
 * Always includes the first and last page. When `totalPages` fits within
 * `maxVisiblePages`, every page is shown with no ellipsis. Otherwise a
 * sliding window is centered on `current`, clamped to the valid range, with
 * "ellipsis" gap markers inserted wherever the window skips pages.
 *
 * @param current - The current page (1-based). Clamped internally to
 *   `[1, totalPages]` by the caller before invoking this function.
 * @param totalPages - Total number of pages. `<= 0` yields an empty window.
 * @param maxVisiblePages - Guides the width of the sliding window around
 *   `current` before truncation kicks in. Values below 1 are treated as 1.
 */
export function computePageWindow(
  current: number,
  totalPages: number,
  maxVisiblePages: number
): PageWindowEntry[] {
  if (totalPages <= 0) {
    return [];
  }

  const maxVisible = Math.max(1, maxVisiblePages);

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Reserve slots for the always-shown first/last page and the current page
  // itself, then split the remainder evenly to either side of `current`.
  const sideWidth = Math.max(1, Math.floor((maxVisible - 3) / 2));

  let start = current - sideWidth;
  let end = current + sideWidth;

  if (start < 2) {
    end += 2 - start;
    start = 2;
  }
  if (end > totalPages - 1) {
    start -= end - (totalPages - 1);
    end = totalPages - 1;
  }
  start = Math.max(start, 2);
  end = Math.min(end, totalPages - 1);

  const window: PageWindowEntry[] = [1];

  if (start > 2) {
    window.push("ellipsis");
  }
  for (let page = start; page <= end; page++) {
    window.push(page);
  }
  if (end < totalPages - 1) {
    window.push("ellipsis");
  }

  window.push(totalPages);

  return window;
}
