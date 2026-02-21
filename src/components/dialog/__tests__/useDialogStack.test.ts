import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDialogStack } from "../useDialogStack";

describe("useDialogStack", () => {
  beforeEach(() => {
    const { reset } = useDialogStack();
    reset();
  });

  describe("singleton behavior", () => {
    it("returns the same stack instance across multiple calls", () => {
      const a = useDialogStack();
      const b = useDialogStack();
      expect(a.stack).toBe(b.stack);
    });
  });

  describe("register", () => {
    it("adds an entry to the stack", () => {
      const { register, stack } = useDialogStack();
      register("Dialog A", () => {});
      expect(stack.value).toHaveLength(1);
      expect(stack.value[0]!.title()).toBe("Dialog A");
    });

    it("returns a unique id", () => {
      const { register } = useDialogStack();
      const id1 = register("A", () => {});
      const id2 = register("B", () => {});
      expect(id1).not.toBe(id2);
    });

    it("accepts a getter function for reactive title", () => {
      const { register, stack } = useDialogStack();
      let title = "Initial";
      register(
        () => title,
        () => {}
      );
      expect(stack.value[0]!.title()).toBe("Initial");

      title = "Updated";
      expect(stack.value[0]!.title()).toBe("Updated");
    });

    it("adds entries in order (bottom to top)", () => {
      const { register, stack } = useDialogStack();
      register("First", () => {});
      register("Second", () => {});
      register("Third", () => {});
      expect(stack.value.map((e) => e.title())).toEqual(["First", "Second", "Third"]);
    });
  });

  describe("unregister", () => {
    it("removes the entry from the stack", () => {
      const { register, unregister, stack } = useDialogStack();
      const id = register("A", () => {});
      expect(stack.value).toHaveLength(1);
      unregister(id);
      expect(stack.value).toHaveLength(0);
    });

    it("does nothing for unknown id", () => {
      const { register, unregister, stack } = useDialogStack();
      register("A", () => {});
      unregister("nonexistent");
      expect(stack.value).toHaveLength(1);
    });

    it("closes all entries above when removing a mid-stack entry", () => {
      const { register, unregister, stack } = useDialogStack();
      const closeFnB = vi.fn();
      const closeFnC = vi.fn();
      const idA = register("A", () => {});
      register("B", closeFnB);
      register("C", closeFnC);

      unregister(idA);

      // B and C should have their close callbacks called (in reverse order)
      expect(closeFnC).toHaveBeenCalled();
      expect(closeFnB).toHaveBeenCalled();
      expect(stack.value).toHaveLength(0);
    });

    it("calls close callbacks in reverse order (top first, including target)", () => {
      const { register, unregister } = useDialogStack();
      const order: string[] = [];
      const idA = register("A", () => order.push("A"));
      register("B", () => order.push("B"));
      register("C", () => order.push("C"));

      unregister(idA);
      expect(order).toEqual(["C", "B", "A"]);
    });
  });

  describe("navigateTo", () => {
    it("closes all entries above the target", () => {
      const { register, navigateTo, stack } = useDialogStack();
      const closeFnB = vi.fn();
      const closeFnC = vi.fn();
      const idA = register("A", () => {});
      register("B", closeFnB);
      register("C", closeFnC);

      navigateTo(idA);

      expect(closeFnC).toHaveBeenCalled();
      expect(closeFnB).toHaveBeenCalled();
      expect(stack.value).toHaveLength(1);
      expect(stack.value[0]!.title()).toBe("A");
    });

    it("does nothing when navigating to the top entry", () => {
      const { register, navigateTo, stack } = useDialogStack();
      register("A", () => {});
      const idB = register("B", () => {});

      navigateTo(idB);
      expect(stack.value).toHaveLength(2);
    });

    it("does nothing for unknown id", () => {
      const { register, navigateTo, stack } = useDialogStack();
      register("A", () => {});
      navigateTo("nonexistent");
      expect(stack.value).toHaveLength(1);
    });

    it("calls close callbacks in reverse order", () => {
      const { register, navigateTo } = useDialogStack();
      const order: string[] = [];
      const idA = register("A", () => {});
      register("B", () => order.push("B"));
      register("C", () => order.push("C"));

      navigateTo(idA);
      expect(order).toEqual(["C", "B"]);
    });
  });

  describe("isTopOfStack", () => {
    it("returns true for the last registered entry", () => {
      const { register, isTopOfStack } = useDialogStack();
      register("A", () => {});
      const idB = register("B", () => {});
      expect(isTopOfStack(idB)).toBe(true);
    });

    it("returns false for non-top entries", () => {
      const { register, isTopOfStack } = useDialogStack();
      const idA = register("A", () => {});
      register("B", () => {});
      expect(isTopOfStack(idA)).toBe(false);
    });

    it("returns false for unknown id", () => {
      const { register, isTopOfStack } = useDialogStack();
      register("A", () => {});
      expect(isTopOfStack("nonexistent")).toBe(false);
    });

    it("returns false when stack is empty", () => {
      const { isTopOfStack } = useDialogStack();
      expect(isTopOfStack("any")).toBe(false);
    });
  });

  describe("stackSize", () => {
    it("returns 0 when empty", () => {
      const { stackSize } = useDialogStack();
      expect(stackSize.value).toBe(0);
    });

    it("reflects the number of entries", () => {
      const { register, stackSize } = useDialogStack();
      register("A", () => {});
      expect(stackSize.value).toBe(1);
      register("B", () => {});
      expect(stackSize.value).toBe(2);
    });

    it("updates when entries are removed", () => {
      const { register, unregister, stackSize } = useDialogStack();
      const id = register("A", () => {});
      register("B", () => {});
      expect(stackSize.value).toBe(2);
      unregister(id);
      expect(stackSize.value).toBe(0);
    });
  });

  describe("reset", () => {
    it("clears the entire stack", () => {
      const { register, reset, stack, stackSize } = useDialogStack();
      register("A", () => {});
      register("B", () => {});
      reset();
      expect(stack.value).toHaveLength(0);
      expect(stackSize.value).toBe(0);
    });

    it("does NOT call close callbacks on remaining entries", () => {
      const { register, reset } = useDialogStack();
      const closeFn = vi.fn();
      register("A", closeFn);
      register("B", closeFn);
      reset();
      expect(closeFn).not.toHaveBeenCalled();
    });

    it("resets the id counter", () => {
      const { register, reset } = useDialogStack();
      register("A", () => {});
      reset();
      const id = register("B", () => {});
      expect(id).toBe("dialog-stack-0");
    });
  });
});
