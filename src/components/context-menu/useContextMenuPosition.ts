/**
 * useContextMenuPosition - Viewport-clamping position calculator
 *
 * Pure function that calculates optimal context menu placement.
 * Clamps to viewport edges and reports whether the menu is near
 * the right edge (used for submenu direction).
 *
 * @param x - Anchor x coordinate (viewport pixels)
 * @param y - Anchor y coordinate (viewport pixels)
 * @param menuWidth - Estimated menu width in pixels
 * @param menuHeight - Estimated menu height in pixels
 * @returns Computed top/left CSS strings and nearRightEdge flag
 */
export interface ContextMenuPositionResult {
  /** Top position as CSS pixel string */
  top: string;
  /** Left position as CSS pixel string */
  left: string;
  /** Whether the menu is near the right viewport edge (submenu opens left) */
  nearRightEdge: boolean;
}

const EDGE_PADDING = 10;

export function calculateContextMenuPosition(
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number
): ContextMenuPositionResult {
  let top = y;
  let left = x;

  // Flip above anchor if it would overflow the bottom
  if (top + menuHeight > window.innerHeight - EDGE_PADDING) {
    top = Math.max(EDGE_PADDING, y - menuHeight);
  }

  // Clamp to left edge
  if (left < EDGE_PADDING) {
    left = EDGE_PADDING;
  }

  // Clamp to right edge
  if (left + menuWidth > window.innerWidth - EDGE_PADDING) {
    left = window.innerWidth - menuWidth - EDGE_PADDING;
  }

  // Near right edge if a submenu wouldn't fit to the right
  const nearRightEdge = left + menuWidth + menuWidth > window.innerWidth - EDGE_PADDING;

  return {
    top: `${top}px`,
    left: `${left}px`,
    nearRightEdge,
  };
}
