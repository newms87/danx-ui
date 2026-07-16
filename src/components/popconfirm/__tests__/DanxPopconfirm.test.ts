import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxPopconfirm from "../DanxPopconfirm.vue";

/**
 * Mock native Popover API on HTMLElement.prototype since jsdom doesn't support it.
 * DanxPopconfirm renders a DanxPopover internally, which requires this API.
 */
const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const origMatches = HTMLElement.prototype.matches;

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ":popover-open") return popoverOpenState.get(this) ?? false;
    return origMatches.call(this, selector);
  };
});

afterEach(() => {
  HTMLElement.prototype.showPopover = undefined as unknown as () => void;
  HTMLElement.prototype.hidePopover = undefined as unknown as () => void;
  HTMLElement.prototype.matches = origMatches;
});

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("DanxPopconfirm", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPopconfirm(props: Record<string, unknown> = {}) {
    wrapper = mount(DanxPopconfirm, {
      props: { modelValue: true, ...props },
      slots: {
        trigger: '<button class="test-trigger">Open</button>',
      },
      attachTo: document.body,
    });

    return wrapper;
  }

  describe("trigger + panel rendering", () => {
    it("renders the trigger slot", () => {
      mountPopconfirm({ modelValue: false });
      expect(wrapper.find(".test-trigger").exists()).toBe(true);
    });

    it("does not render the panel when closed", () => {
      mountPopconfirm({ modelValue: false });
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });

    it("renders title, message, and action buttons when open", () => {
      mountPopconfirm({ title: "Delete item?", message: "Cannot be undone." });
      expect(wrapper.find(".danx-popconfirm__title").text()).toBe("Delete item?");
      expect(wrapper.find(".danx-popconfirm__message").text()).toBe("Cannot be undone.");
      const buttons = wrapper.findAll("button.danx-button");
      expect(buttons).toHaveLength(2);
    });

    it("omits title/message elements when not provided", () => {
      mountPopconfirm();
      expect(wrapper.find(".danx-popconfirm__title").exists()).toBe(false);
      expect(wrapper.find(".danx-popconfirm__message").exists()).toBe(false);
    });

    it("uses default confirm/cancel labels", () => {
      mountPopconfirm();
      const buttons = wrapper.findAll("button.danx-button");
      expect(buttons[0]!.text()).toBe("Cancel");
      expect(buttons[1]!.text()).toBe("Confirm");
    });

    it("supports custom confirm/cancel labels", () => {
      mountPopconfirm({ confirmText: "Delete", cancelText: "Keep" });
      const buttons = wrapper.findAll("button.danx-button");
      expect(buttons[0]!.text()).toBe("Keep");
      expect(buttons[1]!.text()).toBe("Delete");
    });
  });

  describe("opening via trigger click", () => {
    it("opens the panel when the trigger is clicked", async () => {
      mountPopconfirm({ modelValue: false });
      await nextTick();
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);

      await wrapper.find(".test-trigger").trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(true);
    });
  });

  describe("confirm (sync)", () => {
    it("calls onConfirm and closes the panel", async () => {
      const onConfirm = vi.fn();
      mountPopconfirm({ onConfirm });

      const buttons = wrapper.findAll("button.danx-button");
      await buttons[1]!.trigger("click");
      await nextTick();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });

    it("does not call onCancel when confirmed", async () => {
      const onCancel = vi.fn();
      mountPopconfirm({ onCancel });

      const buttons = wrapper.findAll("button.danx-button");
      await buttons[1]!.trigger("click");
      await nextTick();

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("confirm (async)", () => {
    it("shows a loading spinner and keeps the panel open until the promise resolves", async () => {
      const { promise, resolve } = deferred();
      const onConfirm = vi.fn(() => promise);
      mountPopconfirm({ onConfirm });

      const confirmButton = wrapper.findAll("button.danx-button")[1]!;
      await confirmButton.trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(true);

      resolve();
      await promise;
      await nextTick();
      await nextTick();

      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });

    it("keeps the panel open and stops loading when the promise rejects", async () => {
      const { promise, reject } = deferred();
      // Prevent an unhandled rejection warning from the deferred promise itself.
      promise.catch(() => undefined);
      const onConfirm = vi.fn(() => promise);
      mountPopconfirm({ onConfirm });

      const confirmButton = wrapper.findAll("button.danx-button")[1]!;
      await confirmButton.trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);

      reject(new Error("failed"));
      await promise.catch(() => undefined);
      await nextTick();
      await nextTick();

      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(true);
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("disables the cancel button while confirm is loading", async () => {
      const { promise, resolve } = deferred();
      const onConfirm = vi.fn(() => promise);
      mountPopconfirm({ onConfirm });

      const buttons = wrapper.findAll("button.danx-button");
      const cancelButton = buttons[0]!;
      const confirmButton = buttons[1]!;
      await confirmButton.trigger("click");
      await nextTick();

      expect(cancelButton.attributes("disabled")).toBeDefined();

      resolve();
      await promise;
      await nextTick();
    });

    it("ignores additional confirm clicks while loading", async () => {
      const { promise, resolve } = deferred();
      const onConfirm = vi.fn(() => promise);
      mountPopconfirm({ onConfirm });

      const confirmButton = wrapper.findAll("button.danx-button")[1]!;
      // Dispatch both clicks before the DOM re-renders the disabled attribute,
      // to exercise the in-component loading guard rather than the button's
      // own disabled-click behavior.
      confirmButton.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      confirmButton.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await nextTick();

      expect(onConfirm).toHaveBeenCalledTimes(1);

      resolve();
      await promise;
      await nextTick();
    });
  });

  describe("cancel", () => {
    it("calls onCancel and closes the panel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      mountPopconfirm({ onCancel });

      const cancelButton = wrapper.findAll("button.danx-button")[0]!;
      await cancelButton.trigger("click");
      await nextTick();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });

    it("calls onCancel when closed via Escape", async () => {
      const onCancel = vi.fn();
      mountPopconfirm({ onCancel });

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });

    it("calls onCancel when closed via outside click", async () => {
      const onCancel = vi.fn();
      mountPopconfirm({ onCancel });

      document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await nextTick();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(wrapper.find(".danx-popconfirm__actions").exists()).toBe(false);
    });
  });

  describe("v-model", () => {
    it("emits update:modelValue when opened and closed", async () => {
      mountPopconfirm({ modelValue: false });
      await nextTick();

      await wrapper.find(".test-trigger").trigger("click");
      await nextTick();
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);

      const cancelButton = wrapper.findAll("button.danx-button")[0]!;
      await cancelButton.trigger("click");
      await nextTick();
      const updates = wrapper.emitted("update:modelValue")!;
      expect(updates[updates.length - 1]).toEqual([false]);
    });
  });

  describe("placement", () => {
    it("passes placement through to the inner DanxPopover", () => {
      mountPopconfirm({ placement: "top" });
      const panel = wrapper.find(".danx-popover");
      expect(panel.attributes("data-placement")).toBe("top");
    });
  });
});
