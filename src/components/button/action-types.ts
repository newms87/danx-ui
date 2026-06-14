import type { DanxButtonProps } from "./types";
import type { ActionTarget, ResourceAction } from "../../shared/action-types";

/**
 * DanxActionButton Type Definitions
 *
 * The action system itself (ActionTargetItem, ActionTarget, ResourceAction and
 * the full action/list-controls surface) now lives in `src/shared/action-types`.
 * These are re-exported here so `@thehammer/danx-ui/components/button` consumers
 * keep the same import site.
 */

export type { ActionTarget, ActionTargetItem, ResourceAction } from "../../shared/action-types";

export interface DanxActionButtonProps extends Pick<
  DanxButtonProps,
  "variant" | "size" | "icon" | "disabled" | "tooltip" | "label"
> {
  /** Action object to trigger on click */
  action?: ResourceAction;

  /** Target to pass to action.trigger() */
  target?: ActionTarget;

  /** Input data to pass to action.trigger() */
  input?: Record<string, unknown>;

  /** Show confirmation dialog before triggering */
  confirm?: boolean;

  /** Confirmation dialog message */
  confirmText?: string;

  /** Manual loading state override */
  saving?: boolean;
}

export interface DanxActionButtonEmits {
  /** Emitted with response after action succeeds */
  (e: "success", response: unknown): void;

  /** Emitted with error after action fails */
  (e: "error", error: unknown): void;

  /** Emitted after action completes (success or error) */
  (e: "always"): void;
}
