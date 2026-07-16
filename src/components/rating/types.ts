import type { Component } from "vue";
import type { IconName } from "../icon/icons";
import type { VariantType } from "../../shared/types";

/**
 * DanxRating Type Definitions
 */

export interface DanxRatingProps {
  /**
   * Icon rendered per star. Accepts a built-in icon name, raw SVG string, or
   * Vue component — same resolution as `DanxIcon`.
   * @default "star"
   */
  icon?: Component | IconName | string;

  /**
   * Number of stars rendered.
   * @default 5
   */
  max?: number;

  /**
   * Allows half-star increments (0.5 steps) on hover-preview, click, and
   * keyboard input. When false, only whole-star values are selectable.
   * @default false
   */
  allowHalf?: boolean;

  /**
   * Locks all interaction (pointer + keyboard) and disables hover-preview.
   * The current value still renders (including partial fill).
   * @default false
   */
  readonly?: boolean;

  /**
   * Locks all interaction (pointer + keyboard) and applies the disabled
   * dimming token. Distinct from `readonly` — `disabled` communicates the
   * control is unavailable, not merely non-editable.
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant controlling the filled-star color.
   * Built-in: "danger", "success", "warning", "info", "muted".
   * Custom variants use --dx-variant-{name}-* CSS tokens.
   * Blank ("") falls back to the default --color-interactive fill.
   * @default ""
   */
  variant?: VariantType;

  /**
   * Accessible name for the rating group container (`role="slider"`).
   *
   * REQUIRED — without it the rating has no accessible name and screen
   * readers will announce only the role.
   */
  ariaLabel?: string;
}
