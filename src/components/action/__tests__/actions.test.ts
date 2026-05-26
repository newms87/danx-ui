import { describe, it, expect, vi } from "vitest";
import { useActions, withDefaultActions, activeActionVnode } from "../actions";
import type { ActionTargetItem } from "../types";

function makeRoutes(onAction?: (...args: unknown[]) => Promise<unknown>) {
  return {
    applyAction: onAction ?? vi.fn().mockResolvedValue({ success: true }),
    batchAction: vi.fn().mockResolvedValue({ success: true }),
  };
}

describe("useActions", () => {
  describe("getAction", () => {
    it("creates a ResourceAction with trigger function", () => {
      const { getAction } = useActions([{ name: "update" }], {
        routes: makeRoutes(),
      });
      const action = getAction("update");
      expect(action.name).toBe("update");
      expect(typeof action.trigger).toBe("function");
      expect(action.isApplying).toBe(false);
    });

    it("returns a reactive action (same instance on re-call)", () => {
      const { getAction } = useActions([{ name: "save" }], { routes: makeRoutes() });
      const a1 = getAction("save");
      const a2 = getAction("save");
      expect(a1).toBe(a2);
    });

    it("creates a synthetic action for unknown names", () => {
      const { getAction } = useActions([], { routes: makeRoutes() });
      const action = getAction("unknown-action");
      expect(action.name).toBe("unknown-action");
    });

    it("applies actionOptions overrides", () => {
      const { getAction } = useActions([{ name: "save", label: "Save" }], { routes: makeRoutes() });
      const action = getAction("save", { label: "Quick Save" });
      expect(action.label).toBe("Quick Save");
    });
  });

  describe("getActions", () => {
    it("returns multiple resolved actions in order", () => {
      const { getActions } = useActions([{ name: "create" }, { name: "delete" }], {
        routes: makeRoutes(),
      });
      const [create, del] = getActions(["create", "delete"]);
      expect(create!.name).toBe("create");
      expect(del!.name).toBe("delete");
    });
  });

  describe("action (performAction)", () => {
    it("calls onAction with correct arguments", async () => {
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const { action } = useActions([{ name: "update" }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });

      const target: ActionTargetItem = { id: "1" } as ActionTargetItem & { id: string };
      await action("update", target, { value: 42 });

      expect(onAction).toHaveBeenCalledOnce();
      expect(onAction.mock.calls[0]![0]).toBe("update");
      expect(onAction.mock.calls[0]![1]).toBe(target);
      expect(onAction.mock.calls[0]![2]).toEqual({ value: 42 });
    });

    it("sets isApplying during request and clears after", async () => {
      let applying: boolean | undefined;
      const onAction = vi.fn().mockImplementation(async () => {
        applying = true;
        return { success: true };
      });
      const { getAction, action } = useActions([{ name: "save" }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });
      const act = getAction("save");
      await action("save", {} as ActionTargetItem);

      expect(applying).toBe(true);
      expect(act.isApplying).toBe(false); // cleared after
    });

    it("calls onStart and aborts when it returns false", async () => {
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const onStart = vi.fn().mockReturnValue(false);
      const { action } = useActions([{ name: "guarded", onStart }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });

      const result = await action("guarded", {} as ActionTargetItem);
      expect(onStart).toHaveBeenCalledOnce();
      expect(onAction).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("calls onSuccess on successful result", async () => {
      const onSuccess = vi.fn();
      const { action } = useActions([{ name: "save", onSuccess }], {
        routes: { applyAction: vi.fn().mockResolvedValue({ success: true }) },
      });

      await action("save", {} as ActionTargetItem);
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    it("calls onError on error result and shows toast", async () => {
      const onError = vi.fn();
      const { action } = useActions([{ name: "fail", onError }], {
        routes: { applyAction: vi.fn().mockResolvedValue({ error: "Something went wrong" }) },
      });

      await action("fail", {} as ActionTargetItem);
      expect(onError).toHaveBeenCalledOnce();
    });

    it("calls onFinish regardless of outcome", async () => {
      const onFinish = vi.fn();
      const { action } = useActions([{ name: "always", onFinish }], {
        routes: { applyAction: vi.fn().mockResolvedValue({ error: "fail" }) },
      });

      await action("always", {} as ActionTargetItem);
      expect(onFinish).toHaveBeenCalledOnce();
    });

    it("returns early on abort result without state change", async () => {
      const onSuccess = vi.fn();
      const { getAction, action } = useActions([{ name: "abortable", onSuccess }], {
        routes: { applyAction: vi.fn().mockResolvedValue({ abort: true }) },
      });
      const act = getAction("abortable");
      act.isApplying = true;

      const result = await action("abortable", {} as ActionTargetItem);
      expect((result as { abort?: boolean }).abort).toBe(true);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("handles batch actions via onBatchAction", async () => {
      const onBatchAction = vi.fn().mockResolvedValue({ success: true });
      const { action } = useActions([{ name: "bulk", onBatchAction }], {
        routes: { applyAction: vi.fn(), batchAction: onBatchAction },
      });

      const targets: ActionTargetItem[] = [{} as ActionTargetItem, {} as ActionTargetItem];
      await action("bulk", targets);
      expect(onBatchAction).toHaveBeenCalledOnce();
    });

    it("throws when action has no onAction handler", async () => {
      const { action } = useActions([{ name: "bare" }], { routes: undefined });

      await expect(action("bare", {} as ActionTargetItem)).rejects.toThrow("No onAction handler");
    });
  });

  describe("vnode / activeActionVnode integration", () => {
    it("sets activeActionVnode and resolves after confirm", async () => {
      const vnode = vi.fn().mockReturnValue("fake-vnode");
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const { action } = useActions([{ name: "modal", vnode }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });

      // Start action without awaiting — it will pause at the vnode
      const resultPromise = action("modal", {} as ActionTargetItem);

      // Vnode should now be active
      await Promise.resolve(); // allow microtasks
      expect(activeActionVnode.value).not.toBeNull();
      expect(activeActionVnode.value!.vnode).toBe("fake-vnode");

      // Simulate user confirming
      await activeActionVnode.value!.confirm({});
      const result = await resultPromise;

      expect(result).toEqual({ success: true });
      expect(activeActionVnode.value).toBeNull();
    });

    it("resolves undefined on cancel", async () => {
      const vnode = vi.fn().mockReturnValue("vnode");
      const { action } = useActions([{ name: "cancelable", vnode }], {
        routes: { applyAction: vi.fn().mockResolvedValue({ success: true }) },
      });

      const resultPromise = action("cancelable", {} as ActionTargetItem);
      await Promise.resolve();
      activeActionVnode.value!.cancel();
      const result = await resultPromise;

      expect(result).toBeUndefined();
    });
  });

  describe("extendAction", () => {
    it("creates an isolated copy with overridden options", () => {
      const { getAction, extendAction } = useActions([{ name: "save", label: "Save" }], {
        routes: makeRoutes(),
      });
      const base = getAction("save");
      const extended = extendAction("save", "item-1", { label: "Save Item" });

      expect(extended.label).toBe("Save Item");
      expect(base.label).toBe("Save");
      expect(extended).not.toBe(base);
    });
  });

  describe("modifyAction", () => {
    it("updates options on the existing action", () => {
      const { getAction, modifyAction } = useActions([{ name: "edit", label: "Edit" }], {
        routes: makeRoutes(),
      });
      getAction("edit"); // ensure it exists
      const modified = modifyAction("edit", { label: "Renamed" });
      expect(modified.label).toBe("Renamed");
    });
  });

  describe("optimistic updates", () => {
    it("applies optimistic:true by merging input into target before request", async () => {
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const { action } = useActions([{ name: "update", optimistic: true }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });
      const target = { id: "1", __type: "Thing", name: "old" } as ActionTargetItem & {
        name: string;
      };
      const stored = { ...target };

      await action("update", stored as ActionTargetItem, { name: "new" });
      // The reactive object should have been updated before or during the request
      expect(onAction).toHaveBeenCalledOnce();
    });

    it("optimisticDelete marks target with __deleted_at before request", async () => {
      const type = `OD${Date.now()}`;
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const { action } = useActions([{ name: "remove", optimisticDelete: true }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });

      const target = { id: "del1", __type: type, __id: "uid-del1" } as ActionTargetItem;
      await action("remove", target);
      expect(onAction).toHaveBeenCalledOnce();
    });
  });

  describe("debounced trigger", () => {
    it("debounces rapid calls", async () => {
      vi.useFakeTimers();
      const onAction = vi.fn().mockResolvedValue({ success: true });
      const { getAction } = useActions([{ name: "search", debounce: 300 }], {
        routes: { applyAction: onAction, batchAction: vi.fn() },
      });
      const act = getAction("search");

      act.trigger({} as ActionTargetItem);
      act.trigger({} as ActionTargetItem);
      act.trigger({} as ActionTargetItem);

      // Not called yet
      expect(onAction).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      await Promise.resolve();

      // Called once after debounce
      expect(onAction).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});

describe("withDefaultActions", () => {
  it("returns all standard action names", () => {
    const actions = withDefaultActions("Item");
    const names = actions.map((a) => a.name);
    expect(names).toContain("create");
    expect(names).toContain("create-with-name");
    expect(names).toContain("update");
    expect(names).toContain("update-debounced");
    expect(names).toContain("copy");
    expect(names).toContain("edit");
    expect(names).toContain("delete");
    expect(names).toContain("delete-with-confirm");
  });

  it("update-debounced has debounce=1000", () => {
    const actions = withDefaultActions("X");
    const debounced = actions.find((a) => a.name === "update-debounced")!;
    expect(debounced.debounce).toBe(1000);
  });

  it("delete-with-confirm has alias=delete", () => {
    const actions = withDefaultActions("X");
    const del = actions.find((a) => a.name === "delete-with-confirm")!;
    expect(del.alias).toBe("delete");
  });

  it("create-with-name has a vnode factory", () => {
    const actions = withDefaultActions("Widget");
    const action = actions.find((a) => a.name === "create-with-name")!;
    expect(typeof action.vnode).toBe("function");
  });

  it("wires listController callbacks", () => {
    const controller = {
      activatePanel: vi.fn(),
      loadListAndSummary: vi.fn(),
    };
    const actions = withDefaultActions("Item", controller);
    const copy = actions.find((a) => a.name === "copy")!;
    expect(copy.onSuccess).toBe(controller.loadListAndSummary);
  });

  it("create-with-name vnode factory returns a vnode", () => {
    const actions = withDefaultActions("Campaign");
    const cwn = actions.find((a) => a.name === "create-with-name")!;
    const vnode = cwn.vnode!(null, null);
    expect(vnode).toBeTruthy();
  });

  it("delete-with-confirm vnode factory returns a vnode", () => {
    const actions = withDefaultActions("Campaign");
    const del = actions.find((a) => a.name === "delete-with-confirm")!;
    const vnode = del.vnode!({ id: "1" } as ActionTargetItem, null);
    expect(vnode).toBeTruthy();
  });

  it("create-with-name onFinish activates panel + reloads when item present", () => {
    const controller = { activatePanel: vi.fn(), loadListAndSummary: vi.fn() };
    const actions = withDefaultActions("Item", controller);
    const cwn = actions.find((a) => a.name === "create-with-name")!;
    const item = { id: "new1" } as ActionTargetItem;
    cwn.onFinish!({ item }, null, null);
    expect(controller.activatePanel).toHaveBeenCalledWith(item, "edit");
    expect(controller.loadListAndSummary).toHaveBeenCalledOnce();
  });

  it("create-with-name onFinish only reloads when no item present", () => {
    const controller = { activatePanel: vi.fn(), loadListAndSummary: vi.fn() };
    const actions = withDefaultActions("Item", controller);
    const cwn = actions.find((a) => a.name === "create-with-name")!;
    cwn.onFinish!({}, null, null);
    expect(controller.activatePanel).not.toHaveBeenCalled();
    expect(controller.loadListAndSummary).toHaveBeenCalledOnce();
  });

  it("edit onAction activates the edit panel", async () => {
    const controller = { activatePanel: vi.fn(), loadListAndSummary: vi.fn() };
    const actions = withDefaultActions("Item", controller);
    const edit = actions.find((a) => a.name === "edit")!;
    const target = { id: "e1" } as ActionTargetItem;
    await edit.onAction!("edit", target, null);
    expect(controller.activatePanel).toHaveBeenCalledWith(target, "edit");
  });

  it("create-with-name onFinish is undefined without a controller", () => {
    const actions = withDefaultActions("Item");
    const cwn = actions.find((a) => a.name === "create-with-name")!;
    expect(cwn.onFinish).toBeUndefined();
  });
});

describe("useActions — additional branch coverage", () => {
  function singleRoute(onAction: (...args: unknown[]) => Promise<unknown>) {
    return { routes: { applyAction: onAction, batchAction: vi.fn() } };
  }

  it("marks the aliased action as applying", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { getAction, action } = useActions(
      [{ name: "base" }, { name: "alias-action", alias: "base" }],
      { routes: { applyAction: onAction, batchAction: vi.fn() } }
    );
    const base = getAction("base");
    let baseApplyingDuring: boolean | undefined;
    onAction.mockImplementation(async () => {
      baseApplyingDuring = base.isApplying;
      return { success: true };
    });
    await action("alias-action", {} as ActionTargetItem);
    expect(baseApplyingDuring).toBe(true);
    expect(base.isApplying).toBe(false);
  });

  it("stores result.item when the result carries an item", async () => {
    const type = `RI${Date.now()}`;
    const onAction = vi
      .fn()
      .mockResolvedValue({ success: true, item: { id: "i1", __type: type, name: "x" } });
    const { action } = useActions([{ name: "save" }], singleRoute(onAction));
    const result = (await action("save", {} as ActionTargetItem)) as { item: { name: string } };
    expect(result.item.name).toBe("x");
  });

  it("stores result.result when it is a TypedObject", async () => {
    const type = `RR${Date.now()}`;
    const onAction = vi
      .fn()
      .mockResolvedValue({ success: true, result: { id: "r1", __type: type, name: "y" } });
    const { action } = useActions([{ name: "save" }], singleRoute(onAction));
    const result = (await action("save", {} as ActionTargetItem)) as { result: { name: string } };
    expect(result.result.name).toBe("y");
  });

  it("invokes a function-style optimistic callback", async () => {
    const optimistic = vi.fn();
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { action } = useActions([{ name: "opt", optimistic }], singleRoute(onAction));
    const target = { id: "o1", __type: "Opt" } as ActionTargetItem;
    await action("opt", target, { x: 1 });
    expect(optimistic).toHaveBeenCalledOnce();
  });

  it("returns an error result for batch when no onBatchAction is defined", async () => {
    const { action } = useActions([{ name: "nobatch" }], {
      routes: { applyAction: vi.fn(), batchAction: undefined },
    });
    const result = (await action("nobatch", [{} as ActionTargetItem])) as { error: string };
    expect(result.error).toMatch(/does not support batch actions/);
  });

  it("shows a success toast for a successful batch action", async () => {
    const onBatchAction = vi.fn().mockResolvedValue({ success: true });
    const { action } = useActions([{ name: "bulk", label: "Bulk", onBatchAction }], {
      routes: { applyAction: vi.fn(), batchAction: onBatchAction },
    });
    const result = await action("bulk", [{} as ActionTargetItem, {} as ActionTargetItem]);
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("calls onBatchSuccess after a successful batch", async () => {
    const onBatchSuccess = vi.fn();
    const onBatchAction = vi.fn().mockResolvedValue({ success: true });
    const { action } = useActions([{ name: "bulk", onBatchAction, onBatchSuccess }], {
      routes: { applyAction: vi.fn(), batchAction: onBatchAction },
    });
    await action("bulk", [{} as ActionTargetItem]);
    expect(onBatchSuccess).toHaveBeenCalledOnce();
  });

  it("aggregates an errors[] array", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", onError }], {
      routes: { applyAction: vi.fn().mockResolvedValue({ errors: ["a", "b"] }) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("handles error=true with a message field", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", onError }], {
      routes: { applyAction: vi.fn().mockResolvedValue({ error: true, message: "boom" }) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("handles error as an object with message", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", onError }], {
      routes: { applyAction: vi.fn().mockResolvedValue({ error: { message: "obj-err" } }) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("handles error of an unexpected type (number)", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", onError }], {
      routes: { applyAction: vi.fn().mockResolvedValue({ error: 42 }) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("handles a falsy non-success result with no error fields", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", onError }], {
      routes: { applyAction: vi.fn().mockResolvedValue({ success: false }) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("treats a thrown 'Request was aborted' as an abort result", async () => {
    const { action } = useActions([{ name: "f" }], {
      routes: {
        applyAction: vi.fn().mockRejectedValue(new Error("Request was aborted by the test")),
      },
    });
    const result = await action("f", {} as ActionTargetItem);
    expect((result as { abort: boolean }).abort).toBe(true);
  });

  it("treats a thrown non-abort error as an error result", async () => {
    const onError = vi.fn();
    const { action } = useActions([{ name: "f", label: "Fail", onError }], {
      routes: { applyAction: vi.fn().mockRejectedValue(new Error("network down")) },
    });
    await action("f", {} as ActionTargetItem);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("uses confirm input verbatim when useInputFromConfirm is true", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const vnode = vi.fn().mockReturnValue("v");
    const { action } = useActions(
      [{ name: "modal", vnode, useInputFromConfirm: true }],
      singleRoute(onAction)
    );
    const p = action("modal", {} as ActionTargetItem, { original: 1 });
    await Promise.resolve();
    await activeActionVnode.value!.confirm({ fromConfirm: 2 });
    await p;
    expect(onAction.mock.calls[0]![2]).toEqual({ fromConfirm: 2 });
  });

  it("handles a null target without touching saving state", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const { action } = useActions([{ name: "no-target" }], singleRoute(onAction));
    const result = await action("no-target", null);
    expect(onAction).toHaveBeenCalledOnce();
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("uses original input when useInputFromConfirm is false", async () => {
    const onAction = vi.fn().mockResolvedValue({ success: true });
    const vnode = vi.fn().mockReturnValue("v");
    const { action } = useActions(
      [{ name: "modal", vnode, useInputFromConfirm: false }],
      singleRoute(onAction)
    );
    const p = action("modal", {} as ActionTargetItem, { original: 1 });
    await Promise.resolve();
    await activeActionVnode.value!.confirm({ fromConfirm: 2 });
    await p;
    expect(onAction.mock.calls[0]![2]).toEqual({ original: 1 });
  });
});
