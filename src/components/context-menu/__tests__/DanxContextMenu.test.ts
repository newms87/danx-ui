import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import DanxContextMenu from "../DanxContextMenu.vue";
import type { ContextMenuItem } from "../types";

function createItem(overrides: Partial<ContextMenuItem> = {}): ContextMenuItem {
  return {
    id: "item-1",
    label: "Test Item",
    ...overrides,
  };
}

describe("DanxContextMenu", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  function mountMenu(items: ContextMenuItem[] = [], position = { x: 100, y: 200 }) {
    wrapper = mount(DanxContextMenu, {
      props: { items, position },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders overlay", () => {
      mountMenu();
      expect(wrapper.find(".danx-context-menu-overlay").exists()).toBe(true);
    });

    it("renders menu container", () => {
      mountMenu();
      expect(wrapper.find(".danx-context-menu").exists()).toBe(true);
    });

    it("renders menu items", () => {
      mountMenu([createItem({ label: "Cut" }), createItem({ id: "item-2", label: "Copy" })]);
      const items = wrapper.findAll(".danx-context-menu__item");
      expect(items.length).toBe(2);
      expect(items[0]!.find(".danx-context-menu__label").text()).toBe("Cut");
      expect(items[1]!.find(".danx-context-menu__label").text()).toBe("Copy");
    });

    it("renders dividers", () => {
      mountMenu([
        createItem(),
        createItem({ id: "div", divider: true }),
        createItem({ id: "item-2" }),
      ]);
      expect(wrapper.findAll(".danx-context-menu__divider").length).toBe(1);
    });

    it("shows shortcut text", () => {
      mountMenu([createItem({ shortcut: "Ctrl+C" })]);
      expect(wrapper.find(".danx-context-menu__shortcut").text()).toBe("Ctrl+C");
    });

    it("shows disabled state", () => {
      mountMenu([createItem({ disabled: true })]);
      expect(wrapper.find(".danx-context-menu__item.is-disabled").exists()).toBe(true);
    });

    it("shows chevron for items with children", () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__chevron").exists()).toBe(true);
    });

    it("does not show shortcut for items with children", () => {
      mountMenu([
        createItem({
          shortcut: "Ctrl+X",
          children: [createItem({ id: "child-1" })],
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__shortcut").exists()).toBe(false);
    });

    it("renders icon when provided", () => {
      mountMenu([
        createItem({
          icon: '<svg class="test-icon"><path d="M0 0"/></svg>',
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__icon").exists()).toBe(true);
      expect(wrapper.find(".danx-context-menu__icon .test-icon").exists()).toBe(true);
    });

    it("does not render icon when not provided", () => {
      mountMenu([createItem()]);
      expect(wrapper.find(".danx-context-menu__icon").exists()).toBe(false);
    });
  });

  describe("menu positioning", () => {
    it("positions at given coordinates", () => {
      mountMenu([], { x: 150, y: 250 });
      const style = wrapper.find(".danx-context-menu").attributes("style");
      expect(style).toContain("top: 250px");
      expect(style).toContain("left: 150px");
    });

    it("constrains to left edge", () => {
      mountMenu([], { x: -50, y: 200 });
      const style = wrapper.find(".danx-context-menu").attributes("style");
      expect(style).toContain("left: 10px");
    });

    it("adds open-left class to submenu when near right viewport edge", async () => {
      mountMenu(
        [
          createItem({
            children: [createItem({ id: "child-1", label: "Child" })],
          }),
        ],
        { x: 900, y: 200 }
      );

      await wrapper.find(".danx-context-menu__item").trigger("click");
      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      expect(submenu.classes()).toContain("open-left");
    });
  });

  describe("item click", () => {
    it("calls action and emits close on item click", async () => {
      const action = vi.fn();
      const item = createItem({ action });
      mountMenu([item]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(action).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toHaveLength(1);
      expect(wrapper.emitted("action")![0]).toEqual([item]);
    });

    it("does not call action on disabled item", async () => {
      const action = vi.fn();
      mountMenu([createItem({ action, disabled: true })]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(action).not.toHaveBeenCalled();
    });

    it("returns early from onItemClick when item is disabled", async () => {
      mountMenu([
        createItem({
          id: "disabled-no-action",
          label: "Disabled",
          disabled: true,
        }),
      ]);

      const btn = wrapper.find(".danx-context-menu__item");
      btn.element.removeAttribute("disabled");
      await btn.trigger("click");

      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("toggles submenu on parent item click instead of closing", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
    });

    it("emits close without calling action when item has no action", async () => {
      mountMenu([createItem({ id: "no-action", label: "No Action" })]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("clicking parent item again closes submenu", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);

      const btn = wrapper.find(".danx-context-menu__item");
      await btn.trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
      await btn.trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });
  });

  describe("submenu hover", () => {
    it("shows submenu after hover delay", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Sub Item" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".danx-context-menu__item-wrapper");
      await itemWrapper.trigger("mouseenter");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);

      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
    });

    it("hides submenu on item without children hover", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
        createItem({ id: "item-2", label: "Regular" }),
      ]);

      const itemWrappers = wrapper.findAll(".danx-context-menu__item-wrapper");
      await itemWrappers[0]!.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);

      await itemWrappers[1]!.trigger("mouseenter");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });

    it("hides submenu after leave delay", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".danx-context-menu__item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      await itemWrapper.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });

    it("cancels close when entering submenu", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".danx-context-menu__item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      await itemWrapper.trigger("mouseleave");
      const submenu = wrapper.find(".danx-context-menu__submenu");
      await submenu.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
    });

    it("closes submenu on submenu leave", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      const itemWrapper = wrapper.find(".danx-context-menu__item-wrapper");
      await itemWrapper.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      const submenu = wrapper.find(".danx-context-menu__submenu");
      await submenu.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });

    it("closes submenu on leave when opened via click without prior hover", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);

      const itemWrapper = wrapper.find(".danx-context-menu__item-wrapper");
      await itemWrapper.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });

    it("keeps submenu open when mouse enters it without prior leave delay", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);

      const submenu = wrapper.find(".danx-context-menu__submenu");
      await submenu.trigger("mouseenter");
      vi.advanceTimersByTime(200);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
    });

    it("closes submenu when mouse leaves it after being opened via click", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);

      const submenu = wrapper.find(".danx-context-menu__submenu");
      await submenu.trigger("mouseleave");
      vi.advanceTimersByTime(150);
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(false);
    });

    it("switches to second parent submenu when hovering rapidly between parents", async () => {
      mountMenu([
        createItem({
          id: "parent-1",
          children: [createItem({ id: "child-1", label: "Child 1" })],
        }),
        createItem({
          id: "parent-2",
          children: [createItem({ id: "child-2", label: "Child 2" })],
        }),
      ]);

      const itemWrappers = wrapper.findAll(".danx-context-menu__item-wrapper");
      await itemWrappers[0]!.trigger("mouseenter");
      // Immediately hover second parent before 100ms elapses
      await itemWrappers[1]!.trigger("mouseenter");
      vi.advanceTimersByTime(100);
      await wrapper.vm.$nextTick();

      const submenus = wrapper.findAll(".danx-context-menu__submenu");
      expect(submenus.length).toBe(1);
      expect(submenus[0]!.find(".danx-context-menu__label").text()).toBe("Child 2");
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

      const buttons = wrapper.findAll(".danx-context-menu__item");
      await buttons[0]!.trigger("click");

      const submenus = wrapper.findAll(".danx-context-menu__submenu");
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

      await wrapper.find(".danx-context-menu__item").trigger("click");
      const submenuItems = wrapper
        .find(".danx-context-menu__submenu")
        .findAll(".danx-context-menu__item");
      expect(submenuItems.length).toBe(2);
      expect(submenuItems[0]!.find(".danx-context-menu__label").text()).toBe("Child 1");
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

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu .danx-context-menu__divider").exists()).toBe(
        true
      );
    });

    it("renders child shortcuts", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", shortcut: "Ctrl+C" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu .danx-context-menu__shortcut").text()).toBe(
        "Ctrl+C"
      );
    });

    it("handles child disabled state", async () => {
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", disabled: true })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(
        wrapper.find(".danx-context-menu__submenu .danx-context-menu__item.is-disabled").exists()
      ).toBe(true);
    });

    it("renders child icon when provided", async () => {
      mountMenu([
        createItem({
          children: [
            createItem({
              id: "child-1",
              icon: '<svg class="child-icon"></svg>',
            }),
          ],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.find(".danx-context-menu__submenu .danx-context-menu__icon").exists()).toBe(
        true
      );
    });

    it("does not call action or emit events when clicking disabled child", async () => {
      const childAction = vi.fn();
      mountMenu([
        createItem({
          children: [createItem({ id: "child-1", action: childAction, disabled: true })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      const childBtn = wrapper.find(".danx-context-menu__submenu .danx-context-menu__item");
      childBtn.element.removeAttribute("disabled");
      await childBtn.trigger("click");
      expect(childAction).not.toHaveBeenCalled();
      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("calls child action and emits close on child click", async () => {
      const childAction = vi.fn();
      const child = createItem({ id: "child-1", action: childAction });
      mountMenu([
        createItem({
          children: [child],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await wrapper.find(".danx-context-menu__submenu .danx-context-menu__item").trigger("click");
      expect(childAction).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toHaveLength(1);
      expect(wrapper.emitted("action")![0]).toEqual([child]);
    });
  });

  describe("close events", () => {
    it("emits close on overlay click", async () => {
      mountMenu();
      await wrapper.find(".danx-context-menu-overlay").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits close on Escape key", async () => {
      mountMenu();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("does not emit close on non-Escape key", () => {
      mountMenu();
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("close")).toBeUndefined();
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

      wrapper.find(".danx-context-menu__item-wrapper").trigger("mouseenter");

      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });
});
