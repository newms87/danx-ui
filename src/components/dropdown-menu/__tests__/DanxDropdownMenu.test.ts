import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { DanxDropdownMenu } from "../index";
import { DanxPopover } from "../../popover";
import type { DropdownMenuItem } from "../types";

/**
 * Mock native Popover API on HTMLElement.prototype since jsdom doesn't
 * support it — mirrors the DanxContextMenu test setup this component
 * composes on top of.
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

describe("DanxDropdownMenu", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  async function mountDropdown(
    items: DropdownMenuItem[] = [],
    props: Record<string, unknown> = {}
  ) {
    wrapper = mount(DanxDropdownMenu, {
      props: { items, ...props },
      slots: { default: '<button class="trigger-btn">Actions</button>' },
      attachTo: document.body,
    });
    await nextTick();
    await nextTick();
    return wrapper;
  }

  it("renders the slotted trigger content", async () => {
    await mountDropdown();
    expect(wrapper.find(".trigger-btn").exists()).toBe(true);
  });

  it("does not render the menu panel until opened", async () => {
    await mountDropdown([{ label: "Cut" }]);
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(false);
  });

  it("opens the menu when the trigger is clicked", async () => {
    await mountDropdown([{ label: "Cut" }]);
    await wrapper.find(".trigger-btn").trigger("click");
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(true);
    expect(wrapper.emitted("update:open")).toEqual([[true]]);
  });

  it("closes the menu when the trigger is clicked again", async () => {
    await mountDropdown([{ label: "Cut" }]);
    await wrapper.find(".trigger-btn").trigger("click");
    await wrapper.find(".trigger-btn").trigger("click");
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(false);
    expect(wrapper.emitted("update:open")).toEqual([[true], [false]]);
  });

  it("supports v-model:open from the consumer", async () => {
    await mountDropdown([{ label: "Cut" }], { open: true });
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(true);

    await wrapper.setProps({ open: false });
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(false);
  });

  it("closes the menu when DanxContextMenu emits close (e.g. Escape)", async () => {
    await mountDropdown([{ label: "Cut" }], { open: true });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
    expect(wrapper.find(".danx-dropdown-menu").exists()).toBe(false);
  });

  it("forwards placement to the underlying menu/popover", async () => {
    await mountDropdown([{ label: "Cut" }], { open: true, placement: "top" });
    expect(wrapper.findComponent(DanxPopover).props("placement")).toBe("top");
  });

  it("renders a divider for separator items", async () => {
    await mountDropdown([{ label: "Cut" }, { label: "", separator: true }, { label: "Paste" }], {
      open: true,
    });
    expect(wrapper.find(".danx-context-menu__divider").exists()).toBe(true);
  });

  it("renders disabled items as non-clickable", async () => {
    const action = vi.fn();
    await mountDropdown([{ label: "Paste", disabled: true, action }], { open: true });
    const button = wrapper.find(".danx-context-menu__item");
    expect(button.attributes("disabled")).toBeDefined();

    await button.trigger("click");
    expect(action).not.toHaveBeenCalled();
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("renders an icon when provided", async () => {
    await mountDropdown(
      [{ label: "Edit", icon: '<svg viewBox="0 0 24 24"><path d="M0 0" /></svg>' }],
      { open: true }
    );
    expect(wrapper.find(".danx-context-menu__icon").exists()).toBe(true);
  });

  it("emits select and calls the action for a leaf item with an action, then closes", async () => {
    const action = vi.fn();
    const item: DropdownMenuItem = { label: "Copy", action };
    await mountDropdown([item], { open: true });

    await wrapper.find(".danx-context-menu__item").trigger("click");

    expect(action).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("select")).toEqual([[item]]);
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });

  it("emits select for a leaf item with no action, and still closes", async () => {
    const item: DropdownMenuItem = { label: "Copy" };
    await mountDropdown([item], { open: true });

    await wrapper.find(".danx-context-menu__item").trigger("click");

    expect(wrapper.emitted("select")).toEqual([[item]]);
    expect(wrapper.emitted("update:open")).toEqual([[false]]);
  });

  it("opens a submenu without emitting select or closing when the item has children", async () => {
    const childAction = vi.fn();
    const item: DropdownMenuItem = {
      label: "Share",
      children: [{ label: "Email", action: childAction }],
    };
    await mountDropdown([item], { open: true });

    await wrapper.find(".danx-context-menu__item").trigger("click");
    await nextTick();

    expect(wrapper.emitted("select")).toBeUndefined();
    expect(wrapper.emitted("update:open")).toBeUndefined();
    expect(wrapper.find(".danx-context-menu__submenu").exists()).toBe(true);
  });

  it("emits select with the original child item when a submenu item is chosen", async () => {
    const childAction = vi.fn();
    const child: DropdownMenuItem = { label: "Email", action: childAction };
    const item: DropdownMenuItem = { label: "Share", children: [child] };
    await mountDropdown([item], { open: true });

    await wrapper.find(".danx-context-menu__item").trigger("click");
    await nextTick();
    await wrapper.find(".danx-context-menu__submenu .danx-context-menu__item").trigger("click");

    expect(childAction).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("select")).toEqual([[child]]);
  });

  it("supports Up/Down keyboard navigation across root items", async () => {
    await mountDropdown([{ label: "Cut" }, { label: "Copy" }], { open: true });
    const list = wrapper.find(".danx-context-menu__list");
    const items = () => wrapper.findAll(".danx-context-menu__item");

    expect(items()[0]!.attributes("tabindex")).toBe("0");
    await list.trigger("keydown", { key: "ArrowDown" });
    expect(items()[1]!.attributes("tabindex")).toBe("0");
    await list.trigger("keydown", { key: "ArrowUp" });
    expect(items()[0]!.attributes("tabindex")).toBe("0");
  });

  it(
    "documented caveat: reordering `items` while open can carry the active " +
      "item onto a different item at the same tree position, since ids are " +
      "derived from position, not identity (see the `items` prop doc)",
    async () => {
      const cut: DropdownMenuItem = { label: "Cut" };
      const copy: DropdownMenuItem = { label: "Copy" };
      await mountDropdown([cut, copy], { open: true });

      const list = wrapper.find(".danx-context-menu__list");
      await list.trigger("keydown", { key: "ArrowDown" });
      expect(wrapper.findAll(".danx-context-menu__item")[1]!.attributes("tabindex")).toBe("0");

      // Reorder in place: "Copy" is now at position 0, "Cut" at position 1.
      // The active id ("item-1") still points at position 1 — now "Cut" —
      // rather than resetting, because DanxContextMenu's items-changed watch
      // only checks that the id still exists among navigable items.
      await wrapper.setProps({ items: [copy, cut] });

      const reorderedItems = wrapper.findAll(".danx-context-menu__item");
      expect(reorderedItems[1]!.attributes("tabindex")).toBe("0");
      expect(reorderedItems[1]!.find(".danx-context-menu__label").text()).toBe("Cut");
    }
  );
});
