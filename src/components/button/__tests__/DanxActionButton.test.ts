import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, markRaw, defineComponent, h } from "vue";
import DanxActionButton from "../DanxActionButton.vue";
import type { ResourceAction, ActionTargetItem } from "../action-types";

// Mock HTMLDialogElement for DanxDialog
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function createMockAction(overrides: Partial<ResourceAction> = {}): ResourceAction {
  return {
    isApplying: false,
    name: "test-action",
    trigger: vi.fn().mockResolvedValue("success-response"),
    ...overrides,
  };
}

describe("DanxActionButton", () => {
  describe("Rendering", () => {
    it("renders a DanxButton", () => {
      const wrapper = mount(DanxActionButton);

      expect(wrapper.find("button.danx-button").exists()).toBe(true);
    });

    it("passes through type prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { type: "danger" },
      });

      expect(wrapper.find("button").classes()).toContain("danx-button--danger");
    });

    it("passes through size prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { size: "lg" },
      });

      expect(wrapper.find("button").classes()).toContain("danx-button--lg");
    });

    it("passes through icon prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { icon: "save" },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(true);
    });

    it("passes through disabled prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { disabled: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("passes through tooltip prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { tooltip: "Click me" },
      });

      expect(wrapper.find("button").attributes("title")).toBe("Click me");
    });

    it("passes through slot content", () => {
      const wrapper = mount(DanxActionButton, {
        slots: { default: "Delete Item" },
      });

      expect(wrapper.text()).toContain("Delete Item");
    });

    it("passes through label prop to DanxButton", () => {
      const wrapper = mount(DanxActionButton, {
        props: { label: "Create" },
      });

      expect(wrapper.text()).toContain("Create");
    });

    it("slot content takes precedence over label prop", () => {
      const wrapper = mount(DanxActionButton, {
        props: { label: "From Prop" },
        slots: { default: "From Slot" },
      });

      expect(wrapper.text()).toContain("From Slot");
      expect(wrapper.text()).not.toContain("From Prop");
    });

    it("passes through component icon prop", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );

      const wrapper = mount(DanxActionButton, {
        props: { icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });
  });

  describe("Action triggering", () => {
    it("calls action.trigger with target and input on click", async () => {
      const action = createMockAction();
      const target: ActionTargetItem = { isSaving: false };
      const input = { name: "test" };

      const wrapper = mount(DanxActionButton, {
        props: { action, target, input },
      });

      await wrapper.find("button").trigger("click");
      await nextTick();

      expect(action.trigger).toHaveBeenCalledWith(target, input);
    });

    it("does nothing on click when no action provided", async () => {
      const wrapper = mount(DanxActionButton);

      await wrapper.find("button").trigger("click");
      await nextTick();

      expect(wrapper.emitted("success")).toBeUndefined();
      expect(wrapper.emitted("error")).toBeUndefined();
      expect(wrapper.emitted("always")).toBeUndefined();
    });

    it("does not trigger action when disabled", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, disabled: true },
      });

      await wrapper.find("button").trigger("click");

      expect(action.trigger).not.toHaveBeenCalled();
    });

    it("does not trigger action when saving is true", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, saving: true },
      });

      await wrapper.find("button").trigger("click");

      expect(action.trigger).not.toHaveBeenCalled();
    });

    it("calls action.trigger with null target when target is null", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, target: null },
      });

      await wrapper.find("button").trigger("click");
      await vi.waitFor(() => {
        expect(action.trigger).toHaveBeenCalledWith(null, undefined);
      });
    });

    it("calls action.trigger with undefined target and input when not provided", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      await wrapper.find("button").trigger("click");
      await vi.waitFor(() => {
        expect(action.trigger).toHaveBeenCalledWith(undefined, undefined);
      });
    });
  });

  describe("Loading state", () => {
    it("shows loading when saving prop is true", () => {
      const wrapper = mount(DanxActionButton, {
        props: { saving: true },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("shows loading when action.isApplying is true", () => {
      const action = createMockAction({ isApplying: true });

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("shows loading when target.isSaving is true", () => {
      const target: ActionTargetItem = { isSaving: true };

      const wrapper = mount(DanxActionButton, {
        props: { target },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("does not show loading when target is an array", () => {
      const targets: ActionTargetItem[] = [{ isSaving: true }];

      const wrapper = mount(DanxActionButton, {
        props: { target: targets },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("does not show loading when target.isSaving is false", () => {
      const target: ActionTargetItem = { isSaving: false };

      const wrapper = mount(DanxActionButton, {
        props: { target },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("does not show loading when target is null", () => {
      const wrapper = mount(DanxActionButton, {
        props: { target: null },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("does not show loading when target.isSaving is undefined", () => {
      const target: ActionTargetItem = {};

      const wrapper = mount(DanxActionButton, {
        props: { target },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("shows loading when multiple loading sources are true", () => {
      const action = createMockAction({ isApplying: true });

      const wrapper = mount(DanxActionButton, {
        props: { action, saving: true },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("does not show loading when no loading sources are active", () => {
      const action = createMockAction({ isApplying: false });

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits success event with response after action succeeds", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      await wrapper.find("button").trigger("click");
      // Wait for the promise to resolve
      await vi.waitFor(() => {
        expect(wrapper.emitted("success")).toHaveLength(1);
      });

      expect(wrapper.emitted("success")![0]).toEqual(["success-response"]);
    });

    it("emits error event when action fails", async () => {
      const error = new Error("Action failed");
      const action = createMockAction({
        trigger: vi.fn().mockRejectedValue(error),
      });

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      await wrapper.find("button").trigger("click");
      await vi.waitFor(() => {
        expect(wrapper.emitted("error")).toHaveLength(1);
      });

      expect(wrapper.emitted("error")![0]).toEqual([error]);
    });

    it("emits always event after action succeeds", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      await wrapper.find("button").trigger("click");
      await vi.waitFor(() => {
        expect(wrapper.emitted("always")).toHaveLength(1);
      });
    });

    it("emits always event after action fails", async () => {
      const action = createMockAction({
        trigger: vi.fn().mockRejectedValue(new Error("fail")),
      });

      const wrapper = mount(DanxActionButton, {
        props: { action },
      });

      await wrapper.find("button").trigger("click");
      await vi.waitFor(() => {
        expect(wrapper.emitted("always")).toHaveLength(1);
      });
    });
  });

  describe("Confirmation", () => {
    it("shows confirmation dialog instead of triggering action when confirm=true", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true },
      });

      await wrapper.find("button").trigger("click");
      await nextTick();

      // Action should NOT be triggered yet
      expect(action.trigger).not.toHaveBeenCalled();

      // Confirmation dialog should be visible
      expect(wrapper.find("dialog").exists()).toBe(true);
    });

    it("displays custom confirmText in dialog", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true, confirmText: "Delete this item?" },
      });

      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-dialog__content").text()).toBe("Delete this item?");
    });

    it("triggers action when confirmation is confirmed", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true },
      });

      // Open confirmation
      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();

      // Click confirm button in dialog
      await wrapper.find(".danx-dialog__button--primary").trigger("click");
      await nextTick();

      expect(action.trigger).toHaveBeenCalled();
    });

    it("closes dialog after confirmation", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true },
      });

      // Open confirmation
      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();
      expect(wrapper.find("dialog").exists()).toBe(true);

      // Confirm
      await wrapper.find(".danx-dialog__button--primary").trigger("click");
      await vi.waitFor(() => {
        expect(wrapper.find("dialog").exists()).toBe(false);
      });
    });

    it("does not trigger action when confirmation is cancelled", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true },
      });

      // Open confirmation
      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();

      // Click close button in dialog
      await wrapper.find(".danx-dialog__button--secondary").trigger("click");
      await nextTick();

      expect(action.trigger).not.toHaveBeenCalled();
    });

    it("passes target and input through to action.trigger after confirmation", async () => {
      const action = createMockAction();
      const target: ActionTargetItem = { isSaving: false };
      const input = { key: "value" };

      const wrapper = mount(DanxActionButton, {
        props: { action, target, input, confirm: true },
      });

      // Open confirmation
      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();

      // Confirm
      await wrapper.find(".danx-dialog__button--primary").trigger("click");
      await vi.waitFor(() => {
        expect(action.trigger).toHaveBeenCalledWith(target, input);
      });
    });

    it("does not render dialog when confirm is false", () => {
      const wrapper = mount(DanxActionButton, {
        props: { confirm: false },
      });

      expect(wrapper.find("dialog").exists()).toBe(false);
    });

    it("uses default confirmText when not specified", async () => {
      const action = createMockAction();

      const wrapper = mount(DanxActionButton, {
        props: { action, confirm: true },
      });

      await wrapper.find("button.danx-button").trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-dialog__content").text()).toBe("Are you sure?");
    });
  });
});
