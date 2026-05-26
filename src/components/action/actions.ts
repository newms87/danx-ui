/**
 * useActions - Action factory composable
 *
 * Creates a namespace-scoped set of reactive actions wired to your API routes.
 * Each action can show a vnode (dialog) for user confirmation/input, support
 * optimistic updates, and run debounced.
 *
 * @example
 *   const { getAction, action } = useActions(actionList, {
 *     routes: { applyAction: routes.applyAction, batchAction: routes.batchAction }
 *   });
 *   const deleteAction = getAction("delete");
 *   await action("delete", myItem);
 *
 * @returns `UseActionsReturn`
 */

import { h, shallowRef, type Ref } from "vue";
import { storeObject } from "../../shared/objectStore";
import { uid } from "../../shared/uid";
import { useToast } from "../toast/useToast";
import type {
  ActionGlobalOptions,
  ActionOptions,
  ActionTarget,
  ActionTargetItem,
  ResourceAction,
} from "./types";
import ConfirmActionDialog from "./ConfirmActionDialog.vue";
import CreateNewWithNameDialog from "./CreateNewWithNameDialog.vue";
import type { ListController } from "./useActionStore";

/** Reactive ref holding the currently active action vnode (if any). */
export const activeActionVnode: Ref<null | {
  vnode: unknown;
  confirm: (input: unknown) => Promise<void>;
  cancel: (input?: unknown) => void;
}> = shallowRef(null);

export interface UseActionsReturn {
  /** Resolve an action by name, creating it if needed. */
  getAction: (name: string, options?: Partial<ActionOptions>) => ResourceAction;
  /** Resolve multiple actions by name. */
  getActions: (names: string[]) => ResourceAction[];
  /** Execute an action on a target. */
  action: (
    action: ResourceAction | string,
    target?: ActionTarget,
    input?: unknown
  ) => Promise<unknown>;
  /** Modify an existing action's options in-place. */
  modifyAction: (name: string, options: Partial<ActionOptions>) => ResourceAction;
  /** Create an instance-scoped copy of an action with overridden options. */
  extendAction: (
    name: string,
    id: string | number,
    options: Partial<ActionOptions>
  ) => ResourceAction;
}

/**
 * Create a namespace-scoped set of actions.
 *
 * All actions created within a single `useActions` call share the same
 * namespace so their store keys don't collide with actions from other calls.
 */
export function useActions(
  actions: ActionOptions[],
  globalOptions: ActionGlobalOptions | null = null
): UseActionsReturn {
  const namespace = uid();

  function extendAction(
    actionName: string,
    extendedId: string | number,
    actionOptions: Partial<ActionOptions>
  ): ResourceAction {
    const base = getAction(actionName);
    const extended = { ...base, ...actionOptions, id: extendedId };
    extended.trigger = makeTrigger(extended as ResourceAction, extended.debounce);
    return storeObject(extended as ResourceAction & ActionTargetItem);
  }

  function modifyAction(actionName: string, actionOptions: Partial<ActionOptions>): ResourceAction {
    const base = getAction(actionName);
    return storeObject({ ...base, ...actionOptions } as ResourceAction & ActionTargetItem);
  }

  function getAction(actionName: string, actionOptions?: Partial<ActionOptions>): ResourceAction {
    const baseOptions: Partial<ResourceAction> = actions.find((a) => a.name === actionName) || {
      name: actionName,
    };

    const resourceAction = storeObject({
      onAction: globalOptions?.routes?.applyAction,
      onBatchAction: globalOptions?.routes?.batchAction,
      onBatchSuccess: globalOptions?.controls?.clearSelectedRows,
      ...baseOptions,
      ...actionOptions,
      isApplying: false,
      __type: "__Action:" + namespace,
    } as ResourceAction & ActionTargetItem) as ResourceAction;

    resourceAction.trigger = makeTrigger(resourceAction, resourceAction.debounce);

    return resourceAction;
  }

  function getActions(names: string[]): ResourceAction[] {
    return names.map((name) => getAction(name));
  }

  async function performAction(
    action: ResourceAction | string,
    target: ActionTarget = null,
    input: unknown = null
  ): Promise<unknown> {
    if (typeof action === "string") {
      action = getAction(action);
    }

    const aliasedAction = action.alias ? getAction(action.alias) : null;
    const vnode = action.vnode && action.vnode(target, input);
    let result: unknown;

    if (action.onStart) {
      if (!action.onStart(action, target, input)) return;
    }

    setTargetSavingState(target, true);
    action.isApplying = true;
    if (aliasedAction) aliasedAction.isApplying = true;

    if (vnode) {
      result = await new Promise((resolve) => {
        activeActionVnode.value = {
          vnode,
          confirm: async (confirmInput: unknown) => {
            let resolvedInput: unknown;
            if (action.useInputFromConfirm === false) {
              resolvedInput = input;
            } else if (action.useInputFromConfirm === true) {
              resolvedInput = confirmInput;
            } else {
              resolvedInput = { ...(input as object), ...(confirmInput as object) };
            }

            const res = await onConfirmAction(action as ResourceAction, target, resolvedInput);
            if (res === undefined || res === true || (res as { success?: boolean })?.success) {
              resolve(res);
            }
          },
          cancel: resolve,
        };
      });
      activeActionVnode.value = null;
    } else {
      result = await onConfirmAction(action as ResourceAction, target, input);
    }

    if ((result as { abort?: boolean })?.abort) return result;

    action.isApplying = false;
    setTargetSavingState(target, false);
    if (aliasedAction) aliasedAction.isApplying = false;

    if ((result as { item?: ActionTargetItem })?.item) {
      (result as { item: ActionTargetItem }).item = storeObject(
        (result as { item: ActionTargetItem }).item
      );
    }
    if ((result as { result?: { __type?: string } })?.result?.__type) {
      (result as { result: ActionTargetItem }).result = storeObject(
        (result as { result: ActionTargetItem }).result
      );
    }

    return result;
  }

  /**
   * Build the bound `trigger` for an action — debounced when `debounce` is set,
   * otherwise a direct call. Always returns a `Promise<unknown>`.
   */
  function makeTrigger(
    action: ResourceAction,
    debounce?: number
  ): (target?: ActionTarget, input?: unknown) => Promise<unknown> {
    const invoke = (target?: ActionTarget, input?: unknown) =>
      performAction(action, target ?? null, input ?? null);
    return debounce ? createDebounced(invoke, debounce) : invoke;
  }

  return {
    getAction,
    getActions,
    action: performAction,
    modifyAction,
    extendAction,
  };
}

function setTargetSavingState(target: ActionTarget, saving: boolean): void {
  if (!target) return;
  const targets = Array.isArray(target) ? target : [target];
  for (const t of targets) {
    t.isSaving = saving;
  }
}

async function onConfirmAction(
  action: ResourceAction,
  target: ActionTarget,
  input: unknown = null
): Promise<unknown> {
  if (!action.onAction) {
    throw new Error("No onAction handler found for the selected action: " + action.name);
  }

  const isBatch = Array.isArray(target);
  let result: unknown;
  const { success: showSuccess, danger: showDanger } = useToast();

  try {
    if (isBatch) {
      if (action.onBatchAction) {
        result = await action.onBatchAction(action.alias || action.name, target, input);
      } else {
        result = { error: `Action ${action.name} does not support batch actions` };
      }
    } else {
      const __timestamp = Date.now();
      if (action.optimisticDelete) {
        storeObject({
          ...(target as ActionTargetItem),
          __deleted_at: new Date().toISOString(),
          __timestamp,
          __fieldTimestamps: { __deleted_at: __timestamp },
        } as ActionTargetItem);
      }

      if (typeof action.optimistic === "function") {
        action.optimistic(action, target as ActionTargetItem, input);
        storeObject({ ...(target as ActionTargetItem), __timestamp } as ActionTargetItem);
      } else if (action.optimistic) {
        storeObject({
          ...(target as ActionTargetItem),
          ...(input as object),
          __timestamp,
        } as ActionTargetItem);
      }

      result = await action.onAction(
        action.alias || action.name,
        target as ActionTargetItem,
        input
      );
    }
  } catch (e) {
    if (("" + e).match(/Request was aborted/)) {
      result = { abort: true };
    } else {
      console.error(e);
      result = {
        error: `An error occurred while performing the action ${action.label}. Please try again later.`,
      };
    }
  }

  if ((result as { abort?: boolean })?.abort) return result;

  const r = (result ?? {}) as Record<string, unknown>;

  // An action "succeeds" when it returns nothing, returns true, or returns an
  // object with success:true. `result` is checked as unknown to allow the
  // boolean/undefined comparisons; `r` is used only for property access.
  if (result === undefined || result === true || r.success) {
    if (r.item) {
      r.item = storeObject(r.item as ActionTargetItem);
    }

    if (r.success && Array.isArray(target)) {
      showSuccess(
        `Successfully performed action ${action.label} on ${(target as unknown[]).length} items`
      );
    }

    if (action.onSuccess) {
      await action.onSuccess(result, target, input);
    }

    if (isBatch && action.onBatchSuccess) {
      await action.onBatchSuccess(result, target, input);
    }
  } else {
    const errors: string[] = [];
    if (r.errors) {
      errors.push(...(r.errors as string[]));
    } else if (r.error) {
      let message: string;
      if (typeof r.error === "boolean") {
        message = r.message as string;
      } else if (typeof r.error === "object") {
        message = (r.error as { message?: string }).message ?? "An unknown error occurred.";
      } else if (typeof r.error === "string") {
        message = r.error;
      } else {
        message = "An unknown error occurred. Please try again later.";
      }
      errors.push(message);
    } else {
      errors.push("An unexpected error occurred. Please try again later.");
    }

    showDanger(errors.join("\n"));

    if (action.onError) {
      await action.onError(result, target, input);
    }
  }

  if (action.onFinish) {
    await action.onFinish(result, target, input);
  }

  return result;
}

/**
 * Native debounce — no @vueuse/core dependency.
 *
 * Returns a function that delays invoking `fn` until `delay` ms after the last
 * call. The returned function yields a Promise that resolves with the eventual
 * result of `fn` (matching `@vueuse/core`'s `useDebounceFn` contract).
 */
function createDebounced<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  delay: number
): (...args: TArgs) => Promise<TResult> {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: TArgs) =>
    new Promise<TResult>((resolve, reject) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args).then(resolve, reject);
      }, delay);
    });
}

/**
 * Build a standard set of CRUD action definitions for a resource.
 *
 * Consumers pass these into `useActions()`:
 *   ```ts
 *   const { getAction } = useActions(withDefaultActions("Campaign", controller));
 *   ```
 *
 * The `delete-with-confirm` and `create-with-name` actions render dialogs
 * using `ConfirmActionDialog` and `CreateNewWithNameDialog` from danx-ui.
 */
export function withDefaultActions(
  label: string,
  listController?: ListController
): ActionOptions[] {
  return [
    {
      name: "create",
    },
    {
      name: "create-with-name",
      alias: "create",
      label: "Create " + label,
      vnode: () => h(CreateNewWithNameDialog, { title: "Create " + label }),
      onFinish:
        listController &&
        ((result) => {
          const r = result as { item?: ActionTargetItem };
          if (r?.item) listController.activatePanel?.(r.item, "edit");
          listController.loadListAndSummary?.();
        }),
    },
    {
      name: "update",
      optimistic: true,
    },
    {
      name: "update-debounced",
      alias: "update",
      debounce: 1000,
      optimistic: true,
    },
    {
      name: "copy",
      label: "Copy",
      onSuccess: listController?.loadListAndSummary,
    },
    {
      name: "edit",
      label: "Edit",
      onAction: (_action, target) => {
        listController?.activatePanel?.(target, "edit");
        return Promise.resolve(undefined);
      },
    },
    {
      name: "delete",
    },
    {
      name: "delete-with-confirm",
      alias: "delete",
      label: "Delete",
      class: "text-red-500",
      iconClass: "text-red-500",
      onFinish: listController?.loadListAndSummary,
      vnode: (target: ActionTarget) =>
        h(ConfirmActionDialog, {
          action: "Delete",
          label,
          target,
        }),
    },
  ];
}
