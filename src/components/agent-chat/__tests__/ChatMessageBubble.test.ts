import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { fRelativeTime, fAbsoluteTime } from "../../../shared/formatters/relativeTime";
import { DanxTooltip } from "../../tooltip";
import ChatMessageBubble from "../ChatMessageBubble.vue";
import type { ChatMessage } from "../types";

const TS = "2026-08-12T18:00:00.000Z";

function mountBubble(message: ChatMessage, props = {}, slots = {}) {
  return mount(ChatMessageBubble, { props: { message, ...props }, slots });
}

describe("ChatMessageBubble", () => {
  it("renders short text in full with no expand affordance", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "hello", timestamp: TS });
    expect(w.text()).toContain("hello");
    expect(w.find('[data-testid="collapse-toggle"]').exists()).toBe(false);
  });

  it("collapses text over maxVisibleChars and expands on toggle", async () => {
    const long = "x".repeat(700);
    const w = mountBubble(
      { id: "1", role: "assistant", text: long, timestamp: TS },
      { maxVisibleChars: 600 }
    );
    const toggle = w.find('[data-testid="collapse-toggle"]');
    expect(toggle.exists()).toBe(true);
    // collapsed: truncated + ellipsis, not the full 700 chars
    expect(w.find(".danx-agent-chat-bubble__text").text().length).toBeLessThan(700);
    await toggle.trigger("click");
    expect(w.find(".danx-agent-chat-bubble__text").text()).toContain(long);
    await toggle.trigger("click");
    expect(w.find(".danx-agent-chat-bubble__text").text().length).toBeLessThan(700);
  });

  it("renders the RELATIVE time as the visible label and wires the ABSOLUTE time into the tooltip", () => {
    const w = mountBubble({ id: "1", role: "user", text: "hi", timestamp: TS });
    const rel = w.find('[data-testid="relative-time"]');
    expect(rel.exists()).toBe(true);
    // visible label is the relative form, distinct from the absolute
    expect(rel.text()).toBe(fRelativeTime(TS));
    expect(rel.text()).not.toBe(fAbsoluteTime(TS));
    // the absolute time is carried into the tooltip for hover reveal
    expect(w.findComponent(DanxTooltip).props("tooltip")).toBe(fAbsoluteTime(TS));
  });

  it("renders no relative-time label when the message has no timestamp", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "hi" });
    expect(w.find('[data-testid="relative-time"]').exists()).toBe(false);
  });

  it("renders a valid packet through the CodeViewer fallback when no slot is provided", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
      timestamp: TS,
    });
    expect(w.find('[data-testid="packet"]').exists()).toBe(true);
    expect(w.find('[data-testid="packet-invalid"]').exists()).toBe(false);
    expect(w.html()).toContain("SELECT 1");
  });

  it("renders a friendlier packet heading from packetSchemas, falling back to the raw type", () => {
    const w = mountBubble(
      {
        id: "1",
        role: "assistant",
        packet: { type: "sql_query", payload: {}, valid: true },
        timestamp: TS,
      },
      { packetSchemas: { sql_query: { label: "SQL" } } }
    );
    expect(w.find(".danx-agent-chat-bubble__packet-label").text()).toBe("SQL");
  });

  it("renders a consumer-provided #packet-{type} slot instead of the fallback", () => {
    const w = mountBubble(
      {
        id: "1",
        role: "assistant",
        packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
        timestamp: TS,
      },
      {},
      { "packet-sql_query": `<div class="custom-packet">custom render</div>` }
    );
    expect(w.find(".custom-packet").text()).toBe("custom render");
  });

  it("shows a visible 'didn't pass validation' state for an invalid packet", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: {
        type: "sql_query",
        payload: { sql: "DROP TABLE x" },
        valid: false,
        error: "only_select_allowed",
      },
      timestamp: TS,
    });
    const invalid = w.find('[data-testid="packet-invalid"]');
    expect(invalid.exists()).toBe(true);
    expect(invalid.text()).toContain("only_select_allowed");
  });

  it("falls back to a default message when an invalid packet carries no error text", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: { type: "sql_query", payload: {}, valid: false },
      timestamp: TS,
    });
    expect(w.find('[data-testid="packet-invalid"]').text()).toContain("could not be validated");
  });

  it("shows a working state for an in-flight escalation and no text/packet", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      working: true,
      jobId: "j1",
      timestamp: TS,
    });
    expect(w.find('[data-testid="working-state"]').exists()).toBe(true);
    expect(w.text()).toContain("Working on it");
  });

  it("shows a per-message error banner", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      error: "Timed out waiting for the assistant.",
      timestamp: TS,
    });
    expect(w.find('[data-testid="message-error"]').text()).toContain("Timed out");
  });

  it("applies the user modifier class for a user message and assistant for anything else", () => {
    const userBubble = mountBubble({ id: "1", role: "user", text: "hi", timestamp: TS });
    expect(userBubble.classes()).toContain("danx-agent-chat-bubble--user");

    const assistantBubble = mountBubble({ id: "2", role: "assistant", text: "hi", timestamp: TS });
    expect(assistantBubble.classes()).toContain("danx-agent-chat-bubble--assistant");
  });
});
