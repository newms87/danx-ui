import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatMessageGroup from "../ChatMessageGroup.vue";
import { groupMessages } from "../useChatGrouping";
import type { ChatMessage } from "../types";

const TS = "2026-08-17T14:00:00.000Z";

function groupOf(messages: ChatMessage[]) {
  return groupMessages(messages)[0]!;
}

function mountGroup(messages: ChatMessage[], props = {}, slots = {}) {
  return mount(ChatMessageGroup, { props: { group: groupOf(messages), ...props }, slots });
}

describe("ChatMessageGroup identity", () => {
  it("labels an assistant run with the assistant name", () => {
    const w = mountGroup([{ id: "1", role: "assistant", text: "hi", timestamp: TS }], {
      assistantName: "Danx",
    });
    expect(w.find(".danx-agent-chat-group__author").text()).toBe("Danx");
  });

  it("labels your own run with the user name", () => {
    const w = mountGroup([{ id: "1", role: "user", text: "hi", timestamp: TS }], {
      userName: "Me",
    });
    expect(w.find(".danx-agent-chat-group__author").text()).toBe("Me");
  });

  it("prefers a per-message author over the role default", () => {
    const w = mountGroup([{ id: "1", role: "user", author: "Dana", text: "hi", timestamp: TS }], {
      userName: "Me",
    });
    expect(w.find(".danx-agent-chat-group__author").text()).toBe("Dana");
  });

  it("mirrors the layout for the user's own run", () => {
    const w = mountGroup([{ id: "1", role: "user", text: "hi", timestamp: TS }]);
    expect(w.classes()).toContain("danx-agent-chat-group--user");
  });

  it("exposes the turn as a labelled article for assistive tech", () => {
    const w = mountGroup([{ id: "1", role: "assistant", text: "hi", timestamp: TS }], {
      assistantName: "Danx",
    });
    expect(w.element.tagName).toBe("ARTICLE");
    expect(w.attributes("aria-label")).toContain("Danx");
  });

  it("renders an avatar by default and hides it on request", () => {
    expect(
      mountGroup([{ id: "1", role: "assistant", text: "hi" }])
        .find(".danx-agent-chat-group__avatar")
        .exists()
    ).toBe(true);
    expect(
      mountGroup([{ id: "1", role: "assistant", text: "hi" }], { showAvatar: false })
        .find(".danx-agent-chat-group__avatar")
        .exists()
    ).toBe(false);
  });

  it("uses the supplied avatar image when given", () => {
    const w = mountGroup([{ id: "1", role: "assistant", text: "hi" }], {
      assistantAvatar: "https://example.com/bot.png",
    });
    expect(w.find("img").attributes("src")).toBe("https://example.com/bot.png");
  });

  it("omits the timestamp when the run carries none", () => {
    const w = mountGroup([{ id: "1", role: "assistant", text: "hi" }]);
    expect(w.find('[data-testid="group-time"]').exists()).toBe(false);
  });
});

describe("ChatMessageGroup actions", () => {
  const run: ChatMessage[] = [
    { id: "1", role: "assistant", text: "first", timestamp: TS },
    { id: "2", role: "assistant", text: "second", timestamp: TS },
  ];

  it("renders one action toolbar per run, not per message", () => {
    const w = mountGroup(run);
    expect(w.findAll(".danx-agent-chat-message")).toHaveLength(2);
    expect(w.findAll('[data-testid="message-actions"]')).toHaveLength(1);
  });

  it("copies the whole run's text, not just the last line", () => {
    const w = mountGroup(run);
    // Both messages in the run are joined for the copy action.
    expect(w.findComponent({ name: "ChatMessageActions" }).props("text")).toContain("first");
    expect(w.findComponent({ name: "ChatMessageActions" }).props("text")).toContain("second");
  });

  it("offers retry when any message in the run failed", async () => {
    const w = mountGroup([
      { id: "1", role: "assistant", text: "nope", error: "boom", retryable: true },
    ]);
    await w.find('[data-testid="action-retry"]').trigger("click");
    expect(w.emitted("retry")).toHaveLength(1);
  });

  it("offers feedback on a successful assistant run", async () => {
    const w = mountGroup(run);
    await w.find('[data-testid="action-thumbs-up"]').trigger("click");
    expect(w.emitted("feedback")?.[0]?.[0]).toMatchObject({ feedback: "up" });
  });

  it("does not offer feedback on your own messages", () => {
    const w = mountGroup([{ id: "1", role: "user", text: "hi" }]);
    expect(w.find('[data-testid="action-thumbs-up"]').exists()).toBe(false);
  });

  it("suppresses actions while an escalation is still working", () => {
    const w = mountGroup([{ id: "1", role: "assistant", working: true, jobId: "j1" }]);
    expect(w.find('[data-testid="message-actions"]').exists()).toBe(false);
  });

  it("suppresses actions entirely when disabled", () => {
    const w = mountGroup(run, { actions: false });
    expect(w.find('[data-testid="message-actions"]').exists()).toBe(false);
  });

  it("re-emits applyPacket from a message in the run", async () => {
    const packet = { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true };
    const w = mountGroup([{ id: "1", role: "assistant", packet }]);
    await w.find('[data-testid="packet-apply"]').trigger("click");
    expect(w.emitted("applyPacket")?.[0]).toEqual([packet]);
  });

  it("forwards a packet slot down to its messages", () => {
    const w = mountGroup(
      [
        {
          id: "1",
          role: "assistant",
          packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
        },
      ],
      {},
      { "packet-sql_query": `<div class="from-slot">slotted</div>` }
    );
    expect(w.find(".from-slot").text()).toBe("slotted");
  });
});
