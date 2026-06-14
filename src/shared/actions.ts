/**
 * useActions — perform named actions on a set of targets.
 *
 * Resolves declarative `ActionOptions` into reactive, store-backed
 * `ResourceAction`s with a bound `trigger`, then runs them: optimistic updates,
 * optional confirm/input vnode, route call, success/error/finish callbacks.
 *
 * `withDefaultActions()` ships the common CRUD presets. The `create-with-name`
 * and `delete-with-confirm` presets ship WITHOUT a baked confirm/name dialog —
 * a consumer supplies its own `vnode` (e.g. built from `DanxDialog`) when it
 * wants one. No dialog components are bundled by the action layer.
 *
 * @example
 *   const routes = useActionRoutes("/api/users");
 *   const { getAction } = useActions(withDefaultActions("User", controls), { routes });
 *   await getAction("update").trigger(user, { name: "Ada" });
 */

import { useDebounceFn } from "@vueuse/core";
import { shallowRef } from "vue";
import type { Ref } from "vue";
import { copyIcon, editIcon, trashIcon } from "../components/icon/icons";
import { uid } from "./uid";
import { FlashMessages } from "./flashMessages";
import { storeObject, canonicalizeResult } from "./objectStore";
import type {
  ActionController,
  ActionGlobalOptions,
  ActionOptions,
  ActionTarget,
  ActionTargetItem,
  ActiveActionVnode,
  ListController,
  ResourceAction,
} from "./action-types";
import type { TypedObject } from "./store-types";

/** The pending confirm/input surface; UI renders this when set. */
export const activeActionVnode: Ref<ActiveActionVnode | null> = shallowRef(null);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

/**
 * Store a reactive action seed. Actions are dynamic records (the store stamps
 * `__id`/`__timestamp`), so they are persisted through the TypedObject store and
 * returned as the reactive `ResourceAction` instance.
 */
function persist(seed: object): ResourceAction {
  return storeObject(seed as unknown as TypedObject) as unknown as ResourceAction;
}

export function useActions(
  actions: ActionOptions[],
  globalOptions: ActionGlobalOptions | null = null
): ActionController {
  const namespace = uid();

  /**
   * Resolve (and cache) the reactive action for a name, binding its trigger.
   * Creates a placeholder action when the name is not in the provided list.
   */
  function getAction(actionName: string, actionOptions?: Partial<ActionOptions>): ResourceAction {
    const baseOptions: Partial<ActionOptions> = actions.find((a) => a.name === actionName) || {
      name: actionName,
    };

    const resourceAction = persist({
      onAction: globalOptions?.routes?.applyAction,
      onBatchAction: globalOptions?.routes?.batchAction,
      onBatchSuccess: globalOptions?.controls?.clearSelectedRows,
      ...baseOptions,
      ...actionOptions,
      isApplying: false,
      __type: "__Action:" + namespace,
    });

    bindTrigger(resourceAction);
    return resourceAction;
  }

  /**
   * Extend an action under a new id so per-instance behavior does not leak to
   * other usages of the same base action.
   */
  function extendAction(
    actionName: string,
    extendedId: string | number,
    actionOptions: Partial<ActionOptions>
  ): ResourceAction {
    const action = getAction(actionName);
    const extendedAction = { ...action, ...actionOptions, id: extendedId } as ResourceAction;
    bindTrigger(extendedAction);
    return persist(extendedAction);
  }

  /** Replace an action's options, returning the updated reactive action. */
  function modifyAction(actionName: string, actionOptions: Partial<ActionOptions>): ResourceAction {
    const action = getAction(actionName);
    return persist({ ...action, ...actionOptions });
  }

  /** Resolve a list of actions by name (creating any that don't yet exist). */
  function getActions(names: string[]): ResourceAction[] {
    return names.map((name) => getAction(name));
  }

  function bindTrigger(action: ResourceAction): void {
    if (action.debounce) {
      action.trigger = useDebounceFn(
        (target?: ActionTarget, input?: unknown) => performAction(action, target ?? null, input),
        action.debounce
      );
    } else {
      action.trigger = (target?: ActionTarget, input?: unknown) =>
        performAction(action, target ?? null, input);
    }
  }

  /** Run an action against a target (single or batch), with optional confirm UI. */
  async function performAction(
    action: ResourceAction | string,
    target: ActionTarget = null,
    input: unknown = null
  ): Promise<unknown> {
    const resolvedAction = typeof action === "string" ? getAction(action) : action;
    const aliasedAction = resolvedAction.alias ? getAction(resolvedAction.alias) : null;
    const vnode = resolvedAction.vnode ? resolvedAction.vnode(target, input) : null;
    let result: unknown;

    // Abort early if onStart rejects the action.
    if (resolvedAction.onStart && !resolvedAction.onStart(resolvedAction, target, input)) {
      return;
    }

    setTargetSavingState(target, true);
    resolvedAction.isApplying = true;
    if (aliasedAction) aliasedAction.isApplying = true;

    if (vnode) {
      // Render the confirm/input surface and wait for confirm or cancel.
      result = await new Promise((resolve) => {
        activeActionVnode.value = {
          vnode,
          confirm: async (confirmInput: unknown) => {
            let resolvedInput: unknown;
            if (resolvedAction.useInputFromConfirm === false) {
              resolvedInput = input;
            } else if (resolvedAction.useInputFromConfirm === true) {
              resolvedInput = confirmInput;
            } else {
              resolvedInput = { ...(asRecord(input) || {}), ...(asRecord(confirmInput) || {}) };
            }

            const confirmResult = await onConfirmAction(resolvedAction, target, resolvedInput);
            // Keep the dialog open on error: only resolve on success.
            if (
              confirmResult === undefined ||
              confirmResult === true ||
              asRecord(confirmResult)?.success
            ) {
              resolve(confirmResult);
            }
          },
          cancel: resolve,
        };
      });

      activeActionVnode.value = null;
    } else {
      result = await onConfirmAction(resolvedAction, target, input);
    }

    const resultRecord = asRecord(result);
    if (resultRecord?.abort) {
      return result;
    }

    resolvedAction.isApplying = false;
    setTargetSavingState(target, false);
    if (aliasedAction) aliasedAction.isApplying = false;

    canonicalizeResult(result);

    return result;
  }

  return {
    getAction,
    getActions,
    action: performAction,
    modifyAction,
    extendAction,
  };
}

/** Toggle the reactive saving flag on a single or batch target. */
function setTargetSavingState(target: ActionTarget, saving: boolean): void {
  if (!target) return;
  const targets = Array.isArray(target) ? target : [target];
  for (const t of targets) {
    t.isSaving = saving;
  }
}

/**
 * Execute the confirmed action: optimistic update → route call → success/error
 * handling → finish callback.
 */
async function onConfirmAction(
  action: ResourceAction,
  target: ActionTarget,
  input: unknown = null
): Promise<unknown> {
  if (!action.onAction) {
    throw new Error("No onAction handler found for the selected action:" + action.name);
  }

  const isBatch = Array.isArray(target);
  let result: unknown;

  try {
    if (isBatch) {
      if (action.onBatchAction) {
        result = await action.onBatchAction(action.alias || action.name, target, input);
      } else {
        result = { error: `Action ${action.name} does not support batch actions` };
      }
    } else {
      const single = target as ActionTargetItem | null;
      // Wall-clock IS correct here (unlike request ordering, which uses a
      // monotonic counter): the optimistic stamp marks "the user changed this
      // now", so it out-dates any already-in-flight request's later stale
      // response in the per-field causal merge. Do NOT switch this to a counter.
      const __timestamp = Date.now();
      if (action.optimisticDelete) {
        storeObject({
          ...(asRecord(single) || {}),
          __deleted_at: new Date().toISOString(),
          __timestamp,
        } as ActionTargetItem);
      }

      if (typeof action.optimistic === "function") {
        action.optimistic(action, single, input);
        storeObject({ ...(asRecord(single) || {}), __timestamp } as ActionTargetItem);
      } else if (action.optimistic) {
        storeObject({
          ...(asRecord(single) || {}),
          ...(asRecord(input) || {}),
          __timestamp,
        } as ActionTargetItem);
      }

      result = await action.onAction(action.alias || action.name, single, input);
    }
  } catch (e) {
    if (String(e).match(/Request was aborted/)) {
      result = { abort: true };
    } else {
      console.error(e);
      result = {
        error: `An error occurred while performing the action ${action.label}. Please try again later.`,
      };
    }
  }

  const resultRecord = asRecord(result);
  if (resultRecord?.abort) {
    return result;
  }

  if (result === undefined || result === true || resultRecord?.success) {
    canonicalizeResult(result);
    if (resultRecord?.success && Array.isArray(target)) {
      FlashMessages.success(
        `Successfully performed action ${action.label} on ${target.length} items`
      );
    }
    if (action.onSuccess) {
      await action.onSuccess(result, target, input);
    }
    if (isBatch && action.onBatchSuccess) {
      await action.onBatchSuccess(result, target as ActionTargetItem[], input);
    }
  } else {
    const errors: string[] = [];
    if (Array.isArray(resultRecord?.errors)) {
      errors.push(...(resultRecord.errors as string[]));
    } else if (resultRecord?.error) {
      const rawError = resultRecord.error;
      let message: string;
      if (typeof rawError === "boolean") {
        message = (resultRecord.message as string) ?? "";
      } else if (typeof rawError === "string") {
        message = rawError;
      } else if (typeof rawError === "object") {
        message = (rawError as { message?: string }).message ?? "";
      } else {
        message = "An unknown error occurred. Please try again later.";
      }
      errors.push(message);
    } else {
      errors.push("An unexpected error occurred. Please try again later.");
    }

    FlashMessages.combine("error", errors);

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
 * The default CRUD action set. `create-with-name` and `delete-with-confirm` ship
 * WITHOUT a baked confirm/name dialog — supply your own `vnode` (e.g. built from
 * `DanxDialog`) to add confirm/name UI.
 */
export function withDefaultActions(
  label: string,
  listController?: ListController
): ActionOptions[] {
  return [
    { name: "create" },
    {
      name: "create-with-name",
      alias: "create",
      label: "Create " + label,
      onFinish: listController
        ? (result) => {
            const item = (asRecord(result)?.item as ActionTargetItem) ?? null;
            listController.activatePanel(item, "edit");
            listController.loadListAndSummary();
          }
        : undefined,
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
      icon: copyIcon,
      onSuccess: listController ? () => listController.loadListAndSummary() : undefined,
    },
    {
      name: "edit",
      label: "Edit",
      icon: editIcon,
      onAction: (_action, target) => listController?.activatePanel(target, "edit"),
    },
    { name: "delete" },
    {
      name: "delete-with-confirm",
      alias: "delete",
      label: "Delete",
      class: "text-red-500",
      iconClass: "text-red-500",
      icon: trashIcon,
      onFinish: listController ? () => listController.loadListAndSummary() : undefined,
    },
  ];
}
