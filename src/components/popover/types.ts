/**
 * DanxPopover Type Definitions
 *
 * Types for the trigger-anchored popover component.
 */

/** Placement direction for the popover panel relative to the trigger */
export type PopoverPlacement = "top" | "bottom" | "left" | "right";

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
