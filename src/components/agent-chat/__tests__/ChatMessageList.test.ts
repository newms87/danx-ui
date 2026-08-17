import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ChatMessageList from "../ChatMessageList.vue";
import type { ChatMessage } from "../types";

const T0 = "2026-08-17T10:00:00.000Z";
const T10s = "2026-08-17T10:00:10.000Z";

/**
 * happy-dom reports 0 for every layout metric, so a real scroller can't be
 * simulated by CSS alone — these stub the geometry the auto-scroll logic reads.
 */
function stubGeometry(
  el: Element,
  { scrollTop = 0, scrollHeight = 1000, clientHeight = 300 } = {}
) {
  Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "scrollTop", { value: scrollTop, writable: true, configurable: true });
  (el as HTMLElement).scrollTo = vi.fn();
}

describe("ChatMessageList filtering", () => {
  it("never renders a metadata.type system bookkeeping message", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          { id: "1", role: "user", text: "real message" },
          { id: "2", role: "assistant", text: "last run marker", metadata: { type: "system" } },
        ] as ChatMessage[],
      },
    });
    expect(w.text()).toContain("real message");
    expect(w.text()).not.toContain("last run marker");
  });

  it("never renders a system-role message", () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "system", text: "bookkeeping" }] as ChatMessage[] },
    });
    expect(w.text()).not.toContain("bookkeeping");
  });

  it("shows the empty slot when everything is filtered out", () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "system", text: "x" }] as ChatMessage[] },
      slots: { empty: `<div class="the-empty">nothing yet</div>` },
    });
    expect(w.find(".the-empty").exists()).toBe(true);
  });
});

describe("ChatMessageList grouping and dividers", () => {
  it("renders one meta row for a run of same-sender messages", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          { id: "1", role: "assistant", text: "one", timestamp: T0 },
          { id: "2", role: "assistant", text: "two", timestamp: T10s },
        ] as ChatMessage[],
      },
    });
    expect(w.findAll(".danx-agent-chat-group")).toHaveLength(1);
    expect(w.findAll(".danx-agent-chat-message")).toHaveLength(2);
  });

  it("splits runs when the sender changes", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          { id: "1", role: "user", text: "q", timestamp: T0 },
          { id: "2", role: "assistant", text: "a", timestamp: T0 },
        ] as ChatMessage[],
      },
    });
    expect(w.findAll(".danx-agent-chat-group")).toHaveLength(2);
  });

  it("renders a day divider above the first group", () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "hi", timestamp: T0 }] as ChatMessage[] },
    });
    expect(w.find(".danx-agent-chat-day").exists()).toBe(true);
  });

  it("marks the transcript as a log region for assistive tech", () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "hi" }] as ChatMessage[] },
    });
    const log = w.find('[data-testid="chat-log"]');
    expect(log.attributes("role")).toBe("log");
    // role="log" already implies aria-live=polite; setting both double-announces.
    expect(log.attributes("aria-live")).toBeUndefined();
  });

  it("hides avatars when showAvatars is false", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [{ id: "1", role: "user", text: "hi" }] as ChatMessage[],
        showAvatars: false,
      },
    });
    expect(w.find(".danx-agent-chat-group__avatar").exists()).toBe(false);
  });
});

describe("ChatMessageList slot forwarding and events", () => {
  const packetMessages = [
    {
      id: "1",
      role: "assistant",
      packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
    },
  ] as ChatMessage[];

  it("forwards a #packet-{type} slot down to the message", () => {
    const w = mount(ChatMessageList, {
      props: { messages: packetMessages },
      slots: { "packet-sql_query": `<div class="forwarded">forwarded slot</div>` },
    });
    expect(w.find(".forwarded").text()).toBe("forwarded slot");
  });

  it("re-emits applyPacket from a message", async () => {
    const w = mount(ChatMessageList, { props: { messages: packetMessages } });
    await w.find('[data-testid="packet-apply"]').trigger("click");
    expect(w.emitted("applyPacket")?.[0]).toEqual([packetMessages[0]!.packet]);
  });

  it("re-emits retry from a failed turn", async () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          { id: "1", role: "assistant", text: "nope", error: "boom", retryable: true },
        ] as ChatMessage[],
      },
    });
    await w.find('[data-testid="action-retry"]').trigger("click");
    expect(w.emitted("retry")).toHaveLength(1);
  });

  it("re-emits feedback from an assistant turn", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "assistant", text: "hi" }] as ChatMessage[] },
    });
    await w.find('[data-testid="action-thumbs-up"]').trigger("click");
    expect(w.emitted("feedback")?.[0]?.[0]).toMatchObject({ feedback: "up" });
  });

  it("hides message actions when actions is false", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [{ id: "1", role: "assistant", text: "hi" }] as ChatMessage[],
        actions: false,
      },
    });
    expect(w.find('[data-testid="message-actions"]').exists()).toBe(false);
  });
});

describe("ChatMessageList auto-scroll", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("scrolls the container itself when pinned — never the page", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "a" }] as ChatMessage[] },
      attachTo: document.body,
    });
    const scroller = w.find('[data-testid="chat-log"]').element;
    stubGeometry(scroller);

    await w.setProps({
      messages: [
        { id: "1", role: "user", text: "a" },
        { id: "2", role: "assistant", text: "b" },
      ] as ChatMessage[],
    });
    await flushPromises();

    expect((scroller as HTMLElement).scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: "auto",
    });
    w.unmount();
  });

  it("stops auto-scrolling and offers a jump pill once the user scrolls up", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "a" }] as ChatMessage[] },
      attachTo: document.body,
    });
    const scroller = w.find('[data-testid="chat-log"]');
    // 1000 - 0 - 300 = 700px from the bottom: well past the 100px stick threshold.
    stubGeometry(scroller.element, { scrollTop: 0, scrollHeight: 1000, clientHeight: 300 });
    await scroller.trigger("scroll");

    await w.setProps({
      messages: [
        { id: "1", role: "user", text: "a" },
        { id: "2", role: "assistant", text: "b" },
      ] as ChatMessage[],
    });
    await flushPromises();

    expect(w.find('[data-testid="jump-to-latest"]').exists()).toBe(true);
    w.unmount();
  });

  it("re-pins and hides the pill when the jump control is used", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "a" }] as ChatMessage[] },
      attachTo: document.body,
    });
    const scroller = w.find('[data-testid="chat-log"]');
    stubGeometry(scroller.element, { scrollTop: 0, scrollHeight: 1000, clientHeight: 300 });
    await scroller.trigger("scroll");
    await w.setProps({
      messages: [
        { id: "1", role: "user", text: "a" },
        { id: "2", role: "assistant", text: "b" },
      ] as ChatMessage[],
    });
    await flushPromises();

    await w.find('[data-testid="jump-to-latest"]').trigger("click");
    await flushPromises();

    expect(w.find('[data-testid="jump-to-latest"]').exists()).toBe(false);
    w.unmount();
  });

  it("stays pinned while the user is near the bottom", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "a" }] as ChatMessage[] },
      attachTo: document.body,
    });
    const scroller = w.find('[data-testid="chat-log"]');
    // 1000 - 950 - 300 < 0 → at the bottom.
    stubGeometry(scroller.element, { scrollTop: 950, scrollHeight: 1000, clientHeight: 300 });
    await scroller.trigger("scroll");

    await w.setProps({
      messages: [
        { id: "1", role: "user", text: "a" },
        { id: "2", role: "assistant", text: "b" },
      ] as ChatMessage[],
    });
    await flushPromises();

    expect(w.find('[data-testid="jump-to-latest"]').exists()).toBe(false);
    w.unmount();
  });
});
