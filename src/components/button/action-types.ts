import type { DanxButtonProps } from "./types";

/**
 * DanxActionButton Type Definitions
 *
 * Minimal types for the action system integration.
 * The full action system (onAction callbacks, batch support, optimistic updates)
 * lives in the consumer's action factory, not in danx-ui.
 */

/** A single item that can be the target of an action */
export interface ActionTargetItem {
  /** Whether this item is currently being saved */
  isSaving?: boolean;
}

/** Target of an action: a single item, array of items, or null */
export type ActionTarget<T extends ActionTargetItem = ActionTargetItem> = T | T[] | null;

/** A resource action that can be triggered on a target */
export interface ResourceAction<T extends ActionTargetItem = ActionTargetItem> {
  /** Whether this action is currently being applied */
  isApplying: boolean;

  /** Trigger the action, optionally with a target and input data */
  trigger(target?: ActionTarget<T>, input?: Record<string, unknown>): Promise<unknown>;

  /** Machine-readable action name */
  name: string;

  /** Human-readable label */
  label?: string;

  /** Icon name or SVG string */
  icon?: string;
}

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
