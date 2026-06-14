import { afterEach, describe, expect, it, vi } from "vitest";
import { activeActionVnode, useActions, withDefaultActions } from "../actions";
import { storeObject } from "../objectStore";
import { FlashMessages } from "../flashMessages";
import { copyIcon, editIcon, trashIcon } from "../../components/icon/icons";
import type { ActionOptions, ActionTargetItem } from "../action-types";

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
  vi.restoreAllMocks();
  activeActionVnode.value = null;
});

describe("useActions — resolution", () => {
  it("getAction returns a reactive action with a bound trigger", () => {
    const { getAction } = useActions([{ name: "save" }]);
    const action = getAction("save");
    expect(action.name).toBe("save");
    expect(action.isApplying).toBe(false);
    expect(action.trigger).toBeTypeOf("function");
  });

  it("getAction caches the same instance per name", () => {
    const { getAction } = useActions([{ name: "save" }]);
    expect(getAction("save")).toBe(getAction("save"));
  });

  it("getAction creates a placeholder for an unknown name", () => {
    const { getAction } = useActions([]);
    expect(getAction("mystery").name).toBe("mystery");
  });

  it("getActions resolves a list of names", () => {
    const { getActions } = useActions([{ name: "a" }, { name: "b" }]);
    expect(getActions(["a", "b"]).map((a) => a.name)).toEqual(["a", "b"]);
  });

  it("extendAction creates an isolated action with an id", () => {
    const { extendAction } = useActions([{ name: "save" }]);
    const extended = extendAction("save", "row-1", { label: "Save row" });
    expect(extended.id).toBe("row-1");
    expect(extended.label).toBe("Save row");
  });

  it("modifyAction replaces options on the action", () => {
    const { modifyAction } = useActions([{ name: "save" }]);
    expect(modifyAction("save", { label: "Saved!" }).label).toBe("Saved!");
  });
});

describe("useActions — performing", () => {
  it("runs onAction and returns its result", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { getAction } = useActions([{ name: "save", onAction }]);
    const target: ActionTargetItem = { id: 1, __type: "User", __timestamp: 1 };
    const result = await getAction("save").trigger(target);
    expect(onAction).toHaveBeenCalledWith("save", target, null);
    expect(result).toEqual({ success: true });
  });

  it("runs with a null target", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { getAction } = useActions([{ name: "create", onAction }]);
    await getAction("create").trigger();
    expect(onAction).toHaveBeenCalledWith("create", null, null);
  });

  it("throws when no onAction handler exists", async () => {
    const { getAction } = useActions([{ name: "save" }]);
    await expect(getAction("save").trigger({ id: 1, __type: "User" })).rejects.toThrow(
      "No onAction handler"
    );
  });

  it("aborts when onStart returns false", async () => {
    const onAction = vi.fn();
    const onStart = vi.fn().mockReturnValue(false);
    const { getAction } = useActions([{ name: "save", onAction, onStart }]);
    const result = await getAction("save").trigger({ id: 1, __type: "User" });
    expect(result).toBeUndefined();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("toggles isApplying and target.isSaving around the action", async () => {
    const target: ActionTargetItem = { id: 1, __type: "User", __timestamp: 1 };
    let savingDuring = false;
    const onAction = vi.fn().mockImplementation(async () => {
      savingDuring = target.isSaving === true;
      return { success: true };
    });
    const { getAction } = useActions([{ name: "save", onAction }]);
    const action = getAction("save");
    await action.trigger(target);
    expect(savingDuring).toBe(true);
    expect(target.isSaving).toBe(false);
    expect(action.isApplying).toBe(false);
  });

  it("passes the alias name to the route handler", async () => {
    // onAction comes from routes.applyAction for every action; the alias only
    // changes the name forwarded to it.
    const applyAction = vi.fn().mockResolvedValue({ success: true });
    const routes = { list: vi.fn(), applyAction } as unknown as NonNullable<
      Parameters<typeof useActions>[1]
    >["routes"];
    const { getAction } = useActions(
      [{ name: "update" }, { name: "update-debounced", alias: "update" }],
      { routes }
    );
    await getAction("update-debounced").trigger({ id: 1, __type: "User" });
    expect(applyAction).toHaveBeenCalledWith("update", expect.anything(), null);
  });

  it("returns immediately on an abort result", async () => {
    const onAction = vi.fn().mockResolvedValue({ abort: true });
    const { getAction } = useActions([{ name: "save", onAction }]);
    const action = getAction("save");
    const result = await action.trigger({ id: 1, __type: "User" });
    expect(result).toEqual({ abort: true });
    expect(action.isApplying).toBe(true); // not reset on abort
  });

  it("stores result.item and a typed result.result", async () => {
    const onAction = vi.fn().mockResolvedValue({
      success: true,
      item: { id: 9, __type: "User", __timestamp: 5 },
      result: { id: 10, __type: "Other", __timestamp: 5 },
    });
    const { getAction } = useActions([{ name: "save", onAction }]);
    const result = (await getAction("save").trigger({ id: 1, __type: "User" })) as {
      item: ActionTargetItem;
      result: ActionTargetItem;
    };
    expect(result.item.__id).toBeTypeOf("string");
    expect(result.result.__id).toBeTypeOf("string");
  });
});

describe("useActions — optimistic updates", () => {
  it("optimistic:true merges target+input into the store before the call", async () => {
    // The target is a stored instance (as in real usage); the optimistic merge
    // mutates that shared instance.
    const target = storeObject({ id: 1, __type: "OptA", name: "before", __timestamp: 1 });
    let nameAtCall = "";
    const onAction = vi.fn().mockImplementation(async () => {
      nameAtCall = target.name ?? "";
      return { success: true };
    });
    const { getAction } = useActions([{ name: "update", optimistic: true, onAction }]);
    await getAction("update").trigger(target, { name: "after" });
    expect(nameAtCall).toBe("after");
  });

  it("optimistic as a function is invoked before the call", async () => {
    const optimistic = vi.fn();
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const target = storeObject({ id: 1, __type: "OptB", __timestamp: 1 });
    const { getAction } = useActions([{ name: "update", optimistic, onAction }]);
    await getAction("update").trigger(target, { x: 1 });
    expect(optimistic).toHaveBeenCalledOnce();
  });

  it("optimisticDelete stamps __deleted_at into the store", async () => {
    const target = storeObject({ id: 1, __type: "OptC", __timestamp: 1 } as ActionTargetItem);
    let deletedAtCall: unknown;
    const onAction = vi.fn().mockImplementation(async () => {
      deletedAtCall = target.__deleted_at;
      return { success: true };
    });
    const { getAction } = useActions([{ name: "delete", optimisticDelete: true, onAction }]);
    await getAction("delete").trigger(target);
    expect(deletedAtCall).toBeTypeOf("string");
  });
});

describe("useActions — batch + success/error", () => {
  it("calls onBatchAction for array targets and flashes a success message", async () => {
    const onBatchAction = vi.fn().mockResolvedValue({ success: true });
    const onBatchSuccess = vi.fn();
    const successSpy = vi.spyOn(FlashMessages, "success").mockImplementation(() => {});
    // onAction is the top-level guard handler (supplied via routes in real usage).
    const { getAction } = useActions([
      { name: "del", label: "Delete", onAction: vi.fn(), onBatchAction, onBatchSuccess },
    ]);
    await getAction("del").trigger([
      { id: 1, __type: "User" },
      { id: 2, __type: "User" },
    ]);
    expect(onBatchAction).toHaveBeenCalled();
    expect(onBatchSuccess).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalledWith("Successfully performed action Delete on 2 items");
  });

  it("returns an error result when batch is unsupported", async () => {
    const combineSpy = vi.spyOn(FlashMessages, "combine").mockImplementation(() => {});
    const { getAction } = useActions([{ name: "del", onAction: vi.fn() }]);
    const result = (await getAction("del").trigger([{ id: 1, __type: "User" }])) as {
      error: string;
    };
    expect(result.error).toContain("does not support batch actions");
    expect(combineSpy).toHaveBeenCalled();
  });

  it("runs onSuccess on a successful single action", async () => {
    const onSuccess = vi.fn();
    const onFinish = vi.fn();
    const { getAction } = useActions([
      { name: "save", onAction: vi.fn().mockResolvedValue({ success: true }), onSuccess, onFinish },
    ]);
    await getAction("save").trigger({ id: 1, __type: "User" });
    expect(onSuccess).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
  });

  it.each([
    [{ errors: ["e1", "e2"] }, ["e1", "e2"]],
    [{ error: true, message: "boom" }, ["boom"]],
    [{ error: "plain error" }, ["plain error"]],
    [{ error: { message: "obj error" } }, ["obj error"]],
    [{ error: 42 }, ["An unknown error occurred. Please try again later."]],
    [{ failed: true }, ["An unexpected error occurred. Please try again later."]],
  ])("surfaces error result %o and calls onError", async (errorResult, expectedErrors) => {
    const combineSpy = vi.spyOn(FlashMessages, "combine").mockImplementation(() => {});
    const onError = vi.fn();
    const { getAction } = useActions([
      { name: "save", onAction: vi.fn().mockResolvedValue(errorResult), onError },
    ]);
    await getAction("save").trigger({ id: 1, __type: "User" });
    expect(onError).toHaveBeenCalled();
    expect(combineSpy).toHaveBeenCalledWith("error", expectedErrors);
  });

  it("converts a thrown abort into an abort result", async () => {
    const onAction = vi.fn().mockRejectedValue(new Error("Request was aborted: newer request"));
    const { getAction } = useActions([{ name: "save", onAction }]);
    const result = await getAction("save").trigger({ id: 1, __type: "User" });
    expect(result).toEqual({ abort: true });
  });

  it("converts an unexpected throw into an error result", async () => {
    const combineSpy = vi.spyOn(FlashMessages, "combine").mockImplementation(() => {});
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const onAction = vi.fn().mockRejectedValue(new Error("kaboom"));
    const { getAction } = useActions([{ name: "save", label: "Save", onAction }]);
    const result = (await getAction("save").trigger({ id: 1, __type: "User" })) as {
      error: string;
    };
    expect(result.error).toContain("An error occurred while performing the action Save");
    expect(combineSpy).toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalled();
  });
});

describe("useActions — confirm vnode flow", () => {
  function vnodeAction(extra: Partial<ActionOptions> = {}) {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const actions = useActions([
      { name: "save", vnode: () => ({ tag: "div" }), onAction, ...extra },
    ]);
    return { ...actions, onAction };
  }

  it("opens the active vnode and resolves on confirm", async () => {
    const { getAction, onAction } = vnodeAction();
    const promise = getAction("save").trigger({ id: 1, __type: "User" }, { a: 1 });
    await flush();
    expect(activeActionVnode.value).not.toBeNull();
    await activeActionVnode.value!.confirm({ b: 2 });
    await promise;
    // default merge: input + confirmInput
    expect(onAction).toHaveBeenCalledWith("save", expect.anything(), { a: 1, b: 2 });
    expect(activeActionVnode.value).toBeNull();
  });

  it("useInputFromConfirm:true passes only the confirm input", async () => {
    const { getAction, onAction } = vnodeAction({ useInputFromConfirm: true });
    const promise = getAction("save").trigger({ id: 1, __type: "User" }, { a: 1 });
    await flush();
    await activeActionVnode.value!.confirm({ b: 2 });
    await promise;
    expect(onAction).toHaveBeenCalledWith("save", expect.anything(), { b: 2 });
  });

  it("useInputFromConfirm:false passes only the original input", async () => {
    const { getAction, onAction } = vnodeAction({ useInputFromConfirm: false });
    const promise = getAction("save").trigger({ id: 1, __type: "User" }, { a: 1 });
    await flush();
    await activeActionVnode.value!.confirm({ b: 2 });
    await promise;
    expect(onAction).toHaveBeenCalledWith("save", expect.anything(), { a: 1 });
  });

  it("cancel resolves without running the action", async () => {
    const { getAction, onAction } = vnodeAction();
    const promise = getAction("save").trigger({ id: 1, __type: "User" });
    await flush();
    activeActionVnode.value!.cancel();
    await promise;
    expect(onAction).not.toHaveBeenCalled();
  });
});

describe("useActions — debounce", () => {
  afterEach(() => vi.useRealTimers());

  it("debounces the trigger", async () => {
    vi.useFakeTimers();
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { getAction } = useActions([{ name: "save", debounce: 200, onAction }]);
    const action = getAction("save");
    action.trigger({ id: 1, __type: "User" });
    action.trigger({ id: 1, __type: "User" });
    expect(onAction).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe("withDefaultActions", () => {
  it("returns the CRUD preset set", () => {
    const names = withDefaultActions("User").map((a) => a.name);
    expect(names).toEqual([
      "create",
      "create-with-name",
      "update",
      "update-debounced",
      "copy",
      "edit",
      "delete",
      "delete-with-confirm",
    ]);
  });

  it("create-with-name and delete-with-confirm ship WITHOUT a baked vnode", () => {
    const actions = withDefaultActions("User");
    const createWithName = actions.find((a) => a.name === "create-with-name")!;
    const deleteWithConfirm = actions.find((a) => a.name === "delete-with-confirm")!;
    expect(createWithName.vnode).toBeUndefined();
    expect(deleteWithConfirm.vnode).toBeUndefined();
  });

  it("uses danx-ui icons for copy/edit/delete-with-confirm", () => {
    const actions = withDefaultActions("User");
    expect(actions.find((a) => a.name === "copy")!.icon).toBe(copyIcon);
    expect(actions.find((a) => a.name === "edit")!.icon).toBe(editIcon);
    const del = actions.find((a) => a.name === "delete-with-confirm")!;
    expect(del.icon).toBe(trashIcon);
    expect(del.class).toBe("text-red-500");
  });

  it("update presets are optimistic; update-debounced is aliased + debounced", () => {
    const actions = withDefaultActions("User");
    expect(actions.find((a) => a.name === "update")!.optimistic).toBe(true);
    const debounced = actions.find((a) => a.name === "update-debounced")!;
    expect(debounced.alias).toBe("update");
    expect(debounced.debounce).toBe(1000);
  });

  it("omits list-controller callbacks when no controller is provided", () => {
    const actions = withDefaultActions("User");
    expect(actions.find((a) => a.name === "create-with-name")!.onFinish).toBeUndefined();
    expect(actions.find((a) => a.name === "copy")!.onSuccess).toBeUndefined();
    expect(actions.find((a) => a.name === "delete-with-confirm")!.onFinish).toBeUndefined();
  });

  it("wires list-controller callbacks when a controller is provided", () => {
    const activatePanel = vi.fn();
    const loadListAndSummary = vi.fn();
    const controller = { activatePanel, loadListAndSummary } as unknown as Parameters<
      typeof withDefaultActions
    >[1];
    const actions = withDefaultActions("User", controller);

    // edit → activatePanel
    const edit = actions.find((a) => a.name === "edit")!;
    const target: ActionTargetItem = { id: 1, __type: "User" };
    edit.onAction!("edit", target, null);
    expect(activatePanel).toHaveBeenCalledWith(target, "edit");

    // copy → loadListAndSummary
    actions.find((a) => a.name === "copy")!.onSuccess!(null, null, null);
    expect(loadListAndSummary).toHaveBeenCalled();

    // create-with-name onFinish → activatePanel(item) + reload
    actions.find((a) => a.name === "create-with-name")!.onFinish!(
      { item: { id: 2, __type: "User" } },
      null,
      null
    );
    expect(activatePanel).toHaveBeenCalledWith({ id: 2, __type: "User" }, "edit");

    // delete-with-confirm onFinish → reload (copy + create-with-name + delete = 3)
    actions.find((a) => a.name === "delete-with-confirm")!.onFinish!(null, null, null);
    expect(loadListAndSummary).toHaveBeenCalledTimes(3);
  });

  it("create-with-name onFinish handles a result without an item", () => {
    const activatePanel = vi.fn();
    const loadListAndSummary = vi.fn();
    const controller = { activatePanel, loadListAndSummary } as unknown as Parameters<
      typeof withDefaultActions
    >[1];
    const actions = withDefaultActions("User", controller);
    actions.find((a) => a.name === "create-with-name")!.onFinish!({}, null, null);
    expect(activatePanel).toHaveBeenCalledWith(null, "edit");
  });
});
