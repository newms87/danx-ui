import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ContextMenu from "../ContextMenu.vue";
import { ContextMenuItem } from "../types";

function createItem(overrides: Partial<ContextMenuItem> = {}): ContextMenuItem {
  return {
    id: "item-1",
    label: "Test Item",
    ...overrides,
  };
}

describe("ContextMenu", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  function mountMenu(items: ContextMenuItem[] = [], position = { x: 100, y: 200 }) {
    wrapper = mount(ContextMenu, {
      props: { items, position },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders overlay", () => {
      mountMenu();
      expect(wrapper.find(".dx-context-menu-overlay").exists()).toBe(true);
    });

    it("renders menu items", () => {
      mountMenu([createItem({ label: "Cut" }), createItem({ id: "item-2", label: "Copy" })]);
      const items = wrapper.findAll(".context-menu-item");
      expect(items.length).toBe(2);
      expect(items[0]!.find(".item-label").text()).toBe("Cut");
      expect(items[1]!.find(".item-label").text()).toBe("Copy");
    });

    it("renders dividers", () => {
      mountMenu([
        createItem(),
        createItem({ id: "div", divider: true }),
        createItem({ id: "item-2" }),
      ]);
      expect(wrapper.findAll(".context-menu-divider").length).toBe(1);
    });

    it("shows shortcut text", () => {
      mountMenu([createItem({ shortcut: "Ctrl+C" })]);
      expect(wrapper.find(".item-shortcut").text()).toBe("Ctrl+C");
    });

    it("shows disabled state", () => {
      mountMenu([createItem({ disabled: true })]);
      expect(wrapper.find(".context-menu-item.disabled").exists()).toBe(true);
    });

    it("shows chevron for items with children", () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);
      expect(wrapper.find(".item-chevron").exists()).toBe(true);
    });

    it("does not show shortcut for items with children", () => {
      mountMenu([
        createItem({
          shortcut: "Ctrl+X",
          children: [createItem({ id: "child-1" })],
        }),
      ]);
      expect(wrapper.find(".item-shortcut").exists()).toBe(false);
    });
  });

  describe("menu positioning", () => {
    it("positions at given coordinates", () => {
      mountMenu([], { x: 150, y: 250 });
      const style = wrapper.find(".dx-context-menu").attributes("style");
      expect(style).toContain("top: 250px");
      expect(style).toContain("left: 150px");
    });

    it("constrains to left edge", () => {
      mountMenu([], { x: -50, y: 200 });
      const style = wrapper.find(".dx-context-menu").attributes("style");
      expect(style).toContain("left: 10px");
    });
  });

  describe("item click", () => {
    it("calls action and emits close on item click", async () => {
      const action = vi.fn();
      mountMenu([createItem({ action })]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(action).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toHaveLength(1);
    });

    it("does not call action on disabled item", async () => {
      const action = vi.fn();
      mountMenu([createItem({ action, disabled: true })]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(action).not.toHaveBeenCalled();
    });

    it("returns early from onItemClick when item is disabled", async () => {
      mountMenu([createItem({ id: "disabled-no-action", label: "Disabled", disabled: true })]);

      // Remove the disabled attribute so the click event actually fires through to onItemClick,
      // allowing the `if (item.disabled) return` guard on line 111 to execute
      const btn = wrapper.find(".context-menu-item");
      btn.element.removeAttribute("disabled");
      await btn.trigger("click");

      // The disabled guard returns early, so no close or action events are emitted
      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("toggles submenu on parent item click instead of closing", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      // Should not close, but toggle submenu
      expect(wrapper.emitted("close")).toBeUndefined();
      // Submenu should be visible
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);
    });

    it("emits close without calling action when item has no action", async () => {
      mountMenu([createItem({ id: "no-action", label: "No Action" })]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("clicking parent item again closes submenu", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);

      const btn = wrapper.find(".context-menu-item");
      await btn.trigger("click");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);
      await btn.trigger("click");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });
  });

  describe("submenu hover", () => {
    it("shows submenu after hover delay", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Sub Item" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".context-menu-item-wrapper");
      await itemWrapper.trigger("mouseenter");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);

      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);
    });

    it("hides submenu on item without children hover", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
        createItem({ id: "item-2", label: "Regular" }),
      ]);

      // First show submenu
      const itemWrappers = wrapper.findAll(".context-menu-item-wrapper");
      await itemWrappers[0]!.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);

      // Hover non-parent item
      await itemWrappers[1]!.trigger("mouseenter");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });

    it("hides submenu after leave delay", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".context-menu-item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      await itemWrapper.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });

    it("cancels close when entering submenu", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".context-menu-item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      await itemWrapper.trigger("mouseleave");
      // Enter submenu before timeout
      const submenu = wrapper.find(".dx-context-submenu");
      await submenu.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await wrapper.vm.$nextTick();

      // Submenu should still be visible
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);
    });

    it("closes submenu on submenu leave", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".context-menu-item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      const submenu = wrapper.find(".dx-context-submenu");
      await submenu.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });

    it("handleItemLeave skips clearing when no hover timeout is pending", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      // Open submenu via click (not hover), so hoverTimeout is null
      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);

      // mouseleave with no pending hoverTimeout
      const itemWrapper = wrapper.find(".context-menu-item-wrapper");
      await itemWrapper.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });

    it("handleSubmenuEnter is a no-op when no close timeout is pending", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      // Open submenu via click (no hoverTimeout)
      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);

      // Enter submenu directly without prior mouseleave
      const submenu = wrapper.find(".dx-context-submenu");
      await submenu.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);
    });

    it("handleSubmenuLeave closes submenu when opened via click", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(true);

      const submenu = wrapper.find(".dx-context-submenu");
      await submenu.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".dx-context-submenu").exists()).toBe(false);
    });

    it("only shows submenu for active parent, not other parents", async () => {
      mountMenu([
        createItem({
          id: "parent-1",
          children: [createItem({ id: "child-1" })],
        }),
        createItem({
          id: "parent-2",
          children: [createItem({ id: "child-2" })],
        }),
      ]);

      // Open submenu for parent-1 only
      const buttons = wrapper.findAll(".context-menu-item");
      await buttons[0]!.trigger("click");

      // Only one submenu visible
      const submenus = wrapper.findAll(".dx-context-submenu");
      expect(submenus.length).toBe(1);
    });
  });

  describe("submenu children rendering", () => {
    it("renders child items in submenu", async () => {
      mountMenu([
        createItem({
          children: [
            createItem({ id: "child-1", label: "Child 1" }),
            createItem({ id: "child-2", label: "Child 2" }),
          ],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      const submenuItems = wrapper.find(".dx-context-submenu").findAll(".context-menu-item");
      expect(submenuItems.length).toBe(2);
      expect(submenuItems[0]!.find(".item-label").text()).toBe("Child 1");
    });

    it("renders child dividers", async () => {
      mountMenu([
        createItem({
          children: [
            createItem({ id: "child-1" }),
            createItem({ id: "div", divider: true }),
            createItem({ id: "child-2" }),
          ],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu .context-menu-divider").exists()).toBe(true);
    });

    it("renders child shortcuts", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", shortcut: "Ctrl+C" })],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu .item-shortcut").text()).toBe("Ctrl+C");
    });

    it("handles child disabled state", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", disabled: true })],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      expect(wrapper.find(".dx-context-submenu .context-menu-item.disabled").exists()).toBe(true);
    });

    it("calls child action and emits close on child click", async () => {
      const childAction = vi.fn();
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", action: childAction })],
        }),
      ]);

      await wrapper.find(".context-menu-item").trigger("click");
      await wrapper.find(".dx-context-submenu .context-menu-item").trigger("click");
      expect(childAction).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("close events", () => {
    it("emits close on overlay click", async () => {
      mountMenu();
      await wrapper.find(".dx-context-menu-overlay").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits close on Escape key", async () => {
      mountMenu();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("cleanup", () => {
    it("removes document keydown listener and clears timeouts on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      // Trigger a timeout to ensure one is pending
      wrapper.find(".context-menu-item-wrapper").trigger("mouseenter");

      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });
});
