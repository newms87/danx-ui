import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlashMessages } from "../flashMessages";
import { useToast } from "../../components/toast/useToast";
import { danxOptions } from "../config";
import type { DanxOptions } from "../config-types";

const toast = useToast();

describe("FlashMessages", () => {
  let snapshot: DanxOptions;

  beforeEach(() => {
    snapshot = danxOptions.value;
    danxOptions.value = { request: { baseUrl: "", headers: {} }, flashMessages: {} };
    toast.dismissAll();
    // Silence the "no container mounted" dev warning during tests.
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    danxOptions.value = snapshot;
    toast.dismissAll();
    vi.restoreAllMocks();
  });

  it("success maps to the success variant", () => {
    FlashMessages.success("Saved");
    expect(toast.toasts.value).toHaveLength(1);
    expect(toast.toasts.value[0]!.message).toBe("Saved");
    expect(toast.toasts.value[0]!.variant).toBe("success");
  });

  it("error maps to the danger variant", () => {
    FlashMessages.error("Boom");
    expect(toast.toasts.value[0]!.variant).toBe("danger");
  });

  it("info maps to the info variant", () => {
    FlashMessages.info("FYI");
    expect(toast.toasts.value[0]!.variant).toBe("info");
  });

  it("warning maps to the warning variant", () => {
    FlashMessages.warning("Careful");
    expect(toast.toasts.value[0]!.variant).toBe("warning");
  });

  it("send shows a neutral (default-variant) message", () => {
    FlashMessages.send("Hello");
    expect(toast.toasts.value[0]!.message).toBe("Hello");
    expect(toast.toasts.value[0]!.variant).toBe("");
  });

  it.each([
    ["success", FlashMessages.success],
    ["info", FlashMessages.info],
    ["warning", FlashMessages.warning],
    ["error", FlashMessages.error],
    ["send", FlashMessages.send],
  ] as const)("%s shows nothing for an empty message", (_name, fn) => {
    fn("");
    expect(toast.toasts.value).toHaveLength(0);
  });

  it("applies configured per-severity default options", () => {
    danxOptions.value = {
      ...danxOptions.value,
      flashMessages: { error: { duration: 1234 } },
    };
    FlashMessages.error("Boom");
    expect(toast.toasts.value[0]!.duration).toBe(1234);
  });

  it("send applies configured default options", () => {
    danxOptions.value = {
      ...danxOptions.value,
      flashMessages: { default: { duration: 999 } },
    };
    FlashMessages.send("Hi");
    expect(toast.toasts.value[0]!.duration).toBe(999);
  });

  it.each([
    ["success", FlashMessages.success],
    ["info", FlashMessages.info],
    ["warning", FlashMessages.warning],
    ["error", FlashMessages.error],
  ] as const)(
    "%s: a per-call option overrides the configured default",
    (name, fn) => {
      danxOptions.value = {
        ...danxOptions.value,
        flashMessages: { [name]: { duration: 1234 } },
      };
      fn("Boom", { duration: 0 });
      expect(toast.toasts.value[0]!.duration).toBe(0);
    }
  );

  describe("combine", () => {
    it("joins string messages with newlines into one toast", () => {
      FlashMessages.combine("error", ["A failed", "B failed"]);
      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0]!.message).toBe("A failed\nB failed");
      expect(toast.toasts.value[0]!.variant).toBe("danger");
    });

    it("resolves message/Message object entries and drops empties", () => {
      FlashMessages.combine("warning", [
        { message: "lower" },
        { Message: "upper" },
        "",
        { message: "" },
      ]);
      expect(toast.toasts.value[0]!.message).toBe("lower\nupper");
      expect(toast.toasts.value[0]!.variant).toBe("warning");
    });

    it("shows nothing when all entries are empty", () => {
      FlashMessages.combine("success", ["", { message: "" }]);
      expect(toast.toasts.value).toHaveLength(0);
    });
  });
});
