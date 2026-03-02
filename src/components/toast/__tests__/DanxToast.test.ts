import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxToast from "../DanxToast.vue";
import type { ToastEntry } from "../types";
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

function createEntry(overrides: Partial<ToastEntry> = {}): ToastEntry {
  return {
    id: "test-1",
    message: "Test toast",
    variant: "",
    position: "bottom-right",
    duration: 5000,
    dismissible: true,
    targetPlacement: "top",
    count: 1,
    createdAt: Date.now(),
    ...overrides,
  };
}

function mountToast(entry: ToastEntry): VueWrapper {
  return mount(DanxToast, {
    props: { entry },
  });
}

describe("DanxToast", () => {
  let wrappers: VueWrapper[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrappers = [];
    const { dismissAll, containerMounted } = useToast();
    dismissAll();
    containerMounted.value = true;
  });

  afterEach(() => {
    for (const w of wrappers) w.unmount();
    wrappers.length = 0;
    vi.useRealTimers();
  });

  function createAndTrack(entry: ToastEntry): VueWrapper {
    const w = mountToast(entry);
    wrappers.push(w);
    return w;
  }

  it("does not have popover attribute (positioning is handled by region)", () => {
    const wrapper = createAndTrack(createEntry());
    expect(wrapper.find(".danx-toast").attributes("popover")).toBeUndefined();
  });

  it("renders the message text", () => {
    const wrapper = createAndTrack(createEntry({ message: "Hello World" }));
    expect(wrapper.find(".danx-toast__content").text()).toBe("Hello World");
  });

  it("renders variant icon for success", () => {
    const wrapper = createAndTrack(createEntry({ variant: "success" }));
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(true);
  });

  it("renders variant icon for danger", () => {
    const wrapper = createAndTrack(createEntry({ variant: "danger" }));
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(true);
  });

  it("renders variant icon for warning", () => {
    const wrapper = createAndTrack(createEntry({ variant: "warning" }));
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(true);
  });

  it("renders variant icon for info", () => {
    const wrapper = createAndTrack(createEntry({ variant: "info" }));
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(true);
  });

  it("does not render icon for empty variant", () => {
    const wrapper = createAndTrack(createEntry({ variant: "" }));
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(false);
  });

  it("renders close button when dismissible", () => {
    const wrapper = createAndTrack(createEntry({ dismissible: true }));
    expect(wrapper.find(".danx-toast__close").exists()).toBe(true);
  });

  it("does not render close button when not dismissible", () => {
    const wrapper = createAndTrack(createEntry({ dismissible: false }));
    expect(wrapper.find(".danx-toast__close").exists()).toBe(false);
  });

  it("renders progress bar when duration > 0", () => {
    const wrapper = createAndTrack(createEntry({ duration: 3000 }));
    expect(wrapper.find(".danx-toast__progress").exists()).toBe(true);
  });

  it("does not render progress bar when duration is 0", () => {
    const wrapper = createAndTrack(createEntry({ duration: 0 }));
    expect(wrapper.find(".danx-toast__progress").exists()).toBe(false);
  });

  it("renders badge when count > 1", () => {
    const wrapper = createAndTrack(createEntry({ count: 3 }));
    expect(wrapper.find(".danx-toast__badge").exists()).toBe(true);
  });

  it("does not render badge when count is 1", () => {
    const wrapper = createAndTrack(createEntry({ count: 1 }));
    expect(wrapper.find(".danx-toast__badge").exists()).toBe(false);
  });

  it("dismisses on close button click", async () => {
    const entry = createEntry({ id: "dismiss-test" });
    const { toasts, toast } = useToast();

    // Add toast through the composable so it's tracked
    toast(entry.message);
    const tracked = toasts.value[0]!;
    const wrapper = createAndTrack(tracked);

    await wrapper.find(".danx-toast__close").trigger("click");
    expect(toasts.value.find((t) => t.id === tracked.id)).toBeUndefined();
  });

  it("auto-dismisses after duration elapses", () => {
    const { toast, toasts } = useToast();
    toast("Auto dismiss", { duration: 1000 });
    const entry = toasts.value[0]!;
    createAndTrack(entry);

    vi.advanceTimersByTime(1000);
    expect(toasts.value.find((t) => t.id === entry.id)).toBeUndefined();
  });

  it("pauses timer on mouseenter and resumes on mouseleave", async () => {
    const { toast, toasts } = useToast();
    toast("Hover test", { duration: 1000 });
    const entry = toasts.value[0]!;
    const wrapper = createAndTrack(entry);

    vi.advanceTimersByTime(300);
    await wrapper.find(".danx-toast").trigger("mouseenter");
    vi.advanceTimersByTime(5000);
    // Should still exist because timer is paused
    expect(toasts.value.find((t) => t.id === entry.id)).toBeTruthy();

    await wrapper.find(".danx-toast").trigger("mouseleave");
    vi.advanceTimersByTime(700);
    expect(toasts.value.find((t) => t.id === entry.id)).toBeUndefined();
  });

  it("renders custom content via default slot", () => {
    const entry = createEntry();
    const wrapper = mount(DanxToast, {
      props: { entry },
      slots: {
        default: '<strong class="custom">Custom content</strong>',
        icon: "",
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.find(".custom").text()).toBe("Custom content");
  });

  it("applies variant styles via useVariant", () => {
    const wrapper = createAndTrack(createEntry({ variant: "danger" }));
    const style = wrapper.find(".danx-toast").attributes("style") ?? "";
    expect(style).toContain("--dx-toast-bg");
  });

  it("renders icon slot when provided without default icon", () => {
    const entry = createEntry({ variant: "" });
    const wrapper = mount(DanxToast, {
      props: { entry },
      slots: {
        icon: '<span class="custom-icon">!</span>',
        default: "",
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.find(".danx-toast__icon").exists()).toBe(true);
    expect(wrapper.find(".custom-icon").text()).toBe("!");
  });

  it("uses danger badge variant for non-danger toasts", () => {
    const wrapper = createAndTrack(createEntry({ count: 3, variant: "success" }));
    const badge = wrapper.findComponent({ name: "DanxBadge" });
    expect(badge.props("variant")).toBe("danger");
  });

  it("uses warning badge variant for danger toasts", () => {
    const wrapper = createAndTrack(createEntry({ count: 3, variant: "danger" }));
    const badge = wrapper.findComponent({ name: "DanxBadge" });
    expect(badge.props("variant")).toBe("warning");
  });

  it("resets dedup timer when duplicate toast is added", () => {
    const { toast, toasts } = useToast();
    toast("Dedup test", { duration: 1000 });
    const entry = toasts.value[0]!;
    createAndTrack(entry);

    // Advance partway, then send duplicate to reset timer
    vi.advanceTimersByTime(800);
    toast("Dedup test", { duration: 1000 });

    // After another 800ms the toast should still exist (timer was reset)
    vi.advanceTimersByTime(800);
    expect(toasts.value.find((t) => t.id === entry.id)).toBeTruthy();

    // After the full duration from reset, it should dismiss
    vi.advanceTimersByTime(200);
    expect(toasts.value.find((t) => t.id === entry.id)).toBeUndefined();
  });
});
