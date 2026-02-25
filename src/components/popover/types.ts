/**
 * DanxPopover Type Definitions
 *
 * Types for the trigger-anchored popover component.
 */

import type { VariantType } from "../../shared/types";

/** Placement direction for the popover panel relative to the trigger */
export type PopoverPlacement = "top" | "bottom" | "left" | "right";

/** How the popover is triggered to open/close */
export type PopoverTrigger = "manual" | "click" | "hover" | "focus";

/** Explicit viewport coordinates for the popover panel */
export interface PopoverPosition {
  x: number;
  y: number;
}

export interface DanxPopoverProps {
  /**
   * Controls popover visibility via v-model.
   * When true, the panel is rendered and positioned.
   * When false, the panel is removed from DOM.
   */
  modelValue?: boolean;

  /**
   * Placement direction relative to the trigger element.
   * Auto-flips to the opposite side if the panel would overflow the viewport.
   */
  placement?: PopoverPlacement;

  /**
   * Explicit viewport coordinates for the panel.
   * When set, the panel positions at these coordinates instead of
   * anchoring to the trigger element. The trigger slot still controls
   * click-outside detection and show/hide toggling.
   */
  position?: PopoverPosition;

  /**
   * How the popover is triggered to open/close.
   * - "manual": Parent controls v-model directly (default, current behavior)
   * - "click": Toggles on click of trigger element
   * - "hover": Opens on mouseenter, closes on mouseleave with delay
   * - "focus": Opens on focusin, closes on focusout
   */
  trigger?: PopoverTrigger;

  /**
   * Delay in milliseconds before closing on mouseleave in hover mode.
   * Allows the user to move the cursor from trigger to panel without closing.
   * Only applies when trigger is "hover".
   */
  hoverDelay?: number;

  /**
   * Visual variant for the popover panel.
   * Maps to shared variant tokens via useVariant composable.
   * Common values: "danger", "success", "warning", "info", "muted".
   */
  variant?: VariantType;
}

export interface DanxPopoverEmits {
  /** Emitted when popover visibility changes via v-model */
  (e: "update:modelValue", value: boolean): void;
}

export interface DanxPopoverSlots {
  /** Trigger element that the popover anchors to */
  trigger(): unknown;

  /** Panel content rendered inside the floating popover */
  default(): unknown;
}
