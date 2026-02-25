/**
 * DanxVirtualScroll Type Definitions
 *
 * Types for the virtual scroll composable and component that renders
 * only a visible window of items for large lists.
 */

import type { ComputedRef, Ref } from "vue";
import type { DanxScrollProps, ScrollDirection } from "./types";

/**
 * Options for the useScrollWindow composable.
 */
export interface ScrollWindowOptions<T> {
  /** The full list of items (reactive — may grow as remote loads arrive). */
  items: Ref<T[]>;

  /** Estimated size in pixels (height for vertical, width for horizontal) for items not yet measured. Read once at creation time (not reactive). @default 40 */
  defaultItemSize?: number;

  /** Extra items rendered above/below (or before/after) the viewport for smooth scrolling. Read once at creation time (not reactive). @default 3 */
  overscan?: number;

  /**
   * Extract a unique key from an item. Used as the size-cache key so measured
   * sizes survive reordering. Defaults to the item's array index.
   */
  keyFn?: (item: T, index: number) => string | number;

  /**
   * Total number of items in the full dataset (including unloaded items in remote mode).
   * When provided, totalSize is fixed at totalItems * defaultItemSize, making the
   * scrollbar stable and proportional to the full dataset. Without this, totalSize
   * is computed from loaded items only.
   */
  totalItems?: number;

  /** Scroll axis — vertical reads scrollTop/clientHeight, horizontal reads scrollLeft/clientWidth. Read once at creation time (not reactive). @default "vertical" */
  direction?: ScrollDirection;

  /** Enable debug console logging. @default false */
  debug?: boolean;
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

  /** Sum of all item sizes (cached or estimated). Container div size (height for vertical, width for horizontal). */
  totalSize: Ref<number>;

  /** Absolute offset (px) for the first visible item (top for vertical, left for horizontal). */
  startOffset: Ref<number>;

  /** Number of skeleton placeholder rows needed after loaded items when scrolled past the loaded range (totalItems mode only). */
  placeholdersAfter: Ref<number>;

  /**
   * Measure a rendered item's size (height or width depending on direction) and cache it.
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

  /** Estimated size in pixels (height for vertical, width for horizontal) for unmeasured items. @default 40 */
  defaultItemSize?: number;

  /** Extra items above/below (or before/after) viewport for smooth scrolling. @default 3 */
  overscan?: number;

  /**
   * Scroll axis for virtualization. Only single-axis virtualization is supported —
   * "both" is not valid for virtual scroll (use DanxScroll directly for dual-axis).
   * @default "vertical"
   */
  direction?: "vertical" | "horizontal";

  /**
   * Extract a unique key from an item (used for size caching).
   * Defaults to array index.
   */
  keyFn?: (item: T, index: number) => string | number;

  /**
   * Total number of items in the full dataset (remote mode).
   * Makes scrollbar proportional to full dataset size.
   */
  totalItems?: number;

  /**
   * Current scroll position as the first visible item index (v-model via defineModel).
   * Updates on scroll; setting from parent scrolls to that index.
   * @default 0
   */
  scrollPosition?: number;

  /** Enable debug console logging for this instance. @default false */
  debug?: boolean;
}

/**
 * Slot types for DanxVirtualScroll.
 */
export interface DanxVirtualScrollSlots<T = unknown> {
  /** Scoped slot for each visible item. */
  item?(props: { item: T; index: number }): unknown;

  /** Placeholder for unloaded items when scrolled past loaded range (totalItems mode). Receives the absolute item index. */
  placeholder?(props: { index: number }): unknown;

  /** Loading indicator (rendered at end of visible items when loading=true). */
  loading?(): unknown;

  /** Done indicator (rendered at end of visible items when canLoadMore=false). */
  done?(): unknown;
}
