import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEscapeKey } from "../useEscapeKey";

// Track lifecycle hooks
let mountedCallbacks: (() => void)[] = [];
let unmountedCallbacks: (() => void)[] = [];

vi.mock("vue", async () => {
  const actual = await vi.importActual<typeof import("vue")>("vue");
  return {
    ...actual,
    onMounted: vi.fn((cb: () => void) => {
      mountedCallbacks.push(cb);
    }),
    onUnmounted: vi.fn((cb: () => void) => {
      unmountedCallbacks.push(cb);
    }),
  };
});

describe("useEscapeKey", () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mountedCallbacks = [];
    unmountedCallbacks = [];
    callback = vi.fn();
  });

  afterEach(() => {
    // Run unmount callbacks to clean up listeners
    unmountedCallbacks.forEach((cb) => cb());
  });

  it("calls callback when Escape is pressed after mount", () => {
    useEscapeKey(callback);

    // Simulate mount
    mountedCallbacks.forEach((cb) => cb());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not call callback for non-Escape keys", () => {
    useEscapeKey(callback);
    mountedCallbacks.forEach((cb) => cb());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));

    expect(callback).not.toHaveBeenCalled();
  });

  it("removes listener on unmount", () => {
    useEscapeKey(callback);
    mountedCallbacks.forEach((cb) => cb());

    // Simulate unmount
    unmountedCallbacks.forEach((cb) => cb());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not respond before mount", () => {
    useEscapeKey(callback);

    // Don't call mount callbacks
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callback).not.toHaveBeenCalled();
  });
});
