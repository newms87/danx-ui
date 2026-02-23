/**
 * DanxVirtualScroll Type Definitions
 *
 * Types for the virtual scroll composable and component that renders
 * only a visible window of items for large lists.
 */

import type { ComputedRef, Ref } from "vue";
import type { DanxScrollProps } from "./types";

/**
 * Options for the useScrollWindow composable.
 */
export interface ScrollWindowOptions<T> {
  /** The full list of items (reactive — may grow as remote loads arrive). */
  items: Ref<T[]>;

  /** Estimated height in pixels for items not yet measured. Read once at creation time (not reactive). @default 40 */
  defaultItemHeight?: number;

  /** Extra items rendered above/below the viewport for smooth scrolling. Read once at creation time (not reactive). @default 3 */
  overscan?: number;

  /**
   * Extract a unique key from an item. Used as the height-cache key so measured
   * heights survive reordering. Defaults to the item's array index.
   */
  keyFn?: (item: T, index: number) => string | number;
}

/**
 * Return type of the useScrollWindow composable.
 */
export interface ScrollWindowReturn<T> {
  /** Slice of items currently in or near the viewport. */
  visibleItems: ComputedRef<T[]>;

  /** Index of the first rendered item in the items array. */
  startIndex: Ref<number>;

  /** Index of the last rendered item (inclusive) in the items array. */
  endIndex: Ref<number>;

  /** Sum of all item heights (cached or estimated). Container div height. */
  totalHeight: Ref<number>;

  /** Absolute top offset (px) for the first visible item. */
  startOffset: Ref<number>;

  /**
   * Measure a rendered item's height and cache it.
   * Call from a template ref callback on each item wrapper.
   */
  measureItem: (key: string | number, el: HTMLElement | null) => void;

  /**
   * Scroll the viewport so the item at the given index is at the top.
   */
  scrollToIndex: (index: number) => void;

  /**
   * Resolved key extractor (user-provided or default index-based).
   * Exposed so consumers can use the same function for v-for :key bindings.
   */
  keyFn: (item: T, index: number) => string | number;
}

/**
 * Props for the DanxVirtualScroll component.
 * Extends DanxScrollProps with virtual-scroll-specific options.
 */
export interface DanxVirtualScrollProps<T = unknown> extends DanxScrollProps {
  /** Array of items to render (required). */
  items: T[];

  /** Estimated height for unmeasured items. @default 40 */
  defaultItemHeight?: number;

  /** Extra items above/below viewport for smooth scrolling. @default 3 */
  overscan?: number;

  /**
   * Extract a unique key from an item (used for height caching).
   * Defaults to array index.
   */
  keyFn?: (item: T, index: number) => string | number;
}

/**
 * Slot types for DanxVirtualScroll.
 */
export interface DanxVirtualScrollSlots<T = unknown> {
  /** Scoped slot for each visible item. */
  item?(props: { item: T; index: number }): unknown;

  /** Loading indicator (passed through to DanxScroll). */
  loading?(): unknown;

  /** Done indicator (passed through to DanxScroll). */
  done?(): unknown;
}
