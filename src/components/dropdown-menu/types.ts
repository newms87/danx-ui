import type { Component } from "vue";
import type { IconName } from "../icon/icons";
import type { PopoverPlacement } from "../../shared/types";

/**
 * DanxDropdownMenu Type Definitions
 *
 * Types for the button-triggered dropdown menu, including menu items,
 * component props, emits, and slots.
 */

/**
 * A single item in the dropdown menu.
 *
 * Items can be:
 * - Regular clickable items with a label and optional action
 * - Parent items with children (renders a submenu)
 * - Separators (visual divider between groups)
 * - Disabled items (visible but not clickable)
 */
export interface DropdownMenuItem {
  /** Display text */
  label: string;

  /** Optional icon: built-in name, raw SVG string, or Vue component */
  icon?: Component | IconName | string;

  /** Callback executed when the item is selected */
  action?: () => void;

  /** Whether the item is disabled (visible but not clickable) */
  disabled?: boolean;

  /** When true, renders as a visual divider instead of a clickable item */
  separator?: boolean;

  /** Nested submenu items (renders a flyout submenu on hover/click) */
  children?: DropdownMenuItem[];
}

/**
 * Props for DanxDropdownMenu component.
 */
export interface DanxDropdownMenuProps {
  /**
   * Menu items to display. Internally mapped to ContextMenuItem with an id
   * derived from each item's position in the tree (DropdownMenuItem has no
   * id of its own). Keep the shape (length/order/nesting) of this array
   * stable while the menu can be open — reordering, inserting, or removing
   * items changes which item a given tree position maps to, which can carry
   * stale keyboard focus/active-item state onto the wrong item. Toggling
   * `disabled` or updating `label`/`icon`/`action` in place is fine.
   */
  items: DropdownMenuItem[];

  /** Panel placement relative to the trigger. Defaults to "bottom". */
  placement?: PopoverPlacement;
}

/**
 * Emits for DanxDropdownMenu component.
 */
export interface DanxDropdownMenuEmits {
  /** Fired with the chosen item when a (non-submenu) item is selected */
  select: [item: DropdownMenuItem];
}

/**
 * Slots for DanxDropdownMenu component.
 */
export interface DanxDropdownMenuSlots {
  /** The trigger element (usually a DanxButton) that opens the menu on click */
  default?: () => unknown;
}
