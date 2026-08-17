import { describe, it, expect, vi } from "vitest";
import { defineComponent, markRaw, nextTick, ref, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { useChatAutoScroll, type UseChatAutoScrollReturn } from "../useChatAutoScroll";

/**
 * The composable registers onBeforeUnmount, so it must be created inside a
 * mounted component or Vue warns about a missing instance.
 */
function createAutoScroll(container: Ref<HTMLElement | null>, trigger: () => unknown) {
  let api!: UseChatAutoScrollReturn;
  const wrapper = mount(
    markRaw(
      defineComponent({
        setup() {
          api = useChatAutoScroll({ container, trigger });
          return {};
        },
        template: "<div />",
      })
    )
  );
  return { api, wrapper };
}

function fakeScroller({ scrollTop = 0, scrollHeight = 1000, clientHeight = 300 } = {}) {
  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    scrollTo: vi.fn(),
  } as unknown as HTMLElement;
}

describe("useChatAutoScroll", () => {
  it("scrolls the container to the bottom and re-pins", () => {
    const el = fakeScroller();
    const container = ref<HTMLElement | null>(el);
    const { api, wrapper } = createAutoScroll(container, () => 0);

    api.scrollToBottom();

    expect(el.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "smooth" });
    expect(api.isPinned.value).toBe(true);
    expect(api.hasUnread.value).toBe(false);
    wrapper.unmount();
  });

  it("unpins once the user scrolls beyond the stick threshold", () => {
    const container = ref<HTMLElement | null>(
      fakeScroller({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 })
    );
    const { api, wrapper } = createAutoScroll(container, () => 0);

    api.onScroll();

    expect(api.isPinned.value).toBe(false);
    wrapper.unmount();
  });

  it("stays pinned within the stick threshold", () => {
    const container = ref<HTMLElement | null>(
      fakeScroller({ scrollTop: 950, scrollHeight: 1000, clientHeight: 300 })
    );
    const { api, wrapper } = createAutoScroll(container, () => 0);

    api.onScroll();

    expect(api.isPinned.value).toBe(true);
    wrapper.unmount();
  });

  it("flags unread content when new output arrives while scrolled away", async () => {
    const container = ref<HTMLElement | null>(
      fakeScroller({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 })
    );
    const tick = ref(0);
    const { api, wrapper } = createAutoScroll(container, () => tick.value);

    api.onScroll();
    tick.value = 1;
    await nextTick();
    await nextTick();

    expect(api.hasUnread.value).toBe(true);
    wrapper.unmount();
  });

  it("clears the unread flag once the user scrolls back to the bottom", async () => {
    const el = fakeScroller({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 });
    const container = ref<HTMLElement | null>(el);
    const tick = ref(0);
    const { api, wrapper } = createAutoScroll(container, () => tick.value);

    api.onScroll();
    tick.value = 1;
    await nextTick();
    await nextTick();
    expect(api.hasUnread.value).toBe(true);

    (el as unknown as { scrollTop: number }).scrollTop = 950;
    api.onScroll();

    expect(api.hasUnread.value).toBe(false);
    wrapper.unmount();
  });

  it("jumps instantly (not smoothly) when auto-following new content", async () => {
    const el = fakeScroller({ scrollTop: 950, scrollHeight: 1000, clientHeight: 300 });
    const container = ref<HTMLElement | null>(el);
    const tick = ref(0);
    const { wrapper } = createAutoScroll(container, () => tick.value);

    tick.value = 1;
    await nextTick();
    await nextTick();

    // Smooth-scrolling every streamed token produces visible chase-lag.
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "auto" });
    wrapper.unmount();
  });

  // The container ref is null before mount and after teardown; every entry
  // point has to tolerate that rather than throwing.
  it("tolerates a missing container on every entry point", async () => {
    const container = ref<HTMLElement | null>(null);
    const tick = ref(0);
    const { api, wrapper } = createAutoScroll(container, () => tick.value);

    expect(() => api.scrollToBottom()).not.toThrow();
    expect(() => api.onScroll()).not.toThrow();
    tick.value = 1;
    await nextTick();
    await nextTick();

    expect(api.hasUnread.value).toBe(false);
    wrapper.unmount();
  });

  it("clears the unread flag on unmount", async () => {
    const container = ref<HTMLElement | null>(
      fakeScroller({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 })
    );
    const tick = ref(0);
    const { api, wrapper } = createAutoScroll(container, () => tick.value);

    api.onScroll();
    tick.value = 1;
    await nextTick();
    await nextTick();
    expect(api.hasUnread.value).toBe(true);

    wrapper.unmount();

    expect(api.hasUnread.value).toBe(false);
  });
});
