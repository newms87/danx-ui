import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getItem, removeItem, setItem } from "../storage";

const KEY = "danx-ui:storage-test";

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((v) => typeof v === "number");
}

describe("getItem", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  it("returns the fallback when nothing is stored", () => {
    expect(getItem(KEY, "default")).toBe("default");
  });

  it("returns the parsed value when present", () => {
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
    expect(getItem(KEY, {})).toEqual({ a: 1 });
  });

  it("returns the fallback when JSON.parse throws on malformed content", () => {
    localStorage.setItem(KEY, "{not-json");
    expect(getItem(KEY, "default")).toBe("default");
  });

  it("returns the fallback when localStorage.getItem throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });
    expect(getItem(KEY, "default")).toBe("default");
    spy.mockRestore();
  });

  it("applies the validator and falls back when it rejects the parsed value", () => {
    localStorage.setItem(KEY, JSON.stringify(["a", "b"]));
    expect(getItem<number[]>(KEY, [], isNumberArray)).toEqual([]);
  });

  it("applies the validator and returns the value when it accepts", () => {
    localStorage.setItem(KEY, JSON.stringify([1, 2, 3]));
    expect(getItem<number[]>(KEY, [], isNumberArray)).toEqual([1, 2, 3]);
  });

  it("returns the fallback in an SSR-like environment with no window", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR where window is undefined
    delete globalThis.window;
    expect(getItem(KEY, "default")).toBe("default");
    globalThis.window = originalWindow;
  });
});

describe("setItem", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores a JSON-serialized value", () => {
    setItem(KEY, { a: 1 });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ a: 1 }));
  });

  it("does not throw when localStorage.setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => setItem(KEY, "value")).not.toThrow();
  });

  it("is a no-op in an SSR-like environment with no window", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR where window is undefined
    delete globalThis.window;
    expect(() => setItem(KEY, "value")).not.toThrow();
    globalThis.window = originalWindow;
  });
});

describe("removeItem", () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes a stored value", () => {
    localStorage.setItem(KEY, JSON.stringify("value"));
    removeItem(KEY);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("does not throw when localStorage.removeItem throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });
    expect(() => removeItem(KEY)).not.toThrow();
  });

  it("is a no-op in an SSR-like environment with no window", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR where window is undefined
    delete globalThis.window;
    expect(() => removeItem(KEY)).not.toThrow();
    globalThis.window = originalWindow;
  });
});
