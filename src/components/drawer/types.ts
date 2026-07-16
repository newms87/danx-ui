import type { SizeValue } from "../../shared/types";

/**
 * DanxDrawer Type Definitions
 */

export type DrawerSide = "left" | "right" | "top" | "bottom";

export interface DanxDrawerProps {
  /**
   * Controls drawer visibility via v-model.
   * When true, drawer is rendered and shown.
   * When false, drawer is removed from DOM.
   */
  modelValue?: boolean;

  /**
   * Edge the drawer slides in from.
   */
  side?: DrawerSide;

  /**
   * Drawer title displayed in header.
   * Can also be customized via `title` slot.
   */
  title?: string;

  /**
   * Drawer size along its sliding axis (width for left/right, height for top/bottom).
   * - Number: Converted to viewport units (30 → "30vw" or "30vh")
   * - String: Used as-is ("400px", "30rem")
   */
  size?: SizeValue;

  /**
   * When true, prevents closing via ESC key or backdrop click.
   */
  persistent?: boolean;
}

export interface DanxDrawerEmits {
  /** Emitted when drawer is closed via internal trigger (ESC, backdrop) */
  (e: "close"): void;
}

export interface DanxDrawerSlots {
  /** Main content area */
  default?(): unknown;

  /** Custom title content (replaces title prop) */
  title?(): unknown;

  /** Header area (replaces the whole header, including title) */
  header?(): unknown;

  /** Footer/actions area */
  footer?(): unknown;
}
