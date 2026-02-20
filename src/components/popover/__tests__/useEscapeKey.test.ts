import { describe, it, expect, vi, afterEach } from "vitest";
import { ref, effectScope, nextTick } from "vue";
import { useEscapeKey } from "../useEscapeKey";

describe("useEscapeKey", () => {
  let scope: ReturnType<typeof effectScope>;

  afterEach(() => {
    scope?.stop();
  });

  function pressEscape(): void {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  }

  function pressOtherKey(): void {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  }

  it("calls callback when Escape is pressed while active", () => {
    const callback = vi.fn();
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    pressEscape();

    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not call callback for non-Escape keys", () => {
    const callback = vi.fn();
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    pressOtherKey();

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call callback when inactive", () => {
    const callback = vi.fn();
    const isActive = ref(false);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    pressEscape();

    expect(callback).not.toHaveBeenCalled();
  });

  it("activates listener when isActive becomes true", async () => {
    const callback = vi.fn();
    const isActive = ref(false);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    pressEscape();
    expect(callback).not.toHaveBeenCalled();

    isActive.value = true;
    await nextTick();
    pressEscape();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("deactivates listener when isActive becomes false", async () => {
    const callback = vi.fn();
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    pressEscape();
    expect(callback).toHaveBeenCalledOnce();

    isActive.value = false;
    await nextTick();
    pressEscape();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("cleans up listener on scope disposal", () => {
    const callback = vi.fn();
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => useEscapeKey(callback, isActive));

    scope.stop();

    pressEscape();
    expect(callback).not.toHaveBeenCalled();
  });
});
