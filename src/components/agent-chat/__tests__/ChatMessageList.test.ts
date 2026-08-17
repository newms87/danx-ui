import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ChatMessageList from "../ChatMessageList.vue";

describe("ChatMessageList", () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
  });
  afterEach(() => scrollSpy.mockRestore());

  it("renders with no messages", () => {
    const w = mount(ChatMessageList);
    expect(w.find(".danx-agent-chat-list__inner").exists()).toBe(true);
  });

  it("never renders a metadata.type === 'system' bookkeeping message", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          { id: "1", role: "user", text: "real message" },
          { id: "2", role: "assistant", text: "last run marker", metadata: { type: "system" } },
        ],
      },
    });
    expect(w.text()).toContain("real message");
    expect(w.text()).not.toContain("last run marker");
  });

  it("never renders a role === 'system' message", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [{ id: "1", role: "system", text: "bookkeeping" }],
      },
    });
    expect(w.text()).not.toContain("bookkeeping");
  });

  it("pins to the bottom when a new message arrives", async () => {
    const w = mount(ChatMessageList, {
      props: { messages: [{ id: "1", role: "user", text: "a" }] },
    });
    await w.setProps({
      messages: [
        { id: "1", role: "user", text: "a" },
        { id: "2", role: "assistant", text: "b" },
      ],
    });
    await flushPromises();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("forwards a #packet-{type} slot down to the bubble", () => {
    const w = mount(ChatMessageList, {
      props: {
        messages: [
          {
            id: "1",
            role: "assistant",
            packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
          },
        ],
      },
      slots: { "packet-sql_query": `<div class="forwarded">forwarded slot</div>` },
    });
    expect(w.find(".forwarded").text()).toBe("forwarded slot");
  });
});
