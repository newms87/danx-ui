/**
 * DanxZoomable Type Definitions
 *
 * Types for the reusable zoom + pan wrapper.
 */

export interface Pan {
  x: number;
  y: number;
}

export interface DanxZoomableProps {
  /** Minimum zoom percent (default 25) */
  min?: number;
  /** Maximum zoom percent (default 400) */
  max?: number;
  /** Zoom step percent (default 10) */
  step?: number;
  /** Disable pan (drag with modifier key). Default false. */
  panDisabled?: boolean;
  /** Disable Ctrl+wheel zoom. Default false. */
  wheelDisabled?: boolean;
  /** Disable Ctrl+/-/= /0 keyboard zoom. Default false. */
  keyboardDisabled?: boolean;
  /** Show the modifier-key hint pill. Default true. */
  showHint?: boolean;
}

export interface DanxZoomableEmits {
  (e: "update:zoom", value: number): void;
  (e: "update:pan", value: Pan): void;
  (e: "reset"): void;
}

export interface DanxZoomableSlots {
  default?(): unknown;
  /** Overlay controls (rendered above content, e.g. an inline slider) */
  controls?(): unknown;
}

export interface DanxZoomControlsProps {
  /** Min zoom percent (default 25) */
  min?: number;
  /** Max zoom percent (default 400) */
  max?: number;
  /** Step (default 10) */
  step?: number;
  /** Compact mode hides label/percent. Default false. */
  compact?: boolean;
}

export interface DanxZoomControlsEmits {
  (e: "update:zoom", value: number): void;
  (e: "reset"): void;
}
