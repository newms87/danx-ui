import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxBreadcrumbs Type Definitions
 */

/**
 * A single breadcrumb entry in the trail.
 */
export interface DanxBreadcrumbItem {
  /** Display label text */
  label: string;

  /**
   * Icon to display before the label. Accepts:
   * - A built-in icon name (e.g. "list", "gear")
   * - A raw SVG string (rendered via innerHTML)
   * - A Vue component (renders via <component :is>)
   */
  icon?: Component | IconName | string;

  /** Renders the item as an `<a>` with this href. Ignored when `disabled` or `current`. */
  href?: string;

  /** Called when the item is activated (click, or Enter/Space on a button). Ignored when `disabled` or `current`. */
  onClick?: () => void;

  /** Renders the item as inert text, non-interactive regardless of `href`/`onClick`. */
  disabled?: boolean;

  /**
   * Marks this item as the current step (`aria-current="page"`), rendered as
   * inert text regardless of `href`/`onClick`. When omitted on every item,
   * the last item in `items` is treated as current.
   */
  current?: boolean;
}

export interface DanxBreadcrumbsProps {
  /** Ordered trail of breadcrumb items, root first */
  items: DanxBreadcrumbItem[];

  /** Separator rendered between items. Ignored when the `separator` slot is used. @default "/" */
  separator?: string;

  /**
   * Maximum number of items to render before collapsing the middle of the
   * trail behind an ellipsis. The first item and the last `maxItems - 1`
   * items are always shown. Omit to disable collapsing.
   */
  maxItems?: number;
}
