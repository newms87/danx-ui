/**
 * useScrollInfinite - Composable for infinite scroll behavior
 *
 * Thin wrapper around VueUse's useInfiniteScroll that adds
 * loading guarding and a simpler callback interface.
 *
 * Requires `@vueuse/core` as a peer dependency.
 *
 * @param el - Ref to the scroll container element
 * @param options - Configuration options
 * @returns { reset, isLoading } from VueUse's useInfiniteScroll
 */
import { type Ref, watch } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import type { InfiniteScrollEdge } from "./types";

export interface UseScrollInfiniteOptions {
  /** Distance in pixels from scroll edge to trigger loading. Read once at initialization. */
  distance?: number;
  /** Scroll edge to observe. Read once at initialization. */
  direction?: InfiniteScrollEdge;
  /** Reactive ref — whether more items can be loaded */
  canLoadMore?: Ref<boolean>;
  /** Reactive ref — whether a load is in progress */
  loading?: Ref<boolean>;
  /** Callback fired when scroll threshold is crossed */
  onLoadMore: () => void;
}

export function useScrollInfinite(el: Ref<HTMLElement | null>, options: UseScrollInfiniteOptions) {
  const { distance = 200, direction = "bottom", canLoadMore, loading, onLoadMore } = options;

  const { reset, isLoading } = useInfiniteScroll(
    el,
    async () => {
      if (loading?.value) return;
      onLoadMore();
    },
    {
      distance,
      direction,
      canLoadMore: canLoadMore ? () => canLoadMore.value : undefined,
    }
  );

  // When loading completes, reset the infinite scroll so it can trigger again
  if (loading) {
    watch(loading, (newVal, oldVal) => {
      if (oldVal && !newVal) {
        reset();
      }
    });
  }

  return { reset, isLoading };
}
