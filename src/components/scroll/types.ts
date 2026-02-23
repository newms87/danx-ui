/**
 * DanxScroll Type Definitions
 *
 * Types for the custom scrollbar container with opt-in infinite scroll.
 */

import type { VariantType } from "../../shared/types";

/**
 * Scrollbar thickness preset.
 * Maps to CSS token values for thumb width and track padding.
 */
export type ScrollbarSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Scroll direction — which axes are scrollable.
 * - vertical: Y-axis only (default)
 * - horizontal: X-axis only
 * - both: Both axes
 */
export type ScrollDirection = "vertical" | "horizontal" | "both";

/**
 * Edge that triggers infinite scroll loading.
 * - top/bottom: Vertical edges
 * - left/right: Horizontal edges
 */
export type InfiniteScrollEdge = "top" | "bottom" | "left" | "right";

export interface DanxScrollProps {
  /** HTML tag for the scroll container. @default "div" */
  tag?: string;

  /** Scrollable axes. @default "vertical" */
  direction?: ScrollDirection;

  /** Scrollbar thumb thickness preset. @default "md" */
  size?: ScrollbarSize;

  /** Color variant for scrollbar via useVariant(). @default "" */
  variant?: VariantType;

  /** Keep scrollbar always visible (no auto-hide). @default false */
  persistent?: boolean;

  /** Enable infinite scroll behavior. @default false */
  infiniteScroll?: boolean;

  /** Pixel threshold from edge to trigger infinite scroll. @default 200 */
  distance?: number;

  /** Which edge triggers infinite scroll loading. @default "bottom" */
  infiniteDirection?: InfiniteScrollEdge;

  /** Whether more items can be loaded (infinite scroll). @default true */
  canLoadMore?: boolean;

  /** Whether a load is in progress (infinite scroll). @default false */
  loading?: boolean;
}

export interface DanxScrollEmits {
  /** Emitted when scroll threshold crossed. Guarded by loading and canLoadMore. Only fires when infiniteScroll=true. */
  loadMore: [];
}

export interface DanxScrollSlots {
  /** Main scrollable content. */
  default?(): unknown;

  /** Loading indicator shown when loading=true and infiniteScroll=true. */
  loading?(): unknown;

  /** Done indicator shown when canLoadMore=false and infiniteScroll=true. */
  done?(): unknown;
}
