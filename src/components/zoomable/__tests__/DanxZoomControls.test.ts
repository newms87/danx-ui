import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxZoomControls from "../DanxZoomControls.vue";

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

function mountControls(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxZoomControls, {
    props: { zoom: 100, ...props },
    attachTo: document.body,
  });
  attachedWrappers.push(wrapper);
  return wrapper;
}

describe("DanxZoomControls", () => {
  it("renders slider, readout, and reset button", () => {
    const wrapper = mountControls({ zoom: 75 });
    expect(wrapper.find(".danx-zoom-controls__slider").exists()).toBe(true);
    expect(wrapper.find(".danx-zoom-controls__readout").exists()).toBe(true);
    expect(wrapper.find(".danx-zoom-controls__readout").text()).toBe("75%");
  });

  it("hides readout in compact mode", () => {
    const wrapper = mountControls({ compact: true });
    expect(wrapper.find(".danx-zoom-controls__readout").exists()).toBe(false);
  });

  it("reset button sets zoom to 100 and emits reset", async () => {
    const wrapper = mountControls({ zoom: 250 });
    await wrapper.find("button").trigger("click");
    const zoomEmits = wrapper.emitted("update:zoom");
    expect(zoomEmits?.[zoomEmits.length - 1]).toEqual([100]);
    expect(wrapper.emitted("reset")).toHaveLength(1);
  });

  it("passes min/max/step to the slider", () => {
    const wrapper = mountControls({ min: 50, max: 200, step: 5 });
    const slider = wrapper.findComponent({ name: "DanxRangeSlider" });
    expect(slider.props("min")).toBe(50);
    expect(slider.props("max")).toBe(200);
    expect(slider.props("step")).toBe(5);
  });

  it("emits update:zoom when the slider updates", async () => {
    const wrapper = mountControls({ zoom: 100 });
    const slider = wrapper.findComponent({ name: "DanxRangeSlider" });
    slider.vm.$emit("update:modelValue", 175);
    await wrapper.vm.$nextTick();
    const zoomEmits = wrapper.emitted("update:zoom");
    expect(zoomEmits?.[zoomEmits.length - 1]).toEqual([175]);
  });
});
