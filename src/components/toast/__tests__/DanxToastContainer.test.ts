import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxToastContainer from "../DanxToastContainer.vue";
import { useToast } from "../useToast";

/**
 * Mock native Popover API since jsdom doesn't support it.
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

describe("DanxToastContainer", () => {
  let wrapper: VueWrapper;
  let api: ReturnType<typeof useToast>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    api = useToast();
    api.dismissAll();
    // Mount container — this sets containerMounted = true
    wrapper = mount(DanxToastContainer, {
      attachTo: document.body,
    });
  });

  afterEach(() => {
    wrapper.unmount();
    api.dismissAll();
    vi.useRealTimers();
  });

  it("sets containerMounted to true on mount", () => {
    expect(api.containerMounted.value).toBe(true);
  });

  it("sets containerMounted to false on unmount", () => {
    wrapper.unmount();
    expect(api.containerMounted.value).toBe(false);
    // Re-mount for the afterEach cleanup
    wrapper = mount(DanxToastContainer, { attachTo: document.body });
  });

  it("renders the container element", () => {
    // Teleported content is in document.body
    const container = document.querySelector(".danx-toast-container");
    expect(container).toBeTruthy();
  });

  it("renders no regions when there are no toasts", () => {
    const regions = document.querySelectorAll(".danx-toast-region");
    expect(regions).toHaveLength(0);
  });

  it("renders a region when a toast is added", async () => {
    api.toast("Hello");
    await wrapper.vm.$nextTick();
    const region = document.querySelector(".danx-toast-region--bottom-right");
    expect(region).toBeTruthy();
  });

  it("applies popover=manual on regions and calls showPopover", async () => {
    api.toast("Hello");
    await wrapper.vm.$nextTick();
    const region = document.querySelector(".danx-toast-region--bottom-right") as HTMLElement;
    expect(region).toBeTruthy();
    expect(region.getAttribute("popover")).toBe("manual");
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it("renders toast inside the correct region", async () => {
    api.toast("Top left toast", { position: "top-left" });
    await wrapper.vm.$nextTick();
    const region = document.querySelector(".danx-toast-region--top-left");
    expect(region).toBeTruthy();
    const toasts = region!.querySelectorAll(".danx-toast");
    expect(toasts).toHaveLength(1);
  });

  it("groups multiple toasts in the same region", async () => {
    api.toast("First", { position: "top-right" });
    api.toast("Second", { position: "top-right" });
    await wrapper.vm.$nextTick();
    const region = document.querySelector(".danx-toast-region--top-right");
    expect(region).toBeTruthy();
    const toasts = region!.querySelectorAll(".danx-toast");
    expect(toasts).toHaveLength(2);
  });

  it("renders toasts in separate regions for different positions", async () => {
    api.toast("Top", { position: "top-center" });
    api.toast("Bottom", { position: "bottom-center" });
    await wrapper.vm.$nextTick();
    const topRegion = document.querySelector(".danx-toast-region--top-center");
    const bottomRegion = document.querySelector(".danx-toast-region--bottom-center");
    expect(topRegion).toBeTruthy();
    expect(bottomRegion).toBeTruthy();
  });

  it("removes region when all toasts in it are dismissed", async () => {
    const id = api.toast("Temp", { position: "center-center" });
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".danx-toast-region--center-center")).toBeTruthy();
    api.dismiss(id);
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".danx-toast-region--center-center")).toBeFalsy();
  });

  it("renders element-targeted toasts inside a target region", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    api.toast("Targeted", { target });
    await wrapper.vm.$nextTick();

    // Should be inside a targeted region
    const targetRegion = document.querySelector(".danx-toast-region--targeted");
    expect(targetRegion).toBeTruthy();
    const toastsInRegion = targetRegion!.querySelectorAll(".danx-toast");
    expect(toastsInRegion).toHaveLength(1);

    target.remove();
  });

  it("groups multiple toasts on the same target in one target region", async () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    api.toast("First targeted", { target });
    api.toast("Second targeted", { target });
    await wrapper.vm.$nextTick();

    const targetRegions = document.querySelectorAll(".danx-toast-region--targeted");
    expect(targetRegions).toHaveLength(1);
    const toasts = targetRegions[0]!.querySelectorAll(".danx-toast");
    expect(toasts).toHaveLength(2);

    target.remove();
  });

  it("creates separate target regions for different target elements", async () => {
    const target1 = document.createElement("div");
    const target2 = document.createElement("div");
    document.body.appendChild(target1);
    document.body.appendChild(target2);
    api.toast("Target 1", { target: target1 });
    api.toast("Target 2", { target: target2 });
    await wrapper.vm.$nextTick();

    const targetRegions = document.querySelectorAll(".danx-toast-region--targeted");
    expect(targetRegions).toHaveLength(2);

    target1.remove();
    target2.remove();
  });
});
