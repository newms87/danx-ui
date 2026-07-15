import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { DanxContextMenu } from "../index";
import { DanxPopover } from "../../popover";
import type { ContextMenuItem } from "../types";

/**
 * Mock native Popover API on HTMLElement.prototype since jsdom doesn't support it.
 * Tracks open state per element via a WeakMap so dynamically created elements
 * (from v-if) automatically have the API available.
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

  async function mountMenu(items: ContextMenuItem[] = [], position = { x: 100, y: 200 }) {
    wrapper = mount(DanxContextMenu, {
      props: { items, position },
      attachTo: document.body,
    });
    await nextTick();
    await nextTick();
    return wrapper;
  }

  describe("rendering", () => {
    it("renders menu via DanxPopover", async () => {
      await mountMenu();
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(true);
    });

    it("renders menu items", async () => {
      await mountMenu([createItem({ label: "Cut" }), createItem({ id: "item-2", label: "Copy" })]);
      const items = wrapper.findAll(".danx-context-menu__item");
      expect(items.length).toBe(2);
      expect(items[0]!.find(".danx-context-menu__label").text()).toBe("Cut");
      expect(items[1]!.find(".danx-context-menu__label").text()).toBe("Copy");
    });

    it("renders dividers", async () => {
      await mountMenu([
        createItem(),
        createItem({ id: "div", divider: true }),
        createItem({ id: "item-2" }),
      ]);
      expect(wrapper.findAll(".danx-context-menu__divider").length).toBe(1);
    });

    it("shows shortcut text", async () => {
      await mountMenu([createItem({ shortcut: "Ctrl+C" })]);
      expect(wrapper.find(".danx-context-menu__shortcut").text()).toBe("Ctrl+C");
    });

    it("shows disabled state", async () => {
      await mountMenu([createItem({ disabled: true })]);
      expect(wrapper.find(".danx-context-menu__item.is-disabled").exists()).toBe(true);
    });

    it("renders the trigger slot when provided", async () => {
      wrapper = mount(DanxContextMenu, {
        props: { items: [createItem()], position: { x: 100, y: 200 } },
        slots: { trigger: "<button class='custom-trigger'>Open</button>" },
        attachTo: document.body,
      });
      await nextTick();
      expect(wrapper.find(".custom-trigger").exists()).toBe(true);
    });

    it("shows chevron for items with children", async () => {
      await mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__chevron").exists()).toBe(true);
    });

    it("does not show shortcut for items with children", async () => {
      await mountMenu([
        createItem({
          shortcut: "Ctrl+X",
          children: [createItem({ id: "child-1" })],
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__shortcut").exists()).toBe(false);
    });

    it("renders icon when provided", async () => {
      await mountMenu([
        createItem({
          icon: '<svg class="test-icon"><path d="M0 0"/></svg>',
        }),
      ]);
      expect(wrapper.find(".danx-context-menu__icon").exists()).toBe(true);
      expect(wrapper.find(".danx-context-menu__icon .test-icon").exists()).toBe(true);
    });

    it("does not render icon when not provided", async () => {
      await mountMenu([createItem()]);
      expect(wrapper.find(".danx-context-menu__icon").exists()).toBe(false);
    });
  });

  describe("prefix / suffix", () => {
    const TestComponent = {
      props: ["onClick"],
      template: '<button class="test-suffix-btn" @click="onClick">X</button>',
    };

    it("renders a string prefix as raw HTML, not through DanxIcon", async () => {
      await mountMenu([createItem({ prefix: '<span class="test-prefix">P</span>' })]);
      const prefix = wrapper.find(".danx-context-menu__prefix");
      expect(prefix.exists()).toBe(true);
      expect(prefix.find(".test-prefix").exists()).toBe(true);
      expect(wrapper.find(".danx-context-menu__prefix .danx-icon").exists()).toBe(false);
    });

    it("renders a string suffix as raw HTML, not through DanxIcon", async () => {
      await mountMenu([createItem({ suffix: '<span class="test-suffix">S</span>' })]);
      const suffix = wrapper.find(".danx-context-menu__suffix");
      expect(suffix.exists()).toBe(true);
      expect(suffix.find(".test-suffix").exists()).toBe(true);
      expect(wrapper.find(".danx-context-menu__suffix .danx-icon").exists()).toBe(false);
    });

    it("renders a component prefix via <component :is>", async () => {
      await mountMenu([createItem({ prefix: TestComponent })]);
      expect(wrapper.find(".danx-context-menu__prefix.test-suffix-btn").exists()).toBe(true);
    });

    it("renders a component suffix via <component :is>", async () => {
      await mountMenu([createItem({ suffix: TestComponent })]);
      expect(wrapper.find(".danx-context-menu__suffix.test-suffix-btn").exists()).toBe(true);
    });

    it("does not render prefix/suffix elements when not provided", async () => {
      await mountMenu([createItem()]);
      expect(wrapper.find(".danx-context-menu__prefix").exists()).toBe(false);
      expect(wrapper.find(".danx-context-menu__suffix").exists()).toBe(false);
    });

    it("renders prefix and suffix as siblings of the item button, not nested inside it", async () => {
      await mountMenu([createItem({ prefix: TestComponent, suffix: TestComponent })]);
      const button = wrapper.find(".danx-context-menu__item");
      expect(button.find(".danx-context-menu__prefix").exists()).toBe(false);
      expect(button.find(".danx-context-menu__suffix").exists()).toBe(false);
      const wrapperDiv = wrapper.find(".danx-context-menu__item-wrapper");
      expect(wrapperDiv.find(".danx-context-menu__prefix").exists()).toBe(true);
      expect(wrapperDiv.find(".danx-context-menu__suffix").exists()).toBe(true);
    });

    it("clicking a suffix control fires its own handler without triggering onItemClick", async () => {
      const action = vi.fn();
      const suffixClick = vi.fn();
      await mountMenu([
        createItem({
          action,
          suffix: { ...TestComponent, props: [], emits: ["click"] },
        }),
      ]);
      // simulate a consumer-authored suffix component's own click handler wired via a wrapper
      const btn = wrapper.find(".test-suffix-btn");
      btn.element.addEventListener("click", suffixClick);
      await btn.trigger("click");

      expect(suffixClick).toHaveBeenCalled();
      expect(action).not.toHaveBeenCalled();
      expect(wrapper.emitted("close")).toBeUndefined();
    });

    it("renders a component prefix for submenu children via <component :is>", async () => {
      await mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child", prefix: TestComponent })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();

      expect(
        wrapper
          .find(".danx-context-menu__submenu .danx-context-menu__prefix.test-suffix-btn")
          .exists()
      ).toBe(true);
    });

    it("renders string prefix/suffix for submenu children as siblings of the child button", async () => {
      await mountMenu([
        createItem({
          children: [
            createItem({
              id: "child-1",
              label: "Child",
              prefix: '<span class="test-child-prefix">P</span>',
              suffix: '<span class="test-child-suffix">S</span>',
            }),
          ],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();

      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      const childWrapper = submenu.find(".danx-context-menu__item-wrapper");
      expect(childWrapper.exists()).toBe(true);
      expect(childWrapper.find(".test-child-prefix").exists()).toBe(true);
      expect(childWrapper.find(".test-child-suffix").exists()).toBe(true);

      const childButton = childWrapper.find(".danx-context-menu__item");
      expect(childButton.find(".test-child-prefix").exists()).toBe(false);
      expect(childButton.find(".test-child-suffix").exists()).toBe(false);
    });

    it("clicking a submenu child's suffix control does not trigger the child action or close the menu", async () => {
      const action = vi.fn();
      await mountMenu([
        createItem({
          children: [
            createItem({
              id: "child-1",
              label: "Child",
              action,
              suffix: TestComponent,
            }),
          ],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();

      const suffixBtn = wrapper.find(".danx-context-menu__submenu .test-suffix-btn");
      expect(suffixBtn.exists()).toBe(true);
      await suffixBtn.trigger("click");

      expect(action).not.toHaveBeenCalled();
      expect(wrapper.emitted("close")).toBeUndefined();
    });
  });

  /**
   * Mock the rendered menu panel's bounding rect so the rect-derived submenu
   * direction (which replaced the old props.position.x read) is deterministic
   * under happy-dom (where getBoundingClientRect returns zeros by default).
   * open-left fires when panel.right + ESTIMATED_MENU_WIDTH(320) > innerWidth.
   */
  function mockPanelRight(right: number): void {
    const panel = wrapper.find(".danx-popover.danx-context-menu").element;
    panel.getBoundingClientRect = vi.fn(
      () => ({ right, left: 0, top: 0, bottom: 0, width: right, height: 0, x: 0, y: 0 }) as DOMRect
    );
  }

  describe("submenu direction", () => {
    it("adds open-left class to submenu when panel is near right viewport edge", async () => {
      await mountMenu([createItem({ children: [createItem({ id: "child-1", label: "Child" })] })], {
        x: 900,
        y: 200,
      });
      mockPanelRight(window.innerWidth - 50);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();
      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      expect(submenu.classes()).toContain("open-left");
    });

    it("does not add open-left class when panel is far from right edge", async () => {
      await mountMenu([createItem({ children: [createItem({ id: "child-1", label: "Child" })] })], {
        x: 100,
        y: 200,
      });
      mockPanelRight(100);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();
      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      expect(submenu.classes()).not.toContain("open-left");
    });
  });

  describe("item click", () => {
    it("calls action and emits close on item click", async () => {
      const action = vi.fn();
      const item = createItem({ action });
      await mountMenu([item]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(action).toHaveBeenCalled();
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toHaveLength(1);
      expect(wrapper.emitted("action")![0]).toEqual([item]);
    });

    it("does not call action on disabled item", async () => {
      const action = vi.fn();
      await mountMenu([createItem({ action, disabled: true })]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(action).not.toHaveBeenCalled();
    });

    it("returns early from onItemClick when item is disabled", async () => {
      await mountMenu([
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
      await mountMenu([
        createItem({
          children: [createItem({ id: "child-1", label: "Child" })],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
    });

    it("emits close without calling action when item has no action", async () => {
      await mountMenu([createItem({ id: "no-action", label: "No Action" })]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("action")).toBeUndefined();
    });

    it("clicking parent item again closes submenu", async () => {
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
      await mountMenu([
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
    it("emits close when popover closes via Escape", async () => {
      await mountMenu();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      await nextTick();
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("does not emit close on non-Escape key", async () => {
      await mountMenu();
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);
      await nextTick();
      expect(wrapper.emitted("close")).toBeUndefined();
    });
  });

  describe("cleanup", () => {
    it("clears active hover timeout on unmount without errors", async () => {
      await mountMenu([
        createItem({
          children: [createItem({ id: "child-1" })],
        }),
      ]);

      // Start a hover timeout (100ms) but unmount before it fires
      await wrapper.find(".danx-context-menu__item-wrapper").trigger("mouseenter");
      wrapper.unmount();

      // Advance past the timeout — should not throw or warn
      vi.advanceTimersByTime(200);
    });
  });

  // Mount in button-anchored (dropdown) mode: a #trigger slot, NO position.
  async function mountAnchored(items: ContextMenuItem[] = [], props: Record<string, unknown> = {}) {
    wrapper = mount(DanxContextMenu, {
      props: { items, ...props },
      slots: { trigger: '<button class="trigger-btn">Open</button>' },
      attachTo: document.body,
    });
    await nextTick();
    await nextTick();
    return wrapper;
  }

  describe("anchored open mode (#trigger, no position)", () => {
    it("renders the trigger inline and the panel anchored, forwarding NO position", async () => {
      await mountAnchored([createItem({ label: "Sort" })]);

      // Trigger element is rendered inline inside DanxPopover's trigger wrapper.
      expect(wrapper.find(".danx-popover-trigger .trigger-btn").exists()).toBe(true);

      // Panel renders (open model defaults true), anchored to the trigger.
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(true);

      // No explicit position is forwarded — DanxPopover anchors to the trigger,
      // so no rect math runs in the consumer or in DanxContextMenu.
      expect(wrapper.findComponent(DanxPopover).props("position")).toBeUndefined();
    });

    it("forwards placement to DanxPopover", async () => {
      await mountAnchored([createItem()], { placement: "top" });
      expect(wrapper.findComponent(DanxPopover).props("placement")).toBe("top");
    });
  });

  describe("open model (v-model:open)", () => {
    it("renders the panel by default when no open is bound", async () => {
      await mountMenu([createItem()]);
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(true);
    });

    it("does not render the panel when open is false", async () => {
      wrapper = mount(DanxContextMenu, {
        props: { items: [createItem()], position: { x: 100, y: 200 }, open: false },
        attachTo: document.body,
      });
      await nextTick();
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(false);
    });

    it("renders when open toggles false→true and removes when true→false", async () => {
      wrapper = mount(DanxContextMenu, {
        props: { items: [createItem()], position: { x: 100, y: 200 }, open: false },
        attachTo: document.body,
      });
      await nextTick();
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(false);

      await wrapper.setProps({ open: true });
      await nextTick();
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(true);

      await wrapper.setProps({ open: false });
      await nextTick();
      expect(wrapper.find(".danx-popover.danx-context-menu").exists()).toBe(false);
    });

    it("emits update:open false AND close when dismissed via Escape", async () => {
      await mountMenu([createItem()]);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(wrapper.emitted("update:open")).toEqual([[false]]);
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("submenu direction in anchored mode (panel rect, no position)", () => {
    it("does not throw and derives open-left from the panel rect when near right edge", async () => {
      await mountAnchored([
        createItem({ children: [createItem({ id: "child-1", label: "Child" })] }),
      ]);
      mockPanelRight(window.innerWidth - 50);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();
      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      expect(submenu.classes()).toContain("open-left");
    });

    it("omits open-left when the panel rect is far from the right edge", async () => {
      await mountAnchored([
        createItem({ children: [createItem({ id: "child-1", label: "Child" })] }),
      ]);
      mockPanelRight(100);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      await nextTick();
      const submenu = wrapper.find(".danx-context-menu__submenu");
      expect(submenu.exists()).toBe(true);
      expect(submenu.classes()).not.toContain("open-left");
    });
  });

  describe("anchored-mode close paths", () => {
    it("closes on outside-click (pointerdown outside trigger + panel)", async () => {
      await mountAnchored([createItem()]);
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await nextTick();

      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("update:open")).toEqual([[false]]);
      outside.remove();
    });

    it("closes on Escape", async () => {
      await mountAnchored([createItem()]);
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(wrapper.emitted("close")).toHaveLength(1);
      expect(wrapper.emitted("update:open")).toEqual([[false]]);
    });

    it("closes on item-click", async () => {
      await mountAnchored([createItem({ action: vi.fn() })]);
      await wrapper.find(".danx-context-menu__item").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("active item indicator", () => {
    it("renders is-active class and a check indicator on an active item", async () => {
      await mountMenu([createItem({ active: true })]);
      const item = wrapper.find(".danx-context-menu__item");
      expect(item.classes()).toContain("is-active");
      expect(wrapper.find(".danx-context-menu__check").exists()).toBe(true);
    });

    it("renders no indicator on a non-active item", async () => {
      await mountMenu([createItem()]);
      const item = wrapper.find(".danx-context-menu__item");
      expect(item.classes()).not.toContain("is-active");
      expect(wrapper.find(".danx-context-menu__check").exists()).toBe(false);
    });

    it("renders the active indicator on an active child inside an opened submenu", async () => {
      await mountMenu([
        createItem({
          id: "parent",
          label: "Sort",
          children: [
            createItem({ id: "child-asc", label: "Ascending", active: true }),
            createItem({ id: "child-desc", label: "Descending" }),
          ],
        }),
      ]);

      await wrapper.find(".danx-context-menu__item").trigger("click");
      const submenu = wrapper.find(".danx-context-menu__submenu");
      const activeChild = submenu.findAll(".danx-context-menu__item")[0]!;
      expect(activeChild.classes()).toContain("is-active");
      expect(activeChild.find(".danx-context-menu__check").exists()).toBe(true);
    });

    it("reflects active state on a submenu parent whose child is active", async () => {
      await mountMenu([
        createItem({
          id: "parent",
          label: "Sort",
          children: [createItem({ id: "child-asc", label: "Ascending", active: true })],
        }),
      ]);

      const parent = wrapper.find(".danx-context-menu__item");
      expect(parent.classes()).toContain("is-active");
      expect(parent.find(".danx-context-menu__check").exists()).toBe(true);
    });
  });
});
