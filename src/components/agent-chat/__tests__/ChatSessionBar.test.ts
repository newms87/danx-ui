import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ChatSessionBar from "../ChatSessionBar.vue";
import type { ChatContextUsage, ChatModel, ChatUsageLimit } from "../types";

const USAGE: ChatContextUsage = {
  total: 1_000_000,
  segments: [
    { id: "system", label: "System", value: 40_000 },
    { id: "tools", label: "Tools", value: 15_400 },
    { id: "history", label: "Conversation", value: 300_000 },
  ],
};

const LIMITS: ChatUsageLimit[] = [
  { id: "5h", label: "5-hour limit", percent: 9, resetsAt: "2099-01-01T00:00:00.000Z" },
  { id: "week", label: "Weekly · all models", percent: 20 },
];

const MODELS: ChatModel[] = [
  { id: "fable", label: "Fable 5", shortcut: "1" },
  { id: "opus", label: "Opus 5", shortcut: "2" },
  { id: "haiku", label: "Haiku 4.5", group: "More models" },
];

/**
 * happy-dom implements no native Popover API, which DanxPopover (and so both
 * the detail popover and the model menu) relies on. Stub it the same way the
 * context-menu tests do, tracking open state per element.
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

function mountBar(props = {}) {
  return mount(ChatSessionBar, { props, attachTo: document.body });
}

describe("ChatSessionBar visibility", () => {
  // Every part is opt-in. A chat with no telemetry should show no chrome at
  // all rather than an empty strip or invented zeroes.
  it("renders nothing when given nothing", () => {
    expect(mountBar().find('[data-testid="session-bar"]').exists()).toBe(false);
  });

  it("shows only the counters when only stats are given", () => {
    const w = mountBar({ stats: { elapsedMs: 94_000, tokens: 1600, runningTasks: 1 } });

    expect(w.find('[data-testid="session-bar"]').exists()).toBe(true);
    expect(w.find('[data-testid="model-picker"]').exists()).toBe(false);
  });

  it("shows only the picker when only models are given", () => {
    const w = mountBar({ models: MODELS, modelId: "opus" });

    expect(w.find('[data-testid="model-picker"]').text()).toBe("Opus 5");
    expect(w.find('[data-testid="session-summary"]').exists()).toBe(false);
  });
});

describe("ChatSessionBar counters", () => {
  it("formats elapsed time, tokens and running tasks", () => {
    const w = mountBar({ stats: { elapsedMs: 94_000, tokens: 1600, runningTasks: 1 } });
    const text = w.text();

    expect(text).toContain("1m 34s");
    expect(text).toContain("1.6k tokens");
    expect(text).toContain("1 running task");
  });

  it("pluralises running tasks", () => {
    const w = mountBar({ stats: { runningTasks: 3 }, contextUsage: USAGE });
    expect(w.text()).toContain("3 running tasks");
  });

  it("formats hours and bare seconds", () => {
    expect(mountBar({ stats: { elapsedMs: 7_500_000 } }).text()).toContain("2h 5m");
    expect(mountBar({ stats: { elapsedMs: 45_000 } }).text()).toContain("45s");
  });

  it("abbreviates large token counts without a stray decimal", () => {
    expect(mountBar({ stats: { tokens: 355_400 } }).text()).toContain("355k tokens");
    expect(mountBar({ stats: { tokens: 900 } }).text()).toContain("900 tokens");
  });

  it("omits a counter that was not supplied", () => {
    const w = mountBar({ stats: { tokens: 100 } });
    expect(w.text()).not.toContain("running task");
  });

  it("shows the context percentage beside the counters", () => {
    const w = mountBar({ contextUsage: USAGE });
    // 355,400 of 1,000,000 → 36%
    expect(w.find('[data-testid="session-summary"]').text()).toContain("36% context");
  });

  it("reports 0% rather than NaN when the window has no capacity", () => {
    const w = mountBar({ contextUsage: { total: 0, segments: [] } });
    expect(w.find('[data-testid="session-summary"]').text()).toContain("0% context");
  });
});

describe("ChatSessionBar detail popover", () => {
  it("opens the context meter and quota rows", async () => {
    const w = mountBar({ contextUsage: USAGE, limits: LIMITS });

    await w.find('[data-testid="session-summary"]').trigger("click");
    await nextTick();

    const detail = w.find('[data-testid="session-detail"]');
    expect(detail.exists()).toBe(true);
    expect(detail.text()).toContain("Context window");
    expect(detail.text()).toContain("5-hour limit");
    expect(detail.text()).toContain("Resets");
    w.unmount();
  });

  it("uses a supplied meter label", async () => {
    const w = mountBar({ contextUsage: { ...USAGE, label: "Window" } });

    await w.find('[data-testid="session-summary"]').trigger("click");
    await nextTick();

    expect(w.find('[data-testid="session-detail"]').text()).toContain("Window");
    w.unmount();
  });

  // The popover can dismiss itself (click-outside, Escape); the summary's
  // expanded state has to follow it rather than going stale.
  it("follows the popover when it closes itself", async () => {
    const w = mountBar({ contextUsage: USAGE });
    await w.find('[data-testid="session-summary"]').trigger("click");
    await nextTick();
    expect(w.find('[data-testid="session-summary"]').attributes("aria-expanded")).toBe("true");

    w.findComponent({ name: "DanxPopover" }).vm.$emit("update:modelValue", false);
    await nextTick();

    expect(w.find('[data-testid="session-summary"]').attributes("aria-expanded")).toBe("false");
    w.unmount();
  });

  it("omits the reset time on a limit that carries none", async () => {
    const w = mountBar({ limits: [{ id: "week", label: "Weekly", percent: 20 }] });

    await w.find('[data-testid="session-summary"]').trigger("click");
    await nextTick();

    const detail = w.find('[data-testid="usage-limits"]');
    expect(detail.text()).toContain("Weekly");
    expect(detail.text()).not.toContain("Resets");
    w.unmount();
  });
});

describe("ChatSessionBar model picker", () => {
  it("marks the model in effect and shows its shortcut", async () => {
    const w = mountBar({ models: MODELS, modelId: "opus" });

    await w.find('[data-testid="model-picker"]').trigger("click");
    await nextTick();

    const items = w.findAll(".danx-context-menu__item");
    expect(items.some((i) => i.classes().includes("is-active"))).toBe(true);
    expect(w.find(".danx-context-menu__shortcut").text()).toBe("1");
    w.unmount();
  });

  it("emits the chosen model id", async () => {
    const w = mountBar({ models: MODELS, modelId: "opus" });
    await w.find('[data-testid="model-picker"]').trigger("click");
    await nextTick();

    await w.findAll(".danx-context-menu__item")[0]!.trigger("click");

    expect(w.emitted("selectModel")?.[0]).toEqual(["fable"]);
    w.unmount();
  });

  it("collapses grouped models into a submenu", async () => {
    const w = mountBar({ models: MODELS, modelId: "opus" });
    await w.find('[data-testid="model-picker"]').trigger("click");
    await nextTick();

    expect(w.text()).toContain("More models");
    w.unmount();
  });

  it("falls back to a neutral label when nothing is selected", () => {
    expect(mountBar({ models: MODELS }).find('[data-testid="model-picker"]').text()).toBe("Model");
  });

  it("carries a model's disabled state into the menu", async () => {
    const w = mountBar({ models: [{ id: "a", label: "A", disabled: true }], modelId: "b" });
    await w.find('[data-testid="model-picker"]').trigger("click");
    await nextTick();

    expect(w.find(".danx-context-menu__item").classes()).toContain("is-disabled");
    w.unmount();
  });
});
