import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxDialog from "../DanxDialog.vue";

// Mock HTMLDialogElement.showModal() since happy-dom doesn't support it
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("DanxDialog", () => {
  describe("Rendering", () => {
    it("renders when modelValue is true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find("dialog").exists()).toBe(true);
    });

    it("does not render when modelValue is false", () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: false },
      });

      expect(wrapper.find("dialog").exists()).toBe(false);
    });

    it("renders title prop", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, title: "Test Title" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__title").text()).toBe("Test Title");
    });

    it("renders subtitle prop", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, subtitle: "Test Subtitle" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__subtitle").text()).toBe("Test Subtitle");
    });

    it("renders default slot content", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
        slots: { default: "Dialog content here" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__content").text()).toBe("Dialog content here");
    });
  });

  describe("Sizing", () => {
    it("width as number converts to vw units", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, width: 80 },
      });
      await nextTick();

      const box = wrapper.find(".danx-dialog__box");
      expect(box.attributes("style")).toContain("width: 80vw");
    });

    it("height as number converts to vh units", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, height: 60 },
      });
      await nextTick();

      const box = wrapper.find(".danx-dialog__box");
      expect(box.attributes("style")).toContain("height: 60vh");
    });

    it("width as string passes through unchanged", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, width: "400px" },
      });
      await nextTick();

      const box = wrapper.find(".danx-dialog__box");
      expect(box.attributes("style")).toContain("width: 400px");
    });

    it("height as string passes through unchanged", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, height: "30rem" },
      });
      await nextTick();

      const box = wrapper.find(".danx-dialog__box");
      expect(box.attributes("style")).toContain("height: 30rem");
    });
  });

  describe("Buttons", () => {
    it("close button hidden by default", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__button--secondary").exists()).toBe(false);
    });

    it("close button shows when closeButton=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: true },
      });
      await nextTick();

      const closeBtn = wrapper.find(".danx-dialog__button--secondary");
      expect(closeBtn.exists()).toBe(true);
      expect(closeBtn.text()).toBe("Close");
    });

    it("close button shows custom text when closeButton is a string", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: "Cancel" },
      });
      await nextTick();

      const closeBtn = wrapper.find(".danx-dialog__button--secondary");
      expect(closeBtn.text()).toBe("Cancel");
    });

    it("confirm button hidden by default", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__button--primary").exists()).toBe(false);
    });

    it("confirm button shows when confirmButton=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: true },
      });
      await nextTick();

      const confirmBtn = wrapper.find(".danx-dialog__button--primary");
      expect(confirmBtn.exists()).toBe(true);
      expect(confirmBtn.text()).toBe("Confirm");
    });

    it("confirm button shows custom text when confirmButton is a string", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: "Delete" },
      });
      await nextTick();

      const confirmBtn = wrapper.find(".danx-dialog__button--primary");
      expect(confirmBtn.text()).toBe("Delete");
    });

    it("confirm button disabled when disabled=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: true, disabled: true },
      });
      await nextTick();

      const confirmBtn = wrapper.find(".danx-dialog__button--primary");
      expect(confirmBtn.attributes("disabled")).toBeDefined();
    });

    it("confirm button shows loading state when isSaving=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: true, isSaving: true },
      });
      await nextTick();

      const confirmBtn = wrapper.find(".danx-dialog__button--primary");
      expect(confirmBtn.attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });
  });

  describe("Close X Button", () => {
    it("close X button hidden by default", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__close-x").exists()).toBe(false);
    });

    it("close X button shows when closeX=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeX: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__close-x").exists()).toBe(true);
    });

    it("close X button emits update:modelValue(false) when clicked", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeX: true },
      });
      await nextTick();

      await wrapper.find(".danx-dialog__close-x").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("close X button emits close event when clicked", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeX: true },
      });
      await nextTick();

      await wrapper.find(".danx-dialog__close-x").trigger("click");

      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Events", () => {
    it("emits update:modelValue(false) when close button clicked", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: true },
      });
      await nextTick();

      await wrapper.find(".danx-dialog__button--secondary").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("emits close event when close button clicked", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: true },
      });
      await nextTick();

      await wrapper.find(".danx-dialog__button--secondary").trigger("click");

      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits confirm event when confirm button clicked", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: true },
      });
      await nextTick();

      await wrapper.find(".danx-dialog__button--primary").trigger("click");

      expect(wrapper.emitted("confirm")).toHaveLength(1);
    });

    it("emits update:modelValue(false) on backdrop click (non-persistent)", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      // Click directly on dialog element (backdrop area) - @click.self only fires for direct clicks
      const dialog = wrapper.find("dialog");
      await dialog.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("does NOT emit on backdrop click when persistent=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, persistent: true },
      });
      await nextTick();

      const dialog = wrapper.find("dialog");
      await dialog.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does NOT close on backdrop click when clicking inside content", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
        slots: { default: '<div class="inner">Content</div>' },
      });
      await nextTick();

      // Click on the inner content, not the dialog backdrop
      await wrapper.find(".danx-dialog__box").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("re-opens dialog on native close event when persistent=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, persistent: true },
      });
      await nextTick();

      // Simulate native close event (as if ESC bypassed our handler)
      const dialog = wrapper.find("dialog");
      await dialog.trigger("close");
      await nextTick();

      // showModal should be called again to re-open
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });
  });

  describe("Slots", () => {
    it("renders title slot instead of title prop", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, title: "Prop Title" },
        slots: { title: '<span class="custom-title">Slot Title</span>' },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__title").text()).toBe("Slot Title");
      expect(wrapper.find(".custom-title").exists()).toBe(true);
    });

    it("renders subtitle slot instead of subtitle prop", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, subtitle: "Prop Subtitle" },
        slots: { subtitle: '<span class="custom-subtitle">Slot Subtitle</span>' },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__subtitle").text()).toBe("Slot Subtitle");
      expect(wrapper.find(".custom-subtitle").exists()).toBe(true);
    });

    it("renders actions slot replacing footer", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: true, confirmButton: true },
        slots: { actions: '<button class="custom-action">Custom Action</button>' },
      });
      await nextTick();

      expect(wrapper.find(".custom-action").exists()).toBe(true);
      // Default buttons should not render when actions slot is provided
      expect(wrapper.find(".danx-dialog__button--secondary").exists()).toBe(false);
      expect(wrapper.find(".danx-dialog__button--primary").exists()).toBe(false);
    });

    it("renders close-button slot replacing close button", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, closeButton: true },
        slots: { "close-button": '<button class="custom-close">X</button>' },
      });
      await nextTick();

      expect(wrapper.find(".custom-close").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__button--secondary").exists()).toBe(false);
    });

    it("renders confirm-button slot replacing confirm button", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, confirmButton: true },
        slots: { "confirm-button": '<button class="custom-confirm">OK</button>' },
      });
      await nextTick();

      expect(wrapper.find(".custom-confirm").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__button--primary").exists()).toBe(false);
    });
  });

  describe("ESC key handling", () => {
    it("closes on ESC key via cancel event (non-persistent)", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      const dialog = wrapper.find("dialog");
      await dialog.trigger("cancel");

      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("prevents ESC close when persistent=true", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, persistent: true },
      });
      await nextTick();

      const dialog = wrapper.find("dialog");
      const cancelEvent = new Event("cancel", { cancelable: true });
      dialog.element.dispatchEvent(cancelEvent);
      await nextTick();

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(wrapper.emitted("close")).toBeUndefined();
    });
  });

  describe("showModal integration", () => {
    it("calls showModal when dialog becomes visible", async () => {
      const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, "showModal");

      const wrapper = mount(DanxDialog, {
        props: { modelValue: false },
      });

      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(showModalSpy).toHaveBeenCalled();
    });
  });

  describe("Header rendering", () => {
    it("does not render header when no title, subtitle, or slots", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__header").exists()).toBe(false);
    });

    it("renders header with title slot only", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
        slots: { title: "Slot Title" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__header").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__title").exists()).toBe(true);
    });

    it("renders header with subtitle slot only", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
        slots: { subtitle: "Slot Subtitle" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__header").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__subtitle").exists()).toBe(true);
    });

    it("renders title element when title prop is set", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, title: "Title Only" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__title").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__subtitle").exists()).toBe(false);
    });

    it("renders subtitle element when subtitle prop is set", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true, subtitle: "Subtitle Only" },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__subtitle").exists()).toBe(true);
      expect(wrapper.find(".danx-dialog__title").exists()).toBe(false);
    });
  });

  describe("Footer rendering", () => {
    it("does not render footer when no buttons or actions slot", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__footer").exists()).toBe(false);
    });

    it("renders footer when actions slot is provided without button props", async () => {
      const wrapper = mount(DanxDialog, {
        props: { modelValue: true },
        slots: { actions: '<button class="custom">Action</button>' },
      });
      await nextTick();

      expect(wrapper.find(".danx-dialog__footer").exists()).toBe(true);
      expect(wrapper.find(".custom").exists()).toBe(true);
    });
  });
});
