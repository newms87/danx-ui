import type { Component } from "vue";
import type { IconName } from "../icon/icons";
import type { PopoverPlacement } from "../popover/types";

/**
 * DanxTooltip Type Definitions
 */

/**
 * Semantic tooltip type that controls panel color.
 *
 * Each type maps to a color category:
 * - "" (blank): Default surface background
 * - danger: Destructive/error (red)
 * - success: Positive/complete (green)
 * - warning: Cautionary (amber)
 * - info: Informational (blue)
 * - muted: Neutral/secondary (gray)
 */
export type TooltipType = "" | "danger" | "success" | "warning" | "info" | "muted";

/** How the tooltip is triggered */
export type TooltipInteraction = "hover" | "click" | "focus";

export interface DanxTooltipProps {
  /**
   * Semantic color type for the panel.
   * @default ""
   */
  type?: TooltipType;

  /**
   * App-defined semantic type. Generates the same BEM modifier class as `type`
   * (e.g., `customType="restart"` → `.danx-tooltip--restart`) but accepts any string.
   * The app must define the matching CSS tokens and modifier rules.
   * When set, takes precedence over `type` for class generation.
   * @default ""
   */
  customType?: string;

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
   * External trigger element. When set, the tooltip renders no inline
   * trigger — it only renders the floating panel anchored to this element.
   * Accepts an ID string (looked up via document.getElementById) or an HTMLElement.
   */
  target?: string | HTMLElement;

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
