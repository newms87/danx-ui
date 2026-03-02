import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "../useToast";

describe("useToast", () => {
  let api: ReturnType<typeof useToast>;

  beforeEach(() => {
    vi.clearAllMocks();
    api = useToast();
    // Clear all toasts between tests
    api.dismissAll();
    // Mark container as mounted to suppress dev warnings
    api.containerMounted.value = true;
  });

  describe("toast()", () => {
    it("adds a toast to the list", () => {
      api.toast("Hello");
      expect(api.toasts.value).toHaveLength(1);
      expect(api.toasts.value[0]!.message).toBe("Hello");
    });

    it("returns a unique ID", () => {
      const id1 = api.toast("First");
      const id2 = api.toast("Second");
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it("applies default values", () => {
      api.toast("Test");
      const entry = api.toasts.value[0]!;
      expect(entry.variant).toBe("");
      expect(entry.position).toBe("bottom-right");
      expect(entry.duration).toBe(5000);
      expect(entry.dismissible).toBe(true);
      expect(entry.targetPlacement).toBe("top");
      expect(entry.count).toBe(1);
    });

    it("accepts custom options", () => {
      api.toast("Custom", {
        variant: "danger",
        position: "top-center",
        duration: 3000,
        dismissible: false,
      });
      const entry = api.toasts.value[0]!;
      expect(entry.variant).toBe("danger");
      expect(entry.position).toBe("top-center");
      expect(entry.duration).toBe(3000);
      expect(entry.dismissible).toBe(false);
    });

    it("sets a createdAt timestamp", () => {
      const before = Date.now();
      api.toast("Timestamped");
      const after = Date.now();
      const entry = api.toasts.value[0]!;
      expect(entry.createdAt).toBeGreaterThanOrEqual(before);
      expect(entry.createdAt).toBeLessThanOrEqual(after);
    });

    it("accepts target element option", () => {
      const el = document.createElement("div");
      api.toast("Anchored", { target: el, targetPlacement: "bottom" });
      const entry = api.toasts.value[0]!;
      expect(entry.target).toBe(el);
      expect(entry.targetPlacement).toBe("bottom");
    });
  });

  describe("variant shorthands", () => {
    it("success() sets variant to success", () => {
      api.success("Saved!");
      expect(api.toasts.value[0]!.variant).toBe("success");
    });

    it("danger() sets variant to danger", () => {
      api.danger("Error!");
      expect(api.toasts.value[0]!.variant).toBe("danger");
    });

    it("warning() sets variant to warning", () => {
      api.warning("Watch out!");
      expect(api.toasts.value[0]!.variant).toBe("warning");
    });

    it("info() sets variant to info", () => {
      api.info("FYI");
      expect(api.toasts.value[0]!.variant).toBe("info");
    });

    it("shorthands pass through other options", () => {
      api.success("Done", { position: "top-left", duration: 2000 });
      const entry = api.toasts.value[0]!;
      expect(entry.position).toBe("top-left");
      expect(entry.duration).toBe(2000);
    });
  });

  describe("deduplication", () => {
    it("increments count for matching message + variant + position", () => {
      api.toast("Same");
      api.toast("Same");
      api.toast("Same");
      expect(api.toasts.value).toHaveLength(1);
      expect(api.toasts.value[0]!.count).toBe(3);
    });

    it("does not deduplicate different messages", () => {
      api.toast("Alpha");
      api.toast("Beta");
      expect(api.toasts.value).toHaveLength(2);
    });

    it("does not deduplicate different variants", () => {
      api.toast("Same", { variant: "success" });
      api.toast("Same", { variant: "danger" });
      expect(api.toasts.value).toHaveLength(2);
    });

    it("does not deduplicate different positions", () => {
      api.toast("Same", { position: "top-left" });
      api.toast("Same", { position: "bottom-right" });
      expect(api.toasts.value).toHaveLength(2);
    });

    it("updates createdAt on duplicate", () => {
      api.toast("Dup");
      const firstTime = api.toasts.value[0]!.createdAt;
      // Set to an earlier time to verify it gets updated
      api.toasts.value[0]!.createdAt = firstTime - 1000;
      api.toast("Dup");
      expect(api.toasts.value[0]!.createdAt).toBeGreaterThan(firstTime - 1000);
    });

    it("returns the existing ID for duplicate", () => {
      const id1 = api.toast("Dup");
      const id2 = api.toast("Dup");
      expect(id1).toBe(id2);
    });

    it("deduplicates targeted toasts on the same target element", () => {
      const el = document.createElement("div");
      api.toast("Same", { target: el });
      api.toast("Same", { target: el });
      expect(api.toasts.value).toHaveLength(1);
      expect(api.toasts.value[0]!.count).toBe(2);
    });

    it("does not deduplicate targeted toasts on different target elements", () => {
      const el1 = document.createElement("div");
      const el2 = document.createElement("div");
      api.toast("Same", { target: el1 });
      api.toast("Same", { target: el2 });
      expect(api.toasts.value).toHaveLength(2);
    });

    it("does not deduplicate targeted vs non-targeted with same message", () => {
      const el = document.createElement("div");
      api.toast("Same");
      api.toast("Same", { target: el });
      expect(api.toasts.value).toHaveLength(2);
    });
  });

  describe("dismiss()", () => {
    it("removes a toast by ID", () => {
      const id = api.toast("Remove me");
      expect(api.toasts.value).toHaveLength(1);
      api.dismiss(id);
      expect(api.toasts.value).toHaveLength(0);
    });

    it("does nothing for unknown ID", () => {
      api.toast("Keep");
      api.dismiss("nonexistent");
      expect(api.toasts.value).toHaveLength(1);
    });

    it("only removes the targeted toast", () => {
      api.toast("First");
      const id = api.toast("Second");
      api.toast("Third");
      api.dismiss(id);
      expect(api.toasts.value).toHaveLength(2);
      expect(api.toasts.value.map((t) => t.message)).toEqual(["First", "Third"]);
    });
  });

  describe("dismissAll()", () => {
    it("removes all toasts", () => {
      api.toast("One");
      api.toast("Two");
      api.toast("Three");
      expect(api.toasts.value).toHaveLength(3);
      api.dismissAll();
      expect(api.toasts.value).toHaveLength(0);
    });
  });

  describe("container warning", () => {
    it("logs a warning when no container is mounted", () => {
      api.containerMounted.value = false;
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      api.toast("Orphan toast");
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("DanxToastContainer"));
      warnSpy.mockRestore();
    });

    it("does not warn when container is mounted", () => {
      api.containerMounted.value = true;
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      api.toast("Normal toast");
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("singleton behavior", () => {
    it("returns the same toasts array across multiple useToast() calls", () => {
      const api2 = useToast();
      api.toast("Shared");
      expect(api2.toasts.value).toHaveLength(1);
      expect(api2.toasts.value[0]!.message).toBe("Shared");
    });
  });
});
