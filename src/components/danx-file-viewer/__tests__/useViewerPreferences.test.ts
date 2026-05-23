import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePreference } from "../useViewerPreferences";

const NS = "viewer-prefs-test";

function key(name: string): string {
  return `${NS}-${name}`;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("usePreference", () => {
  it("returns the default when no stored value exists", () => {
    const pref = usePreference(NS, "layout", "horizontal");
    expect(pref.value).toBe("horizontal");
  });

  it("reads the stored value on creation", () => {
    window.localStorage.setItem(key("layout"), JSON.stringify("vertical"));
    const pref = usePreference(NS, "layout", "horizontal");
    expect(pref.value).toBe("vertical");
  });

  it("falls back to default when stored value is invalid JSON", () => {
    window.localStorage.setItem(key("layout"), "{not json");
    const pref = usePreference(NS, "layout", "horizontal");
    expect(pref.value).toBe("horizontal");
  });

  it("writes the new value to localStorage on assignment", () => {
    const pref = usePreference(NS, "zoom", 100);
    pref.value = 175;
    expect(window.localStorage.getItem(key("zoom"))).toBe("175");
  });

  it("re-reads identical types on next instantiation", () => {
    const pref = usePreference(NS, "zoom", 100);
    pref.value = 250;
    const next = usePreference(NS, "zoom", 100);
    expect(next.value).toBe(250);
  });

  it("supports a validate function — rejects malformed values, returns default", () => {
    window.localStorage.setItem(key("layout"), JSON.stringify(42));
    const pref = usePreference<"horizontal" | "vertical">(NS, "layout", "horizontal", {
      validate: (v): v is "horizontal" | "vertical" => v === "horizontal" || v === "vertical",
    });
    expect(pref.value).toBe("horizontal");
  });

  it("accepts validated stored values", () => {
    window.localStorage.setItem(key("layout"), JSON.stringify("vertical"));
    const pref = usePreference<"horizontal" | "vertical">(NS, "layout", "horizontal", {
      validate: (v): v is "horizontal" | "vertical" => v === "horizontal" || v === "vertical",
    });
    expect(pref.value).toBe("vertical");
  });

  it("tolerates localStorage.getItem throwing (private mode / disabled)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const pref = usePreference(NS, "zoom", 100);
    expect(pref.value).toBe(100);
  });

  it("tolerates localStorage.setItem throwing — value still lives in memory", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const pref = usePreference(NS, "zoom", 100);
    expect(() => {
      pref.value = 250;
    }).not.toThrow();
    expect(pref.value).toBe(250);
  });

  it("emits reactivity — accessing .value tracks", async () => {
    const { effect } = await import("vue");
    const pref = usePreference(NS, "zoom", 100);
    const seen: number[] = [];
    effect(() => {
      seen.push(pref.value);
    });
    pref.value = 200;
    pref.value = 250;
    expect(seen).toEqual([100, 200, 250]);
  });

  it("namespaces keys (avoids collision with other namespaces)", () => {
    const a = usePreference("ns-a", "zoom", 100);
    const b = usePreference("ns-b", "zoom", 100);
    a.value = 200;
    expect(window.localStorage.getItem("ns-a-zoom")).toBe("200");
    expect(window.localStorage.getItem("ns-b-zoom")).toBe(null);
    expect(b.value).toBe(100);
  });
});
