/**
 * DanxDivider Type Definitions
 */

/**
 * Divider orientation.
 * Controls whether the divider line runs horizontally or vertically.
 */
export type DividerOrientation = "horizontal" | "vertical";

export interface DanxDividerProps {
  /**
   * Orientation of the divider line.
   * @default "horizontal"
   */
  orientation?: DividerOrientation;

  /**
   * Adds inset margin along the line's cross-axis, indenting it from the
   * edges of its container.
   * @default false
   */
  inset?: boolean;
}

export interface DanxDividerSlots {
  /**
   * Label content projected into the divider line (e.g. "OR").
   * Only rendered when `orientation` is "horizontal".
   */
  default?(): unknown;
}
