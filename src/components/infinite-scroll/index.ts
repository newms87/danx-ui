/**
 * InfiniteScroll Component Module
 *
 * Exports:
 * - DanxInfiniteScroll: The infinite scroll container component
 * - useDanxInfiniteScroll: Composable for scroll detection
 * - Types: TypeScript interfaces
 */

export { default as DanxInfiniteScroll } from "./DanxInfiniteScroll.vue";
export { useDanxInfiniteScroll } from "./useInfiniteScroll";
export type { UseDanxInfiniteScrollOptions } from "./useInfiniteScroll";
export type {
  DanxInfiniteScrollEmits,
  DanxInfiniteScrollProps,
  DanxInfiniteScrollSlots,
  InfiniteScrollDirection,
} from "./types";
