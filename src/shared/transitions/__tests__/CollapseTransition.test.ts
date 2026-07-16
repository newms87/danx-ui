import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import CollapseTransition from "../CollapseTransition.vue";

/**
 * Vue test-utils `mount` renders synchronously outside a real browser layout
 * engine, so `transitionend` never fires on its own — dispatch it manually
 * with a real property since happy-dom's `Event` constructor doesn't accept
 * `propertyName` — assign it directly instead.
 */
function transitionEndEvent(propertyName: string): Event {
  const event = new Event("transitionend");
  Object.defineProperty(event, "propertyName", { value: propertyName });
  return event;
}

const Harness = defineComponent({
  components: { CollapseTransition },
  setup() {
    const open = ref(false);
    return { open };
  },
  template: `
    <button @click="open = !open">toggle</button>
    <CollapseTransition>
      <div v-if="open" class="panel">Panel content</div>
    </CollapseTransition>
  `,
});

/** @vue/test-utils stubs <Transition> by default — disable that so the real enter/leave JS hooks run. */
function mountHarness() {
  return mount(Harness, { global: { stubs: { transition: false } } });
}

describe("CollapseTransition", () => {
  let scrollHeight = 0;

  beforeEach(() => {
    scrollHeight = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    // happy-dom always reports scrollHeight 0 (no real layout engine) — stub
    // it at the prototype level so the enter/leave hooks measure a concrete
    // "natural content height" like a real browser would.
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when the slot content is absent", () => {
    const wrapper = mountHarness();
    expect(wrapper.find(".panel").exists()).toBe(false);
  });

  it("animates height from 0 to scrollHeight on enter, then settles to auto", async () => {
    scrollHeight = 120;
    const wrapper = mountHarness();
    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    const panel = wrapper.find(".panel").element as HTMLElement;

    // requestAnimationFrame is mocked to run synchronously, so by the time
    // the enter hook returns, height has already been set to scrollHeight.
    expect(panel.style.height).toBe("120px");

    panel.dispatchEvent(transitionEndEvent("height"));
    await wrapper.vm.$nextTick();

    expect(panel.style.height).toBe("auto");
  });

  it("ignores transitionend events for properties other than height", async () => {
    scrollHeight = 80;
    const wrapper = mountHarness();
    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    const panel = wrapper.find(".panel").element as HTMLElement;

    panel.dispatchEvent(transitionEndEvent("opacity"));
    await wrapper.vm.$nextTick();

    // after-enter (height: auto) has not fired yet
    expect(panel.style.height).not.toBe("auto");

    panel.dispatchEvent(transitionEndEvent("height"));
    await wrapper.vm.$nextTick();
    expect(panel.style.height).toBe("auto");
  });

  it("animates height from scrollHeight to 0 on leave, then removes the element", async () => {
    scrollHeight = 60;
    const wrapper = mountHarness();
    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    const panel = wrapper.find(".panel").element as HTMLElement;
    panel.dispatchEvent(transitionEndEvent("height"));
    await wrapper.vm.$nextTick();

    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    // requestAnimationFrame ran synchronously, so height is already 0px
    expect(panel.style.height).toBe("0px");

    panel.dispatchEvent(transitionEndEvent("height"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".panel").exists()).toBe(false);
  });

  it("starts leaving immediately when toggled closed before the enter transition finishes", async () => {
    scrollHeight = 40;
    const wrapper = mountHarness();
    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();
    const panel = wrapper.find(".panel").element as HTMLElement;

    // Re-trigger before the enter transition's transitionend fires — Vue
    // starts the leave hook on the still-entering element rather than
    // waiting for the enter to complete first.
    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(panel.style.height).toBe("0px");
  });
});
