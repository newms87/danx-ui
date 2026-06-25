import type { Component } from "vue";
import type { IconName } from "../icon/icons";
import type { PopoverPlacement, PopoverPosition } from "../popover/types";

/**
 * DanxContextMenu Type Definitions
 *
 * Types for the context menu component, including menu items,
 * component props, and emits.
 */

/**
 * A single item in the context menu.
 *
 * Items can be:
 * - Regular clickable items with label and optional action
 * - Parent items with children (renders a submenu)
 * - Dividers (visual separator between groups)
 * - Disabled items (visible but not clickable)
 */
export interface ContextMenuItem {
  /** Unique identifier for the item */
  id: string;

  /** Display text */
  label: string;

  /** Optional icon: built-in name, raw SVG string, or Vue component */
  icon?: Component | IconName | string;

  /** Keyboard shortcut display text (e.g. "Ctrl+C") */
  shortcut?: string;

  /** Callback executed when item is clicked */
  action?: () => void;

  /** Whether the item is disabled (visible but not clickable) */
  disabled?: boolean;

  /** Nested submenu items (renders a flyout submenu on hover/click) */
  children?: ContextMenuItem[];

  /** When true, renders as a visual divider instead of a clickable item */
  divider?: boolean;

  /**
   * When true, the item renders an active/selected indicator (leading check
   * glyph + is-active style). A submenu parent reflects active state when any
   * of its descendants is active. Replaces the icon-as-checkmark workaround.
   */
  active?: boolean;
}

/**
 * Position coordinates for placing the context menu.
 * Re-exported from popover for convenience.
 */
export type ContextMenuPosition = PopoverPosition;

/**
 * Props for DanxContextMenu component.
 */
export interface DanxContextMenuProps {
  /**
   * Viewport coordinates where the menu should appear (right-click mode).
   * OPTIONAL: when omitted, the menu anchors to the `#trigger` slot element
   * via DanxPopover's trigger-relative positioning (button-dropdown mode) —
   * no rect math in the consumer or this component.
   */
  position?: ContextMenuPosition;

  /** Menu items to display */
  items: ContextMenuItem[];

  /**
   * Panel placement relative to the trigger in anchored mode.
   * Forwarded to DanxPopover; defaults to "bottom" (suits a button dropdown).
   * Ignored when an explicit `position` is provided.
   */
  placement?: PopoverPlacement;
}

/**
 * Emits for DanxContextMenu component.
 */
export interface DanxContextMenuEmits {
  /** Fired when the menu should close (overlay click, Escape, item click) */
  close: [];

  /** Fired with the clicked item before executing its action */
  action: [item: ContextMenuItem];
}

/**
 * Slots for DanxContextMenu component.
 */
export interface DanxContextMenuSlots {
  /**
   * Inline anchor element for button-anchored (dropdown) open mode.
   * Forwarded to DanxPopover's `#trigger` slot; when provided with no
   * `position`, the menu auto-positions off this element.
   */
  trigger?: () => unknown;
}
