import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxStepper Type Definitions
 */

export type DanxStepStatus = "complete" | "active" | "upcoming" | "error";

/**
 * A single step in the workflow. Status is optional and derived from the
 * active step index when omitted, allowing explicit override (e.g. "error").
 */
export interface DanxStep {
  /** Display label text */
  label: string;

  /** Optional supporting description text rendered under the label */
  description?: string;

  /**
   * Icon to display in the step indicator instead of the step number/checkmark.
   * Accepts:
   * - A built-in icon name (e.g. "confirm", "trash")
   * - A raw SVG string (rendered via innerHTML)
   * - A Vue component (renders via <component :is>)
   */
  icon?: Component | IconName | string;

  /**
   * Explicit status override. When omitted, status is derived from the
   * step's index relative to the active step index (v-model): earlier
   * steps are "complete", the current step is "active", later steps are
   * "upcoming". Set to "error" to flag a step regardless of position.
   */
  status?: DanxStepStatus;
}

export interface DanxStepperProps {
  /** Ordered array of step items to render */
  steps: DanxStep[];

  /** Layout direction of the step list. @default "horizontal" */
  orientation?: "horizontal" | "vertical";

  /**
   * Allow navigating to any step by clicking it (non-linear mode). When
   * false, steps render as inert (non-interactive) indicators.
   * @default false
   */
  clickable?: boolean;
}
