/**
 * Action System Type Definitions
 *
 * This module OWNS the canonical action lifecycle types: `ResourceAction`
 * (the full resolved action) and `ActionOptions` (the definition input).
 * The base `ActionTarget` / `ActionTargetItem` types live in `shared/types`
 * (re-exported here for convenience). `components/button` imports
 * `ResourceAction` from this module for `DanxActionButtonProps`.
 */

import type { Component } from "vue";
import type { ActionTarget, ActionTargetItem } from "../../shared/types";
import type { ListController } from "./useActionStore";

export type { ActionTarget, ActionTargetItem } from "../../shared/types";

/**
 * Options passed when defining an action in the `useActions` action list.
 */
export interface ActionOptions {
  /** Machine-readable action name (used as the key for routing) */
  name: string;
  /** Human-readable label shown in menus/buttons */
  label?: string;
  /** Icon for the action button */
  icon?: Component | string;
  /** CSS class applied to the icon */
  iconClass?: string;
  /** CSS class applied to the action button/menu item */
  class?: string;
  /**
   * Debounce delay in milliseconds.
   * When set, `trigger` is debounced so rapid calls coalesce.
   */
  debounce?: number;
  /**
   * Alias: resolve to another action name before executing.
   * Useful for grouping multiple named triggers onto one handler.
   */
  alias?: string;
  /**
   * Vnode factory for collecting additional user input before confirming.
   * Receives `(target, input)` and must return a VNode.
   * The vnode receives `confirm(input)` and `cancel()` callbacks.
   */
  vnode?: (target: ActionTarget, input: unknown) => unknown;
  /**
   * Whether the `confirm` callback's input replaces (`true`), is used as-is
   * (`true`), or is merged with the original input (`undefined` — default).
   */
  useInputFromConfirm?: boolean;
  /** Called before the action; return `false` to abort. */
  onStart?: (action: ResourceAction, target: ActionTarget, input: unknown) => boolean | void;
  /** Called on success. */
  onSuccess?: (result: unknown, target: ActionTarget, input: unknown) => Promise<void> | void;
  /** Called on error. */
  onError?: (result: unknown, target: ActionTarget, input: unknown) => Promise<void> | void;
  /** Called after success or error. */
  onFinish?: (result: unknown, target: ActionTarget, input: unknown) => Promise<void> | void;
  /** Primary single-target action handler */
  onAction?: (actionName: string, target: ActionTargetItem, input: unknown) => Promise<unknown>;
  /** Batch action handler */
  onBatchAction?: (
    actionName: string,
    targets: ActionTargetItem[],
    input: unknown
  ) => Promise<unknown>;
  /** Called after a successful batch action (e.g. clear selection) */
  onBatchSuccess?: (
    result: unknown,
    targets: ActionTargetItem[],
    input: unknown
  ) => Promise<void> | void;
  /** Optimistic update: `true` merges input into target; function receives (action, target, input) */
  optimistic?:
    | boolean
    | ((action: ActionOptions, target: ActionTargetItem, input: unknown) => void);
  /** When true, target is optimistically soft-deleted before the request resolves */
  optimisticDelete?: boolean;
}

/**
 * A fully-resolved action object returned by `getAction`.
 * Extends `ActionOptions` with runtime state and the bound `trigger` function.
 */
export interface ResourceAction extends ActionOptions {
  /** Trigger the action; can be debounced when `debounce` is set */
  trigger: (target?: ActionTarget, input?: unknown) => Promise<unknown>;
  /** Whether this action's request is in flight */
  isApplying: boolean;
  /** Opaque id used to scope store keys (set by useActions namespace) */
  id?: string | number;
  /** Internal type discriminator used by storeObject */
  __type?: string;
}

/**
 * Global options shared across all actions in a `useActions` call.
 */
export interface ActionGlobalOptions {
  routes?: {
    applyAction?: (
      actionName: string,
      target: ActionTargetItem,
      input: unknown
    ) => Promise<unknown>;
    batchAction?: (
      actionName: string,
      targets: ActionTargetItem[],
      input: unknown
    ) => Promise<unknown>;
  };
  controls?: {
    clearSelectedRows?: (result: unknown, targets: ActionTargetItem[], input: unknown) => void;
  };
}

export type { ListController };
