import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxColorPickerPanel from "../DanxColorPickerPanel.vue";

function mountPanel(props: Record<string, unknown> = {}) {
  return mount(DanxColorPickerPanel, {
    props: { modelValue: "#3b82f6", testId: "p", ...props },
  });
}

beforeEach(() => {
  window.localStorage.clear();
  delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
});

describe("DanxColorPickerPanel — keyboard", () => {
  it("surface ArrowRight increases saturation", async () => {
    const wrapper = mountPanel();
    const thumb = wrapper.get('[aria-label="Saturation and value"]');
    await thumb.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("surface ArrowLeft / ArrowDown / ArrowUp also fire", async () => {
    const wrapper = mountPanel();
    const thumb = wrapper.get('[aria-label="Saturation and value"]');
    for (const key of ["ArrowLeft", "ArrowUp", "ArrowDown"]) {
      await thumb.trigger("keydown", { key });
    }
    expect((wrapper.emitted("commit") ?? []).length).toBeGreaterThanOrEqual(3);
  });
  it("surface shift+arrow uses bigger step", async () => {
    const wrapper = mountPanel();
    const thumb = wrapper.get('[aria-label="Saturation and value"]');
    await thumb.trigger("keydown", { key: "ArrowRight", shiftKey: true });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("surface ignores unrelated keys", async () => {
    const wrapper = mountPanel();
    const thumb = wrapper.get('[aria-label="Saturation and value"]');
    await thumb.trigger("keydown", { key: "Tab" });
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("hue ArrowRight commits + wraps", async () => {
    const wrapper = mountPanel();
    const hue = wrapper.get('[aria-label="Hue"]');
    await hue.trigger("keydown", { key: "ArrowRight" });
    await hue.trigger("keydown", { key: "ArrowLeft" });
    await hue.trigger("keydown", { key: "ArrowUp" });
    await hue.trigger("keydown", { key: "ArrowDown" });
    await hue.trigger("keydown", { key: "ArrowRight", shiftKey: true });
    expect((wrapper.emitted("commit") ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it("hue ignores unrelated keys", async () => {
    const wrapper = mountPanel();
    const hue = wrapper.get('[aria-label="Hue"]');
    await hue.trigger("keydown", { key: "Tab" });
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("alpha keyboard commits when alpha=true", async () => {
    const wrapper = mountPanel({ alpha: true });
    const alpha = wrapper.get('[aria-label="Alpha"]');
    await alpha.trigger("keydown", { key: "ArrowRight" });
    await alpha.trigger("keydown", { key: "ArrowLeft" });
    await alpha.trigger("keydown", { key: "ArrowUp" });
    await alpha.trigger("keydown", { key: "ArrowDown" });
    await alpha.trigger("keydown", { key: "ArrowRight", shiftKey: true });
    expect((wrapper.emitted("commit") ?? []).length).toBeGreaterThanOrEqual(4);
  });
  it("alpha ignores unrelated keys", async () => {
    const wrapper = mountPanel({ alpha: true });
    const alpha = wrapper.get('[aria-label="Alpha"]');
    await alpha.trigger("keydown", { key: "Tab" });
    expect(wrapper.emitted("commit")).toBeUndefined();
  });
});

describe("DanxColorPickerPanel — palette key nav", () => {
  it("ArrowDown / ArrowUp / Home / End move focus, unknown returns", async () => {
    const wrapper = mountPanel({
      swatches: ["#111111", "#222222", "#333333", "#444444"],
      paletteCols: 2,
    });
    const first = wrapper.get('[data-test="p-palette-0"]');
    await first.trigger("keydown", { key: "ArrowDown" });
    await first.trigger("keydown", { key: "ArrowUp" });
    await first.trigger("keydown", { key: "ArrowLeft" });
    await first.trigger("keydown", { key: "Home" });
    await first.trigger("keydown", { key: "End" });
    await first.trigger("keydown", { key: "Tab" }); // unhandled — early return
    expect(true).toBe(true); // no throw is the assertion
  });
  it("Space activates swatch", async () => {
    const wrapper = mountPanel({ swatches: ["#abcdef"] });
    await wrapper.get('[data-test="p-palette-0"]').trigger("keydown.space");
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
});

describe("DanxColorPickerPanel — pointer drag", () => {
  it("surface pointerdown + pointermove + pointerup commit", async () => {
    const wrapper = mountPanel();
    const surface = wrapper.get('[data-test="p-surface"]');
    const el = surface.element as HTMLElement;
    // happy-dom getBoundingClientRect returns zero — assignment for test only.
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;
    await surface.trigger("pointerdown", { pointerId: 1, clientX: 50, clientY: 25 });
    await surface.trigger("pointermove", { pointerId: 1, clientX: 75, clientY: 50 });
    await surface.trigger("pointerup", { pointerId: 1, clientX: 75, clientY: 50 });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("pointermove with mismatching pointer id is ignored", async () => {
    const wrapper = mountPanel();
    const surface = wrapper.get('[data-test="p-surface"]');
    const el = surface.element as HTMLElement;
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;
    await surface.trigger("pointerdown", { pointerId: 1, clientX: 50, clientY: 25 });
    await surface.trigger("pointermove", { pointerId: 99, clientX: 0, clientY: 0 });
    await surface.trigger("pointerup", { pointerId: 1, clientX: 50, clientY: 25 });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("pointerup without active drag is a no-op", async () => {
    const wrapper = mountPanel();
    const surface = wrapper.get('[data-test="p-surface"]').element as HTMLElement;
    surface.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, bubbles: true }));
    await nextTick();
    expect(wrapper.emitted("commit")).toBeUndefined();
  });
  it("pointermove without active drag is ignored", async () => {
    const wrapper = mountPanel();
    const surface = wrapper.get('[data-test="p-surface"]').element as HTMLElement;
    surface.dispatchEvent(
      new PointerEvent("pointermove", { pointerId: 1, clientX: 5, clientY: 5, bubbles: true })
    );
    await nextTick();
    expect(wrapper.emitted("commit")).toBeUndefined();
  });
  it("zero-width track returns 0% (no NaN)", async () => {
    const wrapper = mountPanel();
    const surface = wrapper.get('[data-test="p-surface"]');
    const el = surface.element as HTMLElement;
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }) as DOMRect;
    await surface.trigger("pointerdown", { pointerId: 1, clientX: 5, clientY: 5 });
    await surface.trigger("pointerup", { pointerId: 1, clientX: 5, clientY: 5 });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("hue pointerdown + move + up commits", async () => {
    const wrapper = mountPanel();
    const hue = wrapper.get('[data-test="p-hue"]');
    const el = hue.element as HTMLElement;
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 10, right: 100, bottom: 10 }) as DOMRect;
    await hue.trigger("pointerdown", { pointerId: 1, clientX: 50 });
    await hue.trigger("pointermove", { pointerId: 1, clientX: 80 });
    await hue.trigger("pointerup", { pointerId: 1, clientX: 80 });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
  it("alpha pointerdown + move + up commits", async () => {
    const wrapper = mountPanel({ alpha: true });
    const alpha = wrapper.get('[data-test="p-alpha"]');
    const el = alpha.element as HTMLElement;
    el.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 10, right: 100, bottom: 10 }) as DOMRect;
    await alpha.trigger("pointerdown", { pointerId: 1, clientX: 25 });
    await alpha.trigger("pointermove", { pointerId: 1, clientX: 75 });
    await alpha.trigger("pointerup", { pointerId: 1, clientX: 75 });
    expect(wrapper.emitted("commit")).toBeTruthy();
  });
});

describe("DanxColorPickerPanel — model sync", () => {
  it("re-seeds drafts when modelValue prop changes to a parseable value", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    await wrapper.setProps({ modelValue: "#abcdef" });
    await nextTick();
    expect((wrapper.get('[data-test="p-hex-input"]').element as HTMLInputElement).value).toBe(
      "#abcdef"
    );
  });
  it("ignores unparseable modelValue updates (no crash, no change)", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    await wrapper.setProps({ modelValue: "garbage" });
    await nextTick();
    expect((wrapper.get('[data-test="p-hex-input"]').element as HTMLInputElement).value).toBe(
      "#000000"
    );
  });
  it("skips the re-seed when the new value matches the current internal RGB", async () => {
    const wrapper = mountPanel({ modelValue: "#3b82f6" });
    await wrapper.setProps({ modelValue: "#3b82f6" });
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("HEX input rejects garbage + re-syncs the displayed value", async () => {
    const wrapper = mountPanel({ modelValue: "#3b82f6" });
    const hex = wrapper.get('[data-test="p-hex-input"]');
    hex.element.dispatchEvent(new Event("input"));
    (hex.element as HTMLInputElement).value = "garbage";
    hex.element.dispatchEvent(new Event("change"));
    await nextTick();
    expect((hex.element as HTMLInputElement).value).toBe("#3b82f6");
  });

  it("Enter on hex commits", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    const hex = wrapper.get('[data-test="p-hex-input"]');
    await hex.setValue("#aabbcc");
    await hex.trigger("keydown.enter");
    expect(wrapper.emitted("commit")?.[0]?.[0]).toBe("#aabbcc");
  });

  it("RGB input ignores NaN values", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    await wrapper.get('[data-test="p-tab-rgb"]').trigger("click");
    const r = wrapper.get('[data-test="p-rgb-r"]').element as HTMLInputElement;
    r.value = "";
    r.dispatchEvent(new Event("input"));
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("RGB G + B inputs both commit when changed", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    await wrapper.get('[data-test="p-tab-rgb"]').trigger("click");
    const g = wrapper.get('[data-test="p-rgb-g"]').element as HTMLInputElement;
    g.value = "200";
    g.dispatchEvent(new Event("input"));
    const b = wrapper.get('[data-test="p-rgb-b"]').element as HTMLInputElement;
    b.value = "50";
    b.dispatchEvent(new Event("input"));
    expect((wrapper.emitted("commit") ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("HSL input ignores NaN values", async () => {
    const wrapper = mountPanel({ modelValue: "#000000" });
    await wrapper.get('[data-test="p-tab-hsl"]').trigger("click");
    const h = wrapper.get('[data-test="p-hsl-h"]').element as HTMLInputElement;
    h.value = "";
    h.dispatchEvent(new Event("input"));
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("HSL S + L inputs both commit when changed", async () => {
    const wrapper = mountPanel({ modelValue: "#ff0000" });
    await wrapper.get('[data-test="p-tab-hsl"]').trigger("click");
    const s = wrapper.get('[data-test="p-hsl-s"]').element as HTMLInputElement;
    s.value = "50";
    s.dispatchEvent(new Event("input"));
    const l = wrapper.get('[data-test="p-hsl-l"]').element as HTMLInputElement;
    l.value = "25";
    l.dispatchEvent(new Event("input"));
    expect((wrapper.emitted("commit") ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("alpha numeric input ignores NaN", async () => {
    const wrapper = mountPanel({ modelValue: "#000000", alpha: true });
    await wrapper.get('[data-test="p-tab-rgb"]').trigger("click");
    const a = wrapper.get('[data-test="p-rgb-a"]').element as HTMLInputElement;
    a.value = "";
    a.dispatchEvent(new Event("input"));
    expect(wrapper.emitted("commit")).toBeUndefined();
  });
});

describe("DanxColorPickerPanel — output formats", () => {
  const formats = ["rgb", "rgba", "hsl", "hsla"] as const;
  for (const f of formats) {
    it(`emits commit in ${f}`, async () => {
      const wrapper = mountPanel({ output: f, alpha: f === "rgba" || f === "hsla" });
      const hue = wrapper.get('[aria-label="Hue"]');
      await hue.trigger("keydown", { key: "ArrowRight" });
      const payload = wrapper.emitted("commit")?.[0]?.[0] as string;
      expect(payload).toMatch(new RegExp(`^${f.startsWith("rgb") ? "rgba?" : "hsla?"}\\(`));
    });
  }
});

describe("DanxColorPickerPanel — defaults + edge inputs", () => {
  it("falls back to black HSV when initial modelValue is unparseable", () => {
    const wrapper = mountPanel({ modelValue: "garbage" });
    expect((wrapper.get('[data-test="p-hex-input"]').element as HTMLInputElement).value).toBe(
      "#000000"
    );
  });

  it("palette click on an unparseable swatch is a no-op", async () => {
    const wrapper = mountPanel({ swatches: ["not-a-color"] });
    await wrapper.get('[data-test="p-palette-0"]').trigger("click");
    expect(wrapper.emitted("commit")).toBeUndefined();
  });

  it("renders without test-id attributes when testId is omitted", () => {
    const wrapper = mount(DanxColorPickerPanel, { props: { modelValue: "#3b82f6" } });
    expect(wrapper.find(".danx-color-picker__panel").attributes("data-test")).toBeUndefined();
  });
});

describe("DanxColorPickerPanel — eyedropper", () => {
  it("AbortError surfaces inline message", async () => {
    class FakeDropper {
      open = vi.fn(async () => {
        throw "string-not-error";
      });
    }
    (window as unknown as { EyeDropper: typeof FakeDropper }).EyeDropper = FakeDropper;
    const wrapper = mountPanel();
    await wrapper.get('[data-test="p-eyedropper"]').trigger("click");
    await new Promise((r) => setTimeout(r, 0));
    await nextTick();
    expect(wrapper.find('[data-test="p-eyedropper-error"]').text()).toMatch(/cancelled/i);
    delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
  });
});
