/**
 * DanxToast Type Definitions
 *
 * Types for the toast notification system including positions,
 * user-facing options, and internal entry tracking.
 */

import type { PopoverPlacement } from "../popover/types";
import type { VariantType } from "../../shared/types";

/** 9-position grid for screen-anchored toasts */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** User-facing options passed to toast() */
export interface ToastOptions {
  /** Toast message text (required) */
  message: string;

  /** Visual variant (maps to shared variant tokens) */
  variant?: VariantType;

  /** Screen position for the toast (default: "bottom-right") */
  position?: ToastPosition;

  /** Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss) */
  duration?: number;

  /** Whether the toast can be manually dismissed (default: true) */
  dismissible?: boolean;

  /** Anchor to a specific element instead of screen position */
  target?: HTMLElement;

  /** Placement relative to target element (default: "top") */
  targetPlacement?: PopoverPlacement;
}

/** Internal toast entry with generated fields */
export interface ToastEntry {
  /** Unique identifier */
  id: string;

  /** Toast message text */
  message: string;

  /** Visual variant */
  variant: VariantType;

  /** Screen position */
  position: ToastPosition;

  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration: number;

  /** Whether the toast can be manually dismissed */
  dismissible: boolean;

  /** Optional target element for anchored positioning */
  target?: HTMLElement;

  /** Placement relative to target element */
  targetPlacement: PopoverPlacement;

  /** Deduplication count (starts at 1) */
  count: number;

  /** Timestamp when created */
  createdAt: number;
}

/** Props for the individual DanxToast component */
export interface DanxToastProps {
  /** The toast entry to render */
  entry: ToastEntry;
}

/** Slots for the DanxToast component */
export interface DanxToastSlots {
  /** Custom toast content (falls back to entry.message) */
  default(props: { entry: ToastEntry }): unknown;

  /** Custom icon slot */
  icon(props: { entry: ToastEntry }): unknown;
}
