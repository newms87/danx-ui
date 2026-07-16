import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxDrawer from "../DanxDrawer.vue";

/**
 * DanxDrawer uses <Teleport to="body">, so teleported content renders in
 * document.body, not inside the wrapper element. We use document.body
 * queries for DOM assertions and the wrapper for event assertions.
 */

const wrappers: VueWrapper[] = [];

function mountDrawer(props: Record<string, unknown>, slots?: Record<string, string>) {
  const wrapper = mount(DanxDrawer, { props, slots });
  wrappers.push(wrapper);
  return wrapper;
}

function bodyQuery(selector: string): Element | null {
  return document.body.querySelector(selector);
}

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  document.body.style.overflow = "";
});

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  document.body.style.overflow = "";
});

describe("DanxDrawer", () => {
  describe("Rendering", () => {
    it("renders when modelValue is true", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      expect(bodyQuery("dialog.danx-drawer")).not.toBeNull();
    });

    it("does not render when modelValue is false", () => {
      mountDrawer({ modelValue: false });

      expect(bodyQuery("dialog.danx-drawer")).toBeNull();
    });

    it("renders title prop", async () => {
      mountDrawer({ modelValue: true, title: "Filters" });
      await nextTick();

      expect(bodyQuery(".danx-drawer__title")?.textContent?.trim()).toBe("Filters");
    });

    it("renders default slot content", async () => {
      mountDrawer({ modelValue: true }, { default: "Drawer content here" });
      await nextTick();

      expect(bodyQuery(".danx-drawer__content")?.textContent).toContain("Drawer content here");
    });

    it("renders footer slot content", async () => {
      mountDrawer({ modelValue: true }, { footer: "<button>Apply</button>" });
      await nextTick();

      expect(bodyQuery(".danx-drawer__footer")).not.toBeNull();
      expect(bodyQuery(".danx-drawer__footer")?.textContent).toBe("Apply");
    });

    it("does not render footer when no footer slot provided", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-drawer__footer")).toBeNull();
    });

    it("header slot replaces the default header", async () => {
      mountDrawer(
        { modelValue: true, title: "Ignored" },
        { header: '<div class="custom-header">Custom</div>' }
      );
      await nextTick();

      expect(bodyQuery(".custom-header")).not.toBeNull();
      expect(bodyQuery(".danx-drawer__title")).toBeNull();
    });

    it("calls showModal when opened", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });
  });

  describe("Sides", () => {
    it("defaults to right side", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      expect(bodyQuery("dialog.danx-drawer")?.getAttribute("data-side")).toBe("right");
    });

    it.each(["left", "right", "top", "bottom"] as const)(
      "applies data-side=%s to the dialog and box",
      async (side) => {
        mountDrawer({ modelValue: true, side });
        await nextTick();

        expect(bodyQuery("dialog.danx-drawer")?.getAttribute("data-side")).toBe(side);
        expect(bodyQuery(".danx-drawer__box")?.getAttribute("data-side")).toBe(side);
      }
    );
  });

  describe("Sizing", () => {
    it("size as number converts to vw for left/right", async () => {
      mountDrawer({ modelValue: true, side: "right", size: 30 });
      await nextTick();

      const box = bodyQuery(".danx-drawer__box") as HTMLElement;
      expect(box.style.width).toBe("30vw");
    });

    it("size as number converts to vh for top/bottom", async () => {
      mountDrawer({ modelValue: true, side: "bottom", size: 40 });
      await nextTick();

      const box = bodyQuery(".danx-drawer__box") as HTMLElement;
      expect(box.style.height).toBe("40vh");
    });

    it("size as string passes through unchanged", async () => {
      mountDrawer({ modelValue: true, side: "left", size: "400px" });
      await nextTick();

      const box = bodyQuery(".danx-drawer__box") as HTMLElement;
      expect(box.style.width).toBe("400px");
    });
  });

  describe("Close behavior", () => {
    it("clicking backdrop closes when not persistent", async () => {
      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;
      dialog.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("clicking backdrop does not close when persistent", async () => {
      const wrapper = mountDrawer({ modelValue: true, persistent: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;
      dialog.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("ESC (cancel event) closes when not persistent", async () => {
      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;
      const cancelEvent = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(cancelEvent);
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("ESC (cancel event) is prevented and does not close when persistent", async () => {
      const wrapper = mountDrawer({ modelValue: true, persistent: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;
      const cancelEvent = new Event("cancel", { cancelable: true });
      const prevented = !dialog.dispatchEvent(cancelEvent);

      expect(prevented).toBe(true);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("re-opens via showModal when closed natively while persistent", async () => {
      mountDrawer({ modelValue: true, persistent: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;
      vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();
      dialog.dispatchEvent(new Event("close"));
      await nextTick();

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it("close button in default header emits close and update:modelValue(false)", async () => {
      const wrapper = mountDrawer({ modelValue: true, title: "Nav" });
      await nextTick();

      const closeBtn = bodyQuery(".danx-drawer__close") as HTMLElement;
      closeBtn.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Body scroll lock", () => {
    it("locks body scroll while open", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll on close", async () => {
      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      await wrapper.setProps({ modelValue: false });
      await nextTick();

      expect(document.body.style.overflow).toBe("");
    });

    it("restores body scroll on unmount while open", async () => {
      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      wrapper.unmount();
      wrappers.length = 0;

      expect(document.body.style.overflow).toBe("");
    });

    it("keeps scroll locked while any of multiple drawers remain open", async () => {
      const a = mountDrawer({ modelValue: true });
      const b = mountDrawer({ modelValue: true });
      await nextTick();

      await a.setProps({ modelValue: false });
      await nextTick();

      expect(document.body.style.overflow).toBe("hidden");

      await b.setProps({ modelValue: false });
      await nextTick();

      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Focus management", () => {
    it("restores focus to the trigger element on close", async () => {
      const trigger = document.createElement("button");
      document.body.appendChild(trigger);
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      await wrapper.setProps({ modelValue: false });
      await nextTick();

      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });

    it("does not throw restoring focus when no trigger element existed", async () => {
      document.body.focus();
      const wrapper = mountDrawer({ modelValue: true });
      await nextTick();

      await expect(wrapper.setProps({ modelValue: false })).resolves.not.toThrow();
    });
  });

  describe("Event propagation isolation", () => {
    it("stops propagation for all isolated event types", async () => {
      mountDrawer({ modelValue: true });
      await nextTick();

      const dialog = bodyQuery("dialog.danx-drawer") as HTMLElement;

      // All event types that have .stop modifier on the dialog element
      const isolatedEvents = [
        "wheel",
        "keydown",
        "keyup",
        "keypress",
        "mousedown",
        "mousemove",
        "mouseup",
        "pointerdown",
        "pointermove",
        "pointerup",
        "touchstart",
        "touchmove",
        "touchend",
        "contextmenu",
      ];

      for (const eventType of isolatedEvents) {
        const parentSpy = vi.fn();
        dialog.parentElement!.addEventListener(eventType, parentSpy);

        const event = new Event(eventType, { bubbles: true });
        dialog.dispatchEvent(event);

        expect(parentSpy).not.toHaveBeenCalled();
        dialog.parentElement!.removeEventListener(eventType, parentSpy);
      }
    });
  });
});
