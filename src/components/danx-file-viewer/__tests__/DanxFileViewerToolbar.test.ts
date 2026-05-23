import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxFileViewerToolbar from "../DanxFileViewerToolbar.vue";
import type { LayoutToggle } from "../types";

const wrappers: VueWrapper[] = [];
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);
  while (wrappers.length > 0) wrappers.pop()?.unmount();
  warnSpy.mockRestore();
});

function mountToolbar(props: Partial<Record<string, unknown>> = {}) {
  const wrapper = mount(DanxFileViewerToolbar, {
    props: {
      sidebar: false,
      continuous: false,
      zoom: 100,
      layoutToggles: ["sidebar", "continuous"] as LayoutToggle[],
      zoomable: true,
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe("DanxFileViewerToolbar", () => {
  it("renders one button per available toggle", () => {
    const wrapper = mountToolbar({ layoutToggles: ["sidebar"] });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    expect(group.exists()).toBe(true);
    expect((group.props("buttons") as Array<{ value: string }>).map((b) => b.value)).toEqual([
      "sidebar",
    ]);
  });

  it("hides the toggle group when layoutToggles is empty", () => {
    const wrapper = mountToolbar({ layoutToggles: [] });
    expect(wrapper.findComponent({ name: "DanxButtonGroup" }).exists()).toBe(false);
  });

  it("renders the button group in multi-select mode (any combination)", () => {
    const wrapper = mountToolbar();
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    expect(group.props("multiple")).toBe(true);
  });

  it("renders zoom controls when zoomable=true", () => {
    const wrapper = mountToolbar({ zoomable: true });
    expect(wrapper.findComponent({ name: "DanxZoomControls" }).exists()).toBe(true);
  });

  it("does not render zoom controls when zoomable=false", () => {
    const wrapper = mountToolbar({ zoomable: false });
    expect(wrapper.findComponent({ name: "DanxZoomControls" }).exists()).toBe(false);
  });

  it("emits update:sidebar when sidebar is toggled on", async () => {
    const wrapper = mountToolbar({ sidebar: false, continuous: false });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    group.vm.$emit("update:modelValue", ["sidebar"]);
    const emits = wrapper.emitted("update:sidebar");
    expect(emits?.[emits.length - 1]).toEqual([true]);
  });

  it("emits update:continuous when continuous is toggled on", async () => {
    const wrapper = mountToolbar({ sidebar: false, continuous: false });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    group.vm.$emit("update:modelValue", ["continuous"]);
    const emits = wrapper.emitted("update:continuous");
    expect(emits?.[emits.length - 1]).toEqual([true]);
  });

  it("supports both toggles selected at once", async () => {
    const wrapper = mountToolbar({ sidebar: false, continuous: false });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    group.vm.$emit("update:modelValue", ["sidebar", "continuous"]);
    expect(wrapper.emitted("update:sidebar")?.[0]).toEqual([true]);
    expect(wrapper.emitted("update:continuous")?.[0]).toEqual([true]);
  });

  it("emits both toggles off when group is cleared", async () => {
    const wrapper = mountToolbar({ sidebar: true, continuous: true });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    group.vm.$emit("update:modelValue", []);
    expect(wrapper.emitted("update:sidebar")?.[0]).toEqual([false]);
    expect(wrapper.emitted("update:continuous")?.[0]).toEqual([false]);
  });

  it("active toggles reflect current sidebar/continuous prop state", () => {
    const wrapper = mountToolbar({ sidebar: true, continuous: false });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    expect(group.props("modelValue")).toEqual(["sidebar"]);
  });

  it("emits update:zoom when zoom controls update", async () => {
    const wrapper = mountToolbar();
    const controls = wrapper.findComponent({ name: "DanxZoomControls" });
    controls.vm.$emit("update:zoom", 175);
    const emits = wrapper.emitted("update:zoom");
    expect(emits?.[emits.length - 1]).toEqual([175]);
  });

  it("emits resetZoom when zoom controls fire reset", async () => {
    const wrapper = mountToolbar();
    const controls = wrapper.findComponent({ name: "DanxZoomControls" });
    controls.vm.$emit("reset");
    expect(wrapper.emitted("resetZoom")).toHaveLength(1);
  });

  it("forwards zoom min/max/step props to controls", () => {
    const wrapper = mountToolbar({ zoomMin: 50, zoomMax: 200, zoomStep: 25 });
    const controls = wrapper.findComponent({ name: "DanxZoomControls" });
    expect(controls.props("min")).toBe(50);
    expect(controls.props("max")).toBe(200);
    expect(controls.props("step")).toBe(25);
  });
});
