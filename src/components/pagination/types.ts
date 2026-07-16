/**
 * DanxPagination Type Definitions
 */

/** A single entry in the rendered page window: a page number or an ellipsis gap marker. */
export type PageWindowEntry = number | "ellipsis";

export interface DanxPaginationProps {
  /**
   * Total number of items across all pages. Drop-in compatible with a
   * `ListController`'s `pagedItems.meta.total` / pager `total` field.
   */
  total: number;

  /**
   * Page-size choices offered by the optional per-page selector.
   * @default [10, 25, 50, 100]
   */
  perPageOptions?: number[];

  /**
   * Show the optional per-page selector dropdown.
   * @default false
   */
  showPerPageSelector?: boolean;

  /**
   * Show the optional go-to-page numeric input + jump button.
   * @default false
   */
  showGoToPage?: boolean;

  /**
   * Number of page buttons shown around the current page before the window
   * collapses to first/last page buttons plus ellipsis truncation.
   * @default 7
   */
  maxVisiblePages?: number;

  /**
   * Disable all interactive controls (prev/next, page buttons, per-page
   * selector, go-to-page input).
   * @default false
   */
  disabled?: boolean;
}
