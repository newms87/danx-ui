/**
 * DanxInfiniteScroll Type Definitions
 */

/**
 * Scroll direction for infinite loading.
 * - bottom: Load more when scrolling down (default)
 * - top: Load more when scrolling up (e.g. chat history)
 */
export type InfiniteScrollDirection = "top" | "bottom";

export interface DanxInfiniteScrollProps {
  /**
   * Distance in pixels from the scroll edge to trigger loading.
   * Read once at mount — changes after mount have no effect.
   * @default 200
   */
  distance?: number;

  /**
   * Which scroll direction triggers loading.
   * Read once at mount — changes after mount have no effect.
   * @default "bottom"
   */
  direction?: InfiniteScrollDirection;

  /**
   * Whether more items are available to load.
   * When false, the "done" slot is shown and loading stops.
   * @default true
   */
  canLoadMore?: boolean;

  /**
   * Whether a load is currently in progress.
   * Prevents concurrent load triggers while true.
   * @default false
   */
  loading?: boolean;

  /**
   * HTML tag to render as the scroll container.
   * @default "div"
   */
  tag?: string;
}

export interface DanxInfiniteScrollEmits {
  /**
   * Emitted when the scroll threshold is crossed.
   * Guarded by loading and canLoadMore — will not fire
   * when loading is true or canLoadMore is false.
   */
  loadMore: [];
}

export interface DanxInfiniteScrollSlots {
  /**
   * Main content area. Place your list items here.
   */
  default?(): unknown;

  /**
   * Shown when loading is true.
   * Default: a span with "Loading..." text.
   */
  loading?(): unknown;

  /**
   * Shown when canLoadMore is false.
   * Default: a span with "No more items" text.
   */
  done?(): unknown;
}
