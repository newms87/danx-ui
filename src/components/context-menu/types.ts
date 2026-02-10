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

  /** Optional SVG icon string (rendered via v-html) */
  icon?: string;

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
}

/**
 * Position coordinates for placing the context menu.
 */
export interface ContextMenuPosition {
  /** Horizontal viewport coordinate in pixels */
  x: number;
  /** Vertical viewport coordinate in pixels */
  y: number;
}

/**
 * Props for DanxContextMenu component.
 */
export interface DanxContextMenuProps {
  /** Viewport coordinates where the menu should appear */
  position: ContextMenuPosition;

  /** Menu items to display */
  items: ContextMenuItem[];
}

/**
 * Emits for DanxContextMenu component.
 */
export interface DanxContextMenuEmits {
  /** Fired when the menu should close (overlay click, Escape, item click) */
  (e: "close"): void;

  /** Fired with the clicked item before executing its action */
  (e: "action", item: ContextMenuItem): void;
}
