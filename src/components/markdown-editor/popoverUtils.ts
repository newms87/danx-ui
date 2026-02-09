/**
 * Shared popover positioning utilities for the markdown editor.
 *
 * Calculates optimal popover placement with viewport boundary detection.
 * Used by LinkPopover, TablePopover, and ContextMenu to avoid duplicating
 * the same positioning logic.
 */

/**
 * Options for popover position calculation
 */
export interface PopoverPositionOptions {
  /** Anchor x coordinate (viewport pixels) */
  anchorX: number;
  /** Anchor y coordinate (viewport pixels) */
  anchorY: number;
  /** Popover width in pixels */
  popoverWidth: number;
  /** Popover height in pixels (approximate) */
  popoverHeight: number;
  /** Minimum padding from viewport edges (default: 10) */
  padding?: number;
  /** Center the popover horizontally on the anchor (default: false) */
  centerOnAnchor?: boolean;
}

/**
 * Result of popover position calculation
 */
export interface PopoverPositionResult {
  /** Top position as CSS pixel string */
  top: string;
  /** Left position as CSS pixel string */
  left: string;
  /** Whether the popover is near the right edge of the viewport */
  nearRightEdge: boolean;
}

/**
 * Calculate optimal popover position with viewport boundary detection.
 *
 * When centerOnAnchor is true (Link/TablePopover), the popover is centered
 * horizontally on the anchor and offset vertically by the padding value.
 * When false (ContextMenu), the popover is placed directly at the anchor point.
 *
 * Adjustments:
 * - Flips above anchor if it would overflow the bottom
 * - Clamps to left/right edges with padding
 * - Reports nearRightEdge for submenu direction decisions
 */
export function calculatePopoverPosition(options: PopoverPositionOptions): PopoverPositionResult {
  const {
    anchorX,
    anchorY,
    popoverWidth,
    popoverHeight,
    padding = 10,
    centerOnAnchor = false,
  } = options;

  let top = centerOnAnchor ? anchorY + padding : anchorY;
  let left = centerOnAnchor ? anchorX - popoverWidth / 2 : anchorX;

  // Check if popover would extend below viewport
  if (top + popoverHeight > window.innerHeight - padding) {
    top = centerOnAnchor
      ? anchorY - popoverHeight - padding
      : Math.max(padding, anchorY - popoverHeight);
  }

  // Clamp to left edge
  if (left < padding) {
    left = padding;
  }

  // Clamp to right edge
  if (left + popoverWidth > window.innerWidth - padding) {
    left = window.innerWidth - popoverWidth - padding;
  }

  // Determine if near right edge (for submenu direction)
  const nearRightEdge = left + popoverWidth + popoverWidth > window.innerWidth - padding;

  return {
    top: `${top}px`,
    left: `${left}px`,
    nearRightEdge,
  };
}
