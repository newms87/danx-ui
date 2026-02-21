import type { Component } from "vue";
import type { VariantType } from "../../shared/types";
import type { IconName } from "../icon/icons";
import type { PopoverPlacement } from "../popover/types";

/**
 * DanxTooltip Type Definitions
 */

/** How the tooltip is triggered */
export type TooltipInteraction = "hover" | "click" | "focus";

export interface DanxTooltipProps {
  /**
   * Visual variant controlling panel background, text, and border color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Icon displayed at the top-left of the panel content.
   * Accepts a built-in icon name, raw SVG string, or Vue component.
   * When omitted, no icon area is rendered.
   */
  icon?: Component | IconName | string;

  /**
   * Shortcut to render a DanxIcon as the inline trigger element.
   * Accepts a built-in icon name, raw SVG string, or Vue component.
   */
  triggerIcon?: Component | IconName | string;

  /**
   * External trigger element by ID string. When set, the tooltip renders no
   * inline trigger — it only renders the floating panel anchored to this element.
   * The element is looked up via document.getElementById after mount, so the
   * target element does not need to exist at initial render time.
   */
  targetId?: string;

  /**
   * External trigger element as an HTMLElement reference. When set, the tooltip
   * renders no inline trigger — it only renders the floating panel anchored to
   * this element.
   */
  target?: HTMLElement;

  /**
   * Simple text content for the panel. Alternative to the default slot.
   * When both tooltip prop and slot content are provided, slot content wins.
   */
  tooltip?: string;

  /**
   * Placement direction relative to the trigger.
   * Auto-flips to the opposite side if the panel would overflow the viewport.
   * @default "top"
   */
  placement?: PopoverPlacement;

  /**
   * How the tooltip is triggered.
   * - "hover": Show on mouseenter, hide on mouseleave with 200ms delay
   * - "click": Toggle on click, close on click-outside
   * - "focus": Show on focusin, hide on focusout
   * @default "hover"
   */
  interaction?: TooltipInteraction;

  /**
   * Whether the user can move their cursor into the tooltip panel without
   * it closing. When false (default), mouseleave from the trigger closes
   * the tooltip immediately. When true, there is a 200ms delay allowing
   * the cursor to enter the panel.
   * @default false
   */
  enterable?: boolean;

  /**
   * Prevents the tooltip from showing when true.
   * @default false
   */
  disabled?: boolean;
}

export interface DanxTooltipSlots {
  /** Custom trigger element the tooltip anchors to */
  trigger?(): unknown;

  /** Panel content rendered inside the floating tooltip */
  default?(): unknown;
}
