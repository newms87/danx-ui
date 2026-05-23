import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, markRaw, nextTick } from "vue";
import DanxZoomable from "../DanxZoomable.vue";

const attachedWrappers: VueWrapper[] = [];
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);
  while (attachedWrappers.length > 0) attachedWrappers.pop()?.unmount();
  warnSpy.mockRestore();
});

function mountZoomable(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(DanxZoomable, { props, slots, attachTo: document.body });
  attachedWrappers.push(wrapper);
  return wrapper;
}

describe("DanxZoomable", () => {
  it("renders root with tabindex=0 and default slot inside the transformed content", () => {
    const wrapper = mountZoomable({}, { default: '<div class="probe">child</div>' });
    expect(wrapper.classes()).toContain("danx-zoomable");
    expect(wrapper.attributes("tabindex")).toBe("0");
    const content = wrapper.find(".danx-zoomable__content");
    expect(content.exists()).toBe(true);
    expect(content.find(".probe").exists()).toBe(true);
  });

  it("applies transform style reflecting zoom and pan models", async () => {
    const wrapper = mountZoomable({ zoom: 150, pan: { x: 20, y: 30 } });
    await nextTick();
    const style = wrapper.find(".danx-zoomable__content").attributes("style") || "";
    expect(style).toContain("scale(1.5)");
    expect(style).toContain("translate(20px, 30px)");
  });

  it("emits update:zoom when wheel zoom fires", () => {
    const wrapper = mountZoomable({ zoom: 100 });
    const wheel = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
    Object.defineProperty(wheel, "ctrlKey", { value: true });
    wrapper.element.dispatchEvent(wheel);
    expect(wrapper.emitted("update:zoom")?.[0]).toEqual([110]);
  });

  it("renders the modifier hint by default", () => {
    const wrapper = mountZoomable();
    const hint = wrapper.find(".danx-zoomable__hint");
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toMatch(/drag to pan/);
  });

  it("hides the hint when showHint=false", () => {
    const wrapper = mountZoomable({ showHint: false });
    expect(wrapper.find(".danx-zoomable__hint").exists()).toBe(false);
  });

  it("hides the hint when keyboardDisabled (hint advertises keyboard gestures)", () => {
    const wrapper = mountZoomable({ keyboardDisabled: true });
    expect(wrapper.find(".danx-zoomable__hint").exists()).toBe(false);
  });

  it("hint omits pan copy when panDisabled", () => {
    const wrapper = mountZoomable({ panDisabled: true });
    expect(wrapper.find(".danx-zoomable__hint").text()).not.toMatch(/drag to pan/);
    expect(wrapper.find(".danx-zoomable__hint").text()).toMatch(/scroll to zoom/);
  });

  it("renders controls slot inside the controls overlay", () => {
    const wrapper = mountZoomable({}, { controls: '<div class="custom-ctrl" />' });
    const overlay = wrapper.find(".danx-zoomable__controls");
    expect(overlay.exists()).toBe(true);
    expect(overlay.find(".custom-ctrl").exists()).toBe(true);
  });

  it("does not render controls overlay when slot empty", () => {
    const wrapper = mountZoomable();
    expect(wrapper.find(".danx-zoomable__controls").exists()).toBe(false);
  });

  it("mounts drag overlay while modifier key held", async () => {
    const wrapper = mountZoomable();
    expect(wrapper.find(".danx-zoomable__drag-overlay").exists()).toBe(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
    await nextTick();
    expect(wrapper.find(".danx-zoomable__drag-overlay").exists()).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Control", ctrlKey: false }));
    await nextTick();
    expect(wrapper.find(".danx-zoomable__drag-overlay").exists()).toBe(false);
  });

  it("does not mount drag overlay when panDisabled even with modifier held", async () => {
    const wrapper = mountZoomable({ panDisabled: true });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
    await nextTick();
    expect(wrapper.find(".danx-zoomable__drag-overlay").exists()).toBe(false);
  });

  it("dblclick resets zoom and pan", async () => {
    const wrapper = mountZoomable({ zoom: 200, pan: { x: 50, y: 50 } });
    await wrapper.trigger("dblclick");
    const zoomEmits = wrapper.emitted("update:zoom");
    const panEmits = wrapper.emitted("update:pan");
    expect(zoomEmits?.[zoomEmits.length - 1]).toEqual([100]);
    expect(panEmits?.[panEmits.length - 1]).toEqual([{ x: 0, y: 0 }]);
  });

  it("applies is-pan-ready class when modifier held and not dragging", async () => {
    const wrapper = mountZoomable();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
    await nextTick();
    expect(wrapper.classes()).toContain("is-pan-ready");
  });

  it("applies is-dragging class while dragging", async () => {
    const wrapper = mountZoomable();
    await wrapper.trigger("mousedown", { button: 0, ctrlKey: true, clientX: 0, clientY: 0 });
    expect(wrapper.classes()).toContain("is-dragging");
    window.dispatchEvent(new MouseEvent("mouseup"));
    await nextTick();
    expect(wrapper.classes()).not.toContain("is-dragging");
  });

  // Regression: DanxDialog (and similar containers) stop propagation of
  // mousemove / mouseup on their content. The window-level drag listeners run
  // in the CAPTURE phase so they fire before any descendant's bubble-phase
  // stopPropagation — drag-pan must still work inside such a container.
  it("drag-pan survives an ancestor that stops mousemove propagation (dialog scenario)", async () => {
    const Trap = defineComponent({
      components: { DanxZoomable: markRaw(DanxZoomable) },
      template: `
        <div class="trap" @mousemove.stop @mouseup.stop @keydown.stop @keyup.stop>
          <DanxZoomable :zoom="100" :pan="{ x: 0, y: 0 }" />
        </div>
      `,
    });
    const wrapper = mount(Trap, { attachTo: document.body });
    attachedWrappers.push(wrapper);

    const zoomable = wrapper.findComponent(DanxZoomable);
    await zoomable.find(".danx-zoomable").trigger("mousedown", {
      button: 0,
      ctrlKey: true,
      clientX: 0,
      clientY: 0,
    });
    // Dispatch a real bubbling mousemove from inside the trap — the trap's
    // bubble-phase @mousemove.stop would block a window bubble listener, but
    // the capture-phase listener fires on the way down regardless.
    zoomable
      .find(".danx-zoomable__content")
      .element.dispatchEvent(
        new MouseEvent("mousemove", { bubbles: true, clientX: 40, clientY: 30 })
      );
    await nextTick();
    const panEmits = zoomable.emitted("update:pan");
    expect(panEmits?.[panEmits.length - 1]).toEqual([{ x: 40, y: 30 }]);
    window.dispatchEvent(new MouseEvent("mouseup"));
  });
});
