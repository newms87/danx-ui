import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxDialog from "../DanxDialog.vue";
import { useDialogStack } from "../useDialogStack";

/**
 * DanxDialog uses <Teleport to="body">, so teleported content renders in
 * document.body, not inside the wrapper element. We use document.body
 * queries for DOM assertions and the wrapper for event assertions.
 */

const wrappers: VueWrapper[] = [];

function mountDialog(props: Record<string, unknown>, slots?: Record<string, string>) {
  const wrapper = mount(DanxDialog, { props, slots });
  wrappers.push(wrapper);
  return wrapper;
}

/** Query the teleported dialog content in document.body */
function bodyQuery(selector: string): Element | null {
  return document.body.querySelector(selector);
}

function bodyQueryAll(selector: string): NodeListOf<Element> {
  return document.body.querySelectorAll(selector);
}

// Mock HTMLDialogElement.showModal() since happy-dom doesn't support it
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  useDialogStack().reset();
});

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("DanxDialog", () => {
  describe("Rendering", () => {
    it("renders when modelValue is true", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery("dialog")).not.toBeNull();
    });

    it("does not render when modelValue is false", () => {
      mountDialog({ modelValue: false });

      expect(bodyQuery("dialog")).toBeNull();
    });

    it("renders title prop", async () => {
      mountDialog({ modelValue: true, title: "Test Title" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__title")?.textContent).toBe("Test Title");
    });

    it("renders subtitle prop", async () => {
      mountDialog({ modelValue: true, subtitle: "Test Subtitle" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__subtitle")?.textContent).toBe("Test Subtitle");
    });

    it("renders default slot content", async () => {
      mountDialog({ modelValue: true }, { default: "Dialog content here" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__content")?.textContent).toBe("Dialog content here");
    });
  });

  describe("Sizing", () => {
    it("width as number converts to vw units", async () => {
      mountDialog({ modelValue: true, width: 80 });
      await nextTick();

      const box = bodyQuery(".danx-dialog__box") as HTMLElement;
      expect(box?.style.width).toBe("80vw");
    });

    it("height as number converts to vh units", async () => {
      mountDialog({ modelValue: true, height: 60 });
      await nextTick();

      const box = bodyQuery(".danx-dialog__box") as HTMLElement;
      expect(box?.style.height).toBe("60vh");
    });

    it("width as string passes through unchanged", async () => {
      mountDialog({ modelValue: true, width: "400px" });
      await nextTick();

      const box = bodyQuery(".danx-dialog__box") as HTMLElement;
      expect(box?.style.width).toBe("400px");
    });

    it("height as string passes through unchanged", async () => {
      mountDialog({ modelValue: true, height: "30rem" });
      await nextTick();

      const box = bodyQuery(".danx-dialog__box") as HTMLElement;
      expect(box?.style.height).toBe("30rem");
    });
  });

  describe("Buttons", () => {
    it("close button hidden by default", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__button--secondary")).toBeNull();
    });

    it("close button shows when closeButton=true", async () => {
      mountDialog({ modelValue: true, closeButton: true });
      await nextTick();

      const closeBtn = bodyQuery(".danx-dialog__button--secondary");
      expect(closeBtn).not.toBeNull();
      expect(closeBtn?.textContent).toBe("Close");
    });

    it("close button shows custom text when closeButton is a string", async () => {
      mountDialog({ modelValue: true, closeButton: "Cancel" });
      await nextTick();

      const closeBtn = bodyQuery(".danx-dialog__button--secondary");
      expect(closeBtn?.textContent).toBe("Cancel");
    });

    it("confirm button hidden by default", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__button--primary")).toBeNull();
    });

    it("confirm button shows when confirmButton=true", async () => {
      mountDialog({ modelValue: true, confirmButton: true });
      await nextTick();

      const confirmBtn = bodyQuery(".danx-dialog__button--primary");
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn?.textContent).toBe("Confirm");
    });

    it("confirm button shows custom text when confirmButton is a string", async () => {
      mountDialog({ modelValue: true, confirmButton: "Delete" });
      await nextTick();

      const confirmBtn = bodyQuery(".danx-dialog__button--primary");
      expect(confirmBtn?.textContent).toBe("Delete");
    });

    it("confirm button disabled when disabled=true", async () => {
      mountDialog({ modelValue: true, confirmButton: true, disabled: true });
      await nextTick();

      const confirmBtn = bodyQuery(".danx-dialog__button--primary");
      expect(confirmBtn?.hasAttribute("disabled")).toBe(true);
    });

    it("confirm button shows loading state when isSaving=true", async () => {
      mountDialog({ modelValue: true, confirmButton: true, isSaving: true });
      await nextTick();

      const confirmBtn = bodyQuery(".danx-dialog__button--primary");
      expect(confirmBtn?.hasAttribute("disabled")).toBe(true);
      expect(bodyQuery(".danx-button__spinner")).not.toBeNull();
    });
  });

  describe("Close X Button", () => {
    it("close X button hidden by default", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__close-x")).toBeNull();
    });

    it("close X button shows when closeX=true", async () => {
      mountDialog({ modelValue: true, closeX: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__close-x")).not.toBeNull();
    });

    it("close X button is inside wrapper and outside box", async () => {
      mountDialog({ modelValue: true, closeX: true });
      await nextTick();

      const wrapperEl = bodyQuery(".danx-dialog__wrapper");
      expect(wrapperEl).not.toBeNull();

      // Close-x is a direct child of wrapper, sibling to box
      const closeX = wrapperEl?.querySelector(":scope > .danx-dialog__close-x");
      expect(closeX).not.toBeNull();

      // Close-x is NOT inside the box
      const box = wrapperEl?.querySelector(".danx-dialog__box");
      expect(box?.querySelector(".danx-dialog__close-x")).toBeNull();
    });

    it("close X button emits update:modelValue(false) when clicked", async () => {
      const wrapper = mountDialog({ modelValue: true, closeX: true });
      await nextTick();

      const closeX = bodyQuery(".danx-dialog__close-x") as HTMLElement;
      closeX.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("close X button emits close event when clicked", async () => {
      const wrapper = mountDialog({ modelValue: true, closeX: true });
      await nextTick();

      const closeX = bodyQuery(".danx-dialog__close-x") as HTMLElement;
      closeX.click();
      await nextTick();

      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Events", () => {
    it("emits update:modelValue(false) when close button clicked", async () => {
      const wrapper = mountDialog({ modelValue: true, closeButton: true });
      await nextTick();

      const closeBtn = bodyQuery(".danx-dialog__button--secondary") as HTMLElement;
      closeBtn.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("emits close event when close button clicked", async () => {
      const wrapper = mountDialog({ modelValue: true, closeButton: true });
      await nextTick();

      const closeBtn = bodyQuery(".danx-dialog__button--secondary") as HTMLElement;
      closeBtn.click();
      await nextTick();

      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits confirm event when confirm button clicked", async () => {
      const wrapper = mountDialog({ modelValue: true, confirmButton: true });
      await nextTick();

      const confirmBtn = bodyQuery(".danx-dialog__button--primary") as HTMLElement;
      confirmBtn.click();
      await nextTick();

      expect(wrapper.emitted("confirm")).toHaveLength(1);
    });

    it("emits update:modelValue(false) on backdrop click (non-persistent)", async () => {
      const wrapper = mountDialog({ modelValue: true });
      await nextTick();

      // Click directly on dialog element (backdrop area) - @click.self only fires for direct clicks
      const dialog = bodyQuery("dialog") as HTMLElement;
      dialog.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("does NOT emit on backdrop click when persistent=true", async () => {
      const wrapper = mountDialog({ modelValue: true, persistent: true });
      await nextTick();

      const dialog = bodyQuery("dialog") as HTMLElement;
      dialog.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does NOT close on backdrop click when clicking inside content", async () => {
      const wrapper = mountDialog(
        { modelValue: true },
        { default: '<div class="inner">Content</div>' }
      );
      await nextTick();

      // Click on the box content, not the dialog backdrop
      const box = bodyQuery(".danx-dialog__box") as HTMLElement;
      box.click();
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("re-opens dialog on native close event when persistent=true", async () => {
      mountDialog({ modelValue: true, persistent: true });
      await nextTick();

      // Simulate native close event (as if ESC bypassed our handler)
      const dialog = bodyQuery("dialog") as HTMLElement;
      dialog.dispatchEvent(new Event("close"));
      await nextTick();

      // showModal should be called again to re-open
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it("does not re-open on native close event when not persistent", async () => {
      const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, "showModal");

      mountDialog({ modelValue: true });
      await nextTick();

      // Clear the spy count from initial mount
      showModalSpy.mockClear();

      const dialog = bodyQuery("dialog") as HTMLElement;
      dialog.dispatchEvent(new Event("close"));
      await nextTick();

      // showModal should NOT be called again since not persistent
      expect(showModalSpy).not.toHaveBeenCalled();
    });
  });

  describe("Slots", () => {
    it("renders title slot instead of title prop", async () => {
      mountDialog(
        { modelValue: true, title: "Prop Title" },
        { title: '<span class="custom-title">Slot Title</span>' }
      );
      await nextTick();

      expect(bodyQuery(".danx-dialog__title")?.textContent).toBe("Slot Title");
      expect(bodyQuery(".custom-title")).not.toBeNull();
    });

    it("renders subtitle slot instead of subtitle prop", async () => {
      mountDialog(
        { modelValue: true, subtitle: "Prop Subtitle" },
        { subtitle: '<span class="custom-subtitle">Slot Subtitle</span>' }
      );
      await nextTick();

      expect(bodyQuery(".danx-dialog__subtitle")?.textContent).toBe("Slot Subtitle");
      expect(bodyQuery(".custom-subtitle")).not.toBeNull();
    });

    it("renders actions slot replacing footer", async () => {
      mountDialog(
        { modelValue: true, closeButton: true, confirmButton: true },
        { actions: '<button class="custom-action">Custom Action</button>' }
      );
      await nextTick();

      expect(bodyQuery(".custom-action")).not.toBeNull();
      // Default buttons should not render when actions slot is provided
      expect(bodyQuery(".danx-dialog__button--secondary")).toBeNull();
      expect(bodyQuery(".danx-dialog__button--primary")).toBeNull();
    });

    it("renders close-button slot replacing close button", async () => {
      mountDialog(
        { modelValue: true, closeButton: true },
        { "close-button": '<button class="custom-close">X</button>' }
      );
      await nextTick();

      expect(bodyQuery(".custom-close")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__button--secondary")).toBeNull();
    });

    it("renders confirm-button slot replacing confirm button", async () => {
      mountDialog(
        { modelValue: true, confirmButton: true },
        { "confirm-button": '<button class="custom-confirm">OK</button>' }
      );
      await nextTick();

      expect(bodyQuery(".custom-confirm")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__button--primary")).toBeNull();
    });
  });

  describe("ESC key handling", () => {
    it("closes on ESC key via cancel event (non-persistent)", async () => {
      const wrapper = mountDialog({ modelValue: true });
      await nextTick();

      const dialog = bodyQuery("dialog") as HTMLElement;
      dialog.dispatchEvent(new Event("cancel"));
      await nextTick();

      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("prevents ESC close when persistent=true", async () => {
      const wrapper = mountDialog({ modelValue: true, persistent: true });
      await nextTick();

      const dialog = bodyQuery("dialog") as HTMLElement;
      const cancelEvent = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(cancelEvent);
      await nextTick();

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(wrapper.emitted("close")).toBeUndefined();
    });
  });

  describe("showModal integration", () => {
    it("calls showModal when dialog becomes visible", async () => {
      const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, "showModal");

      const wrapper = mountDialog({ modelValue: false });

      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(showModalSpy).toHaveBeenCalled();
    });
  });

  describe("Header rendering", () => {
    it("does not render header when no title, subtitle, or slots", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__header")).toBeNull();
    });

    it("renders header with title slot only", async () => {
      mountDialog({ modelValue: true }, { title: "Slot Title" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__header")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__title")).not.toBeNull();
    });

    it("renders header with subtitle slot only", async () => {
      mountDialog({ modelValue: true }, { subtitle: "Slot Subtitle" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__header")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__subtitle")).not.toBeNull();
    });

    it("renders title element when title prop is set", async () => {
      mountDialog({ modelValue: true, title: "Title Only" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__title")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__subtitle")).toBeNull();
    });

    it("renders subtitle element when subtitle prop is set", async () => {
      mountDialog({ modelValue: true, subtitle: "Subtitle Only" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__subtitle")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__title")).toBeNull();
    });

    it("renders both title and subtitle when both props are set", async () => {
      mountDialog({ modelValue: true, title: "Title", subtitle: "Subtitle" });
      await nextTick();

      expect(bodyQuery(".danx-dialog__header")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__title")?.textContent).toBe("Title");
      expect(bodyQuery(".danx-dialog__subtitle")?.textContent).toBe("Subtitle");
    });
  });

  describe("Footer rendering", () => {
    it("does not render footer when no buttons or actions slot", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__footer")).toBeNull();
    });

    it("renders both close and confirm buttons when both props are set", async () => {
      mountDialog({ modelValue: true, closeButton: true, confirmButton: true });
      await nextTick();

      expect(bodyQuery(".danx-dialog__footer")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__button--secondary")).not.toBeNull();
      expect(bodyQuery(".danx-dialog__button--primary")).not.toBeNull();
    });

    it("renders footer when actions slot is provided without button props", async () => {
      mountDialog({ modelValue: true }, { actions: '<button class="custom">Action</button>' });
      await nextTick();

      expect(bodyQuery(".danx-dialog__footer")).not.toBeNull();
      expect(bodyQuery(".custom")).not.toBeNull();
    });
  });

  describe("Dialog Stack Integration", () => {
    it("registers with stack when opened with a title", async () => {
      const { stack } = useDialogStack();
      mountDialog({ modelValue: true, title: "Test Dialog" });
      await nextTick();

      expect(stack.value).toHaveLength(1);
      expect(stack.value[0]!.title()).toBe("Test Dialog");
    });

    it("does not register when opened without a title", async () => {
      const { stack } = useDialogStack();
      mountDialog({ modelValue: true });
      await nextTick();

      expect(stack.value).toHaveLength(0);
    });

    it("does not register when independent=true", async () => {
      const { stack } = useDialogStack();
      mountDialog({ modelValue: true, title: "Independent", independent: true });
      await nextTick();

      expect(stack.value).toHaveLength(0);
    });

    it("unregisters when closed", async () => {
      const { stack } = useDialogStack();
      const wrapper = mountDialog({ modelValue: true, title: "Test" });
      await nextTick();
      expect(stack.value).toHaveLength(1);

      await wrapper.setProps({ modelValue: false });
      await nextTick();
      expect(stack.value).toHaveLength(0);
    });

    it("unregisters on unmount (safety net)", async () => {
      const { stack } = useDialogStack();
      const wrapper = mountDialog({ modelValue: true, title: "Test" });
      await nextTick();
      expect(stack.value).toHaveLength(1);

      wrapper.unmount();
      // Remove from cleanup array since we manually unmounted
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      expect(stack.value).toHaveLength(0);
    });

    it("applies danx-dialog--stacked class when not top of stack", async () => {
      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick(); // Extra tick for stack registration in watcher

      mountDialog({ modelValue: true, title: "Second" });
      await nextTick();
      await nextTick(); // Extra tick for stack registration + reactivity propagation

      const dialogs = bodyQueryAll("dialog");
      expect(dialogs[0]!.classList.contains("danx-dialog--stacked")).toBe(true);
    });

    it("does not apply stacked class to top-of-stack dialog", async () => {
      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick();

      mountDialog({ modelValue: true, title: "Second" });
      await nextTick();
      await nextTick();

      const dialogs = bodyQueryAll("dialog");
      expect(dialogs[1]!.classList.contains("danx-dialog--stacked")).toBe(false);
    });

    it("shows breadcrumbs when stack has multiple entries and dialog is top", async () => {
      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick();

      mountDialog({ modelValue: true, title: "Second" });
      await nextTick();
      await nextTick();

      // Breadcrumbs should appear in the second (top) dialog
      const dialogs = bodyQueryAll("dialog");
      expect(dialogs[1]!.querySelector(".dialog-breadcrumbs")).not.toBeNull();
    });

    it("does not show breadcrumbs for a single dialog", async () => {
      mountDialog({ modelValue: true, title: "Only" });
      await nextTick();

      expect(bodyQuery(".dialog-breadcrumbs")).toBeNull();
    });

    it("does not show breadcrumbs on non-top-of-stack dialog", async () => {
      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick();

      mountDialog({ modelValue: true, title: "Second" });
      await nextTick();
      await nextTick();

      // First dialog (stacked) should NOT have breadcrumbs
      const dialogs = bodyQueryAll("dialog");
      expect(dialogs[0]!.querySelector(".dialog-breadcrumbs")).toBeNull();
    });

    it("does not register when both title and independent=true are set", async () => {
      const { stack } = useDialogStack();
      mountDialog({ modelValue: true, title: "Has Title", independent: true });
      await nextTick();

      expect(stack.value).toHaveLength(0);
    });

    it("re-opening a dialog after closing registers a fresh stack entry", async () => {
      const { stack } = useDialogStack();
      const wrapper = mountDialog({ modelValue: true, title: "Reopen Test" });
      await nextTick();
      const firstId = stack.value[0]!.id;

      await wrapper.setProps({ modelValue: false });
      await nextTick();
      expect(stack.value).toHaveLength(0);

      await wrapper.setProps({ modelValue: true });
      await nextTick();
      expect(stack.value).toHaveLength(1);
      expect(stack.value[0]!.id).not.toBe(firstId);
    });

    it("stack entry title tracks reactive prop changes", async () => {
      const { stack } = useDialogStack();
      const wrapper = mountDialog({ modelValue: true, title: "Original" });
      await nextTick();
      expect(stack.value[0]!.title()).toBe("Original");

      await wrapper.setProps({ title: "Changed" });
      expect(stack.value[0]!.title()).toBe("Changed");
    });

    it("returnOnClose=false tears down entire stack", async () => {
      const { stack } = useDialogStack();

      // Open two stacked dialogs, second has returnOnClose=false
      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick();

      const wrapper2 = mountDialog({
        modelValue: true,
        title: "Second",
        returnOnClose: false,
        closeButton: true,
      });
      await nextTick();
      await nextTick();
      expect(stack.value).toHaveLength(2);

      // Close the second dialog via close button
      const closeBtn = bodyQueryAll(".danx-dialog__button--secondary");
      const lastCloseBtn = closeBtn[closeBtn.length - 1] as HTMLElement;
      lastCloseBtn.click();
      await nextTick();
      await nextTick();

      // Entire stack should be torn down
      expect(stack.value).toHaveLength(0);
      expect(wrapper2.emitted("close")).toHaveLength(1);
    });

    it("returnOnClose=true (default) only closes current dialog", async () => {
      const { stack } = useDialogStack();

      mountDialog({ modelValue: true, title: "First" });
      await nextTick();
      await nextTick();

      const wrapper2 = mountDialog({
        modelValue: true,
        title: "Second",
        closeButton: true,
      });
      await nextTick();
      await nextTick();
      expect(stack.value).toHaveLength(2);

      // Close the second dialog
      const closeBtn = bodyQueryAll(".danx-dialog__button--secondary");
      const lastCloseBtn = closeBtn[closeBtn.length - 1] as HTMLElement;
      lastCloseBtn.click();
      await nextTick();
      await nextTick();

      // Only the second dialog should be closed; first remains
      expect(stack.value).toHaveLength(1);
      expect(stack.value[0]!.title()).toBe("First");
      expect(wrapper2.emitted("close")).toHaveLength(1);
    });
  });

  describe("Event propagation isolation", () => {
    it("stops propagation for all isolated event types", async () => {
      mountDialog({ modelValue: true });
      await nextTick();

      const dialog = bodyQuery("dialog") as HTMLElement;

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
