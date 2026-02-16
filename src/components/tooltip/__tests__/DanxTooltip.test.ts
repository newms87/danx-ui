import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, markRaw, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DanxTooltip } from "../index";

describe("DanxTooltip", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    // Clean up any teleported content
    document.body.querySelectorAll(".danx-tooltip").forEach((el) => el.remove());
  });

  function mountTooltip(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    wrapper = mount(DanxTooltip, {
      props: { tooltip: "Test tooltip", ...props },
      slots: {
        trigger: '<button class="test-trigger">Hover me</button>',
        ...slots,
      },
      attachTo: document.body,
    });
    return wrapper;
  }

  // ==========================================================================
  // Trigger Rendering
  // ==========================================================================

  describe("trigger rendering", () => {
    it("renders trigger slot content", () => {
      mountTooltip();
      expect(wrapper.find(".test-trigger").exists()).toBe(true);
      expect(wrapper.find(".test-trigger").text()).toBe("Hover me");
    });

    it("wraps trigger in danx-tooltip-trigger span", () => {
      mountTooltip();
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(true);
    });

    it("renders triggerIcon as DanxIcon when no trigger slot", () => {
      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Test", triggerIcon: "info" },
        attachTo: document.body,
      });
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(true);
      expect(wrapper.find(".danx-icon").exists()).toBe(true);
    });

    it("renders no inline trigger when targetId prop is used", () => {
      const targetEl = document.createElement("div");
      targetEl.id = "tooltip-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Test", targetId: "tooltip-target" },
        attachTo: document.body,
      });
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(false);
      targetEl.remove();
    });

    it("renders no inline trigger when target prop is used", () => {
      const targetEl = document.createElement("div");
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Test", target: targetEl },
        attachTo: document.body,
      });
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(false);
      targetEl.remove();
    });
  });

  // ==========================================================================
  // Panel Icon
  // ==========================================================================

  describe("panel icon", () => {
    it("renders panel icon when icon prop is set", async () => {
      mountTooltip({ icon: "info" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.querySelector(".danx-tooltip__icon")).not.toBeNull();
      expect(panel?.querySelector(".danx-tooltip__content")).not.toBeNull();
    });

    it("renders no icon area when icon prop is omitted", async () => {
      mountTooltip();
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.querySelector(".danx-tooltip__icon")).toBeNull();
    });

    it("renders icon from SVG string", async () => {
      mountTooltip({ icon: '<svg viewBox="0 0 1 1"><rect /></svg>' });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const icon = document.body.querySelector(".danx-tooltip__icon .danx-icon");
      expect(icon).not.toBeNull();
    });

    it("renders icon from Component", async () => {
      const IconComp = markRaw(defineComponent({ template: '<span class="custom-icon">!</span>' }));
      mountTooltip({ icon: IconComp });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const icon = document.body.querySelector(".danx-tooltip__icon .custom-icon");
      expect(icon).not.toBeNull();
    });
  });

  // ==========================================================================
  // Hover Interaction (default)
  // ==========================================================================

  describe("hover interaction", () => {
    it("shows panel on mouseenter of trigger", async () => {
      mountTooltip();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });

    it("hides panel immediately on mouseleave by default (non-enterable)", async () => {
      mountTooltip();
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("mouseleave");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("hides panel after 200ms delay on mouseleave when enterable", async () => {
      mountTooltip({ enterable: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("mouseleave");
      // Not hidden yet — delay hasn't elapsed
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await vi.advanceTimersByTimeAsync(200);
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("keeps panel open when mouse moves from trigger to panel (enterable)", async () => {
      mountTooltip({ enterable: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip")!;
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseleave");

      // Mouse enters panel before delay elapses
      panel.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.advanceTimersByTimeAsync(300);

      // Panel should still be open
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });

    it("does not keep panel open on panel mouseenter when non-enterable", async () => {
      mountTooltip();
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip")!;
      // Panel mouseenter should be a no-op when non-enterable
      panel.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      // Panel mouseleave should also be a no-op
      panel.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      await vi.runAllTimersAsync();

      // Panel should still be open (panel hover handlers are no-ops)
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });

    it("hides panel on mouseleave of panel when enterable", async () => {
      mountTooltip({ enterable: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip")!;
      panel.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("does not show when disabled", async () => {
      mountTooltip({ disabled: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("stays open on rapid re-entry before delay elapses (enterable)", async () => {
      mountTooltip({ enterable: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      // Leave trigger — starts 200ms close delay
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseleave");
      // Re-enter before delay elapses
      await vi.advanceTimersByTimeAsync(100);
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.advanceTimersByTimeAsync(300);

      // Should still be open — the re-entry cleared the timeout
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });
  });

  // ==========================================================================
  // Click Interaction
  // ==========================================================================

  describe("click interaction", () => {
    it("toggles panel on click", async () => {
      mountTooltip({ interaction: "click" });
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("click");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("click");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("closes on click outside", async () => {
      mountTooltip({ interaction: "click" });
      await wrapper.find(".danx-tooltip-trigger").trigger("click");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      // Click outside
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
      outside.remove();
    });

    it("does not close when clicking on panel", async () => {
      mountTooltip({ interaction: "click" });
      await wrapper.find(".danx-tooltip-trigger").trigger("click");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip")!;
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: panel });
      document.dispatchEvent(event);
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });

    it("does not use hover delay", async () => {
      mountTooltip({ interaction: "click" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      // Hover should NOT open it
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("does not show when disabled", async () => {
      mountTooltip({ interaction: "click", disabled: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("click");
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });
  });

  // ==========================================================================
  // Focus Interaction
  // ==========================================================================

  describe("focus interaction", () => {
    it("shows panel on focusin", async () => {
      mountTooltip({ interaction: "focus" });
      await wrapper.find(".danx-tooltip-trigger").trigger("focusin");
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });

    it("hides panel on focusout", async () => {
      mountTooltip({ interaction: "focus" });
      await wrapper.find(".danx-tooltip-trigger").trigger("focusin");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await wrapper.find(".danx-tooltip-trigger").trigger("focusout");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });

    it("does not show when disabled", async () => {
      mountTooltip({ interaction: "focus", disabled: true });
      await wrapper.find(".danx-tooltip-trigger").trigger("focusin");
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });
  });

  // ==========================================================================
  // Target Prop
  // ==========================================================================

  describe("targetId prop", () => {
    it("binds to external element by ID string", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "ext-trigger";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "External", targetId: "ext-trigger" },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
      expect(document.body.querySelector(".danx-tooltip")?.textContent).toContain("External");

      targetEl.remove();
    });

    it("cleans up listeners on unmount", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "cleanup-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Cleanup", targetId: "cleanup-target" },
        attachTo: document.body,
      });

      wrapper.unmount();

      // After unmount, listeners should be removed — mouseenter should not create a panel
      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
      targetEl.remove();
    });

    it("does not show when disabled with external target", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "disabled-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Disabled", targetId: "disabled-target", disabled: true },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
      targetEl.remove();
    });

    it("closes immediately on mouseleave when non-enterable (default)", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "non-enterable-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Non-enterable", targetId: "non-enterable-target" },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      targetEl.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      targetEl.remove();
    });

    it("uses delayed close on mouseleave when enterable", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "enterable-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Enterable", targetId: "enterable-target", enterable: true },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      targetEl.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      // Not hidden yet — delay hasn't elapsed
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      await vi.advanceTimersByTimeAsync(200);
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      targetEl.remove();
    });

    it("handles nonexistent targetId gracefully", async () => {
      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Ghost", targetId: "does-not-exist" },
        attachTo: document.body,
      });

      // No inline trigger should render
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(false);
      // No tooltip should be open
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });
  });

  // ==========================================================================
  // Target Prop (HTMLElement)
  // ==========================================================================

  describe("target prop", () => {
    it("binds to HTMLElement ref", async () => {
      const targetEl = document.createElement("button");
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Ref target", target: targetEl },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await vi.runAllTimersAsync();

      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
      targetEl.remove();
    });
  });

  // ==========================================================================
  // Panel Content
  // ==========================================================================

  describe("panel content", () => {
    it("renders tooltip string prop", async () => {
      mountTooltip({ tooltip: "Hello world" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.textContent).toContain("Hello world");
    });

    it("renders default slot content", async () => {
      mountTooltip({}, { default: '<p class="rich-content">Rich!</p>' });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.querySelector(".rich-content")?.textContent).toBe("Rich!");
    });

    it("slot content takes precedence over tooltip prop", async () => {
      mountTooltip({ tooltip: "Prop text" }, { default: "Slot text" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.textContent).toContain("Slot text");
      expect(panel?.textContent).not.toContain("Prop text");
    });
  });

  // ==========================================================================
  // Semantic Types
  // ==========================================================================

  describe("semantic types", () => {
    const types = ["danger", "success", "warning", "info", "muted"] as const;

    for (const type of types) {
      it(`applies danx-tooltip--${type} class for type="${type}"`, async () => {
        mountTooltip({ type });
        await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
        await vi.runAllTimersAsync();

        const panel = document.body.querySelector(".danx-tooltip");
        expect(panel?.classList.contains(`danx-tooltip--${type}`)).toBe(true);
      });
    }

    it("has no modifier class for default (blank) type", async () => {
      mountTooltip({ type: "" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      const modifierClasses = Array.from(panel?.classList ?? []).filter((c) =>
        c.startsWith("danx-tooltip--")
      );
      expect(modifierClasses).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Custom Type
  // ==========================================================================

  describe("custom type", () => {
    it("adds the correct BEM modifier class for customType", async () => {
      mountTooltip({ customType: "restart" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.classList.contains("danx-tooltip--restart")).toBe(true);
    });

    it("customType takes precedence over type", async () => {
      mountTooltip({ type: "danger", customType: "restart" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.classList.contains("danx-tooltip--restart")).toBe(true);
      expect(panel?.classList.contains("danx-tooltip--danger")).toBe(false);
    });

    it("no modifier class when neither type nor customType is set", async () => {
      mountTooltip({ type: "" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      const modifierClasses = Array.from(panel?.classList ?? []).filter((c) =>
        c.startsWith("danx-tooltip--")
      );
      expect(modifierClasses).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Placement
  // ==========================================================================

  describe("placement", () => {
    it("defaults to top placement", () => {
      mountTooltip();
      // The placement prop should be "top" by default — verified via the component's
      // withDefaults. We can't easily check the computed style in jsdom, but we verify
      // the prop is accepted and the component renders without error.
      expect(wrapper.find(".danx-tooltip-trigger").exists()).toBe(true);
    });

    it("accepts custom placement", async () => {
      mountTooltip({ placement: "bottom" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      // Panel renders — placement is forwarded to usePopoverPositioning
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();
    });
  });

  // ==========================================================================
  // Teleport
  // ==========================================================================

  describe("teleport", () => {
    it("teleports panel to body", async () => {
      mountTooltip();
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      // Panel should be a direct child of body, not inside the wrapper
      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel).not.toBeNull();
      expect(wrapper.element.querySelector(".danx-tooltip")).toBeNull();
    });
  });

  // ==========================================================================
  // Attrs Forwarding
  // ==========================================================================

  describe("attrs forwarding", () => {
    it("forwards custom attrs to panel element", async () => {
      mountTooltip({ "data-testid": "my-tooltip" });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();

      const panel = document.body.querySelector(".danx-tooltip");
      expect(panel?.getAttribute("data-testid")).toBe("my-tooltip");
    });
  });

  // ==========================================================================
  // Target with click interaction
  // ==========================================================================

  describe("target with click interaction", () => {
    it("toggles on external element click", async () => {
      const targetEl = document.createElement("button");
      targetEl.id = "click-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Click me", targetId: "click-target", interaction: "click" },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      targetEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      targetEl.remove();
    });
  });

  // ==========================================================================
  // Target with focus interaction
  // ==========================================================================

  describe("target with focus interaction", () => {
    it("shows on external element focusin and hides on focusout", async () => {
      const targetEl = document.createElement("input");
      targetEl.id = "focus-target";
      document.body.appendChild(targetEl);

      wrapper = mount(DanxTooltip, {
        props: { tooltip: "Focus me", targetId: "focus-target", interaction: "focus" },
        attachTo: document.body,
      });

      targetEl.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      targetEl.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();

      targetEl.remove();
    });
  });

  // ==========================================================================
  // Reactive disabled
  // ==========================================================================

  describe("reactive disabled", () => {
    it("hides panel when disabled becomes true while open", async () => {
      mountTooltip({ disabled: false });
      await wrapper.find(".danx-tooltip-trigger").trigger("mouseenter");
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).not.toBeNull();

      // The panel uses v-if="isOpen && !disabled", so setting disabled hides it
      await wrapper.setProps({ disabled: true });
      await vi.runAllTimersAsync();
      expect(document.body.querySelector(".danx-tooltip")).toBeNull();
    });
  });
});
