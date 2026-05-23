import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxFileViewerToolbar from "../DanxFileViewerToolbar.vue";
import type { Layout } from "../types";

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
      layout: "horizontal" as Layout,
      zoom: 100,
      availableLayouts: ["horizontal", "vertical", "continuous"] as Layout[],
      zoomable: true,
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe("DanxFileViewerToolbar", () => {
  it("renders layout button group with one button per available layout", () => {
    const wrapper = mountToolbar({ availableLayouts: ["horizontal", "vertical"] });
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    expect(group.exists()).toBe(true);
    expect((group.props("buttons") as Array<{ value: string }>).map((b) => b.value)).toEqual([
      "horizontal",
      "vertical",
    ]);
  });

  it("hides layout button group when only one layout is available", () => {
    const wrapper = mountToolbar({ availableLayouts: ["horizontal"] });
    expect(wrapper.findComponent({ name: "DanxButtonGroup" }).exists()).toBe(false);
  });

  it("renders zoom controls when zoomable=true", () => {
    const wrapper = mountToolbar({ zoomable: true });
    expect(wrapper.findComponent({ name: "DanxZoomControls" }).exists()).toBe(true);
  });

  it("does not render zoom controls when zoomable=false", () => {
    const wrapper = mountToolbar({ zoomable: false });
    expect(wrapper.findComponent({ name: "DanxZoomControls" }).exists()).toBe(false);
  });

  it("emits update:layout when a layout button is selected", async () => {
    const wrapper = mountToolbar();
    const group = wrapper.findComponent({ name: "DanxButtonGroup" });
    group.vm.$emit("select", "vertical");
    const emits = wrapper.emitted("update:layout");
    expect(emits?.[emits.length - 1]).toEqual(["vertical"]);
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
