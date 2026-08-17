import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatMessageBubble from "../ChatMessageBubble.vue";
import type { ChatMessage } from "../types";

const TS = "2026-08-12T18:00:00.000Z";

function mountBubble(message: ChatMessage, props = {}, slots = {}) {
  return mount(ChatMessageBubble, { props: { message, ...props }, slots });
}

describe("ChatMessageBubble roles", () => {
  it("gives the user's turn a filled, width-capped bubble", () => {
    const w = mountBubble({ id: "1", role: "user", text: "hi", timestamp: TS });
    expect(w.classes()).toContain("danx-agent-chat-message--user");
  });

  it("renders the assistant's turn full-bleed with no bubble modifier", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "hi", timestamp: TS });
    expect(w.classes()).toContain("danx-agent-chat-message--assistant");
    expect(w.classes()).not.toContain("danx-agent-chat-message--user");
  });

  it("dims an optimistic message that is still in flight", () => {
    const w = mountBubble({ id: "1", role: "user", text: "hi", pending: true });
    expect(w.classes()).toContain("danx-agent-chat-message--pending");
  });
});

describe("ChatMessageBubble text", () => {
  it("renders assistant text as markdown", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "**bold**" });
    expect(w.find(".danx-agent-chat-markdown").html()).toContain("<strong>");
  });

  it("renders the user's own text verbatim, never reinterpreted as markdown", () => {
    const w = mountBubble({ id: "1", role: "user", text: "**bold**" });
    expect(w.find(".danx-agent-chat-markdown").exists()).toBe(false);
    expect(w.text()).toContain("**bold**");
  });

  it("escapes HTML in markdown output rather than parsing it into elements (XSS-safe)", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "<img src=x onerror=alert(1)>" });
    const rendered = w.find(".danx-agent-chat-markdown");
    // The payload survives as TEXT (escaped), and creates no live element —
    // asserting on the raw string would pass for escaped and unescaped alike.
    expect(rendered.element.querySelector("img")).toBeNull();
    expect(rendered.text()).toContain("<img src=x onerror=alert(1)>");
  });

  it("strips a javascript: link target", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "[x](javascript:alert(1))" });
    const anchor = w.find(".danx-agent-chat-markdown a");
    expect(anchor.attributes("href")).toBe("");
  });

  it("renders plain text when markdown is disabled", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "**bold**" }, { markdown: false });
    expect(w.find(".danx-agent-chat-markdown").exists()).toBe(false);
    expect(w.text()).toContain("**bold**");
  });

  it("collapses text over maxVisibleChars and toggles back and forth", async () => {
    const long = "x".repeat(700);
    const w = mountBubble(
      { id: "1", role: "user", text: long },
      { maxVisibleChars: 600, markdown: false }
    );
    const toggle = w.find('[data-testid="collapse-toggle"]');
    expect(toggle.exists()).toBe(true);
    expect(w.text().length).toBeLessThan(700);
    await toggle.trigger("click");
    expect(w.text()).toContain(long);
    await toggle.trigger("click");
    expect(w.text().length).toBeLessThan(700);
  });

  it("offers no expand affordance for short text", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "hello" });
    expect(w.find('[data-testid="collapse-toggle"]').exists()).toBe(false);
  });
});

describe("ChatMessageBubble streaming and working states", () => {
  it("shows a caret while streaming with partial text", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "partial", streaming: true });
    expect(w.find(".danx-agent-chat-caret").exists()).toBe(true);
  });

  it("shows a lone caret while streaming before any text arrives", () => {
    const w = mountBubble({ id: "1", role: "assistant", text: "", streaming: true });
    expect(w.find('[data-testid="streaming-caret"]').exists()).toBe(true);
  });

  it("shows the thinking indicator for an in-flight escalation", () => {
    const w = mountBubble({ id: "1", role: "assistant", working: true, jobId: "j1" });
    expect(w.find('[data-testid="working-state"]').exists()).toBe(true);
  });

  it("surfaces live job elapsed time in the working indicator", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      working: true,
      jobId: "j1",
      job: { status: "running", elapsed_seconds: 42 },
    });
    expect(w.text()).toContain("42s");
  });

  it("renders job elapsed time over a minute as minutes and seconds", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      working: true,
      job: { status: "running", elapsed_seconds: 95 },
    });
    expect(w.text()).toContain("1m 35s");
  });

  it("omits the elapsed suffix below one second", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      working: true,
      job: { status: "running", elapsed_seconds: 0 },
    });
    expect(w.text()).not.toContain("0s");
  });

  it("prefers the job summary as the working label when present", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      working: true,
      job: { status: "running", summary: "Searching call logs" },
    });
    expect(w.text()).toContain("Searching call logs");
  });
});

describe("ChatMessageBubble packets", () => {
  const validPacket: ChatMessage = {
    id: "1",
    role: "assistant",
    packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
  };

  it("renders a valid packet through the CodeViewer fallback", () => {
    const w = mountBubble(validPacket);
    expect(w.find('[data-testid="packet"]').exists()).toBe(true);
    expect(w.find('[data-testid="packet-invalid"]').exists()).toBe(false);
    expect(w.html()).toContain("SELECT 1");
  });

  it("renders a consumer #packet-{type} slot instead of the fallback", () => {
    const w = mountBubble(
      validPacket,
      {},
      { "packet-sql_query": `<div class="custom-packet">custom render</div>` }
    );
    expect(w.find(".custom-packet").text()).toBe("custom render");
  });

  it("uses the schema label and apply label when provided", () => {
    const w = mountBubble(validPacket, {
      packetSchemas: { sql_query: { label: "SQL", applyLabel: "Apply to editor" } },
    });
    expect(w.find(".danx-agent-chat-packet__head").text()).toContain("SQL");
    expect(w.find('[data-testid="packet-apply"]').text()).toContain("Apply to editor");
  });

  it("falls back to the raw packet type when no schema is registered", () => {
    const w = mountBubble(validPacket);
    expect(w.find(".danx-agent-chat-packet__head").text()).toContain("sql_query");
  });

  it("emits applyPacket when the apply action is used", async () => {
    const w = mountBubble(validPacket);
    await w.find('[data-testid="packet-apply"]').trigger("click");
    expect(w.emitted("applyPacket")?.[0]).toEqual([validPacket.packet]);
  });

  it("shows a visible validation failure and offers no apply action", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: {
        type: "sql_query",
        payload: { sql: "DROP TABLE x" },
        valid: false,
        error: "only_select_allowed",
      },
    });
    expect(w.find('[data-testid="packet-invalid"]').text()).toContain("only_select_allowed");
    expect(w.find('[data-testid="packet-apply"]').exists()).toBe(false);
  });

  it("falls back to a default message when an invalid packet carries no error text", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: { type: "sql_query", payload: {}, valid: false },
    });
    expect(w.find('[data-testid="packet-invalid"]').text()).toContain("could not be validated");
  });

  it("treats an unvalidated (undefined) packet as renderable and appliable", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: { type: "unknown_type", payload: { a: 1 } },
    });
    expect(w.find('[data-testid="packet-invalid"]').exists()).toBe(false);
    expect(w.find('[data-testid="packet-apply"]').exists()).toBe(true);
  });

  it("badges a packet the backend had to repair", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      packet: { type: "sql_query", payload: {}, valid: true, repaired: true },
    });
    expect(w.find('[data-testid="packet-repaired"]').exists()).toBe(true);
  });

  it("renders a schema icon beside the packet heading", () => {
    const w = mountBubble(validPacket, {
      packetSchemas: { sql_query: { label: "SQL", icon: "database" } },
    });
    expect(w.find(".danx-agent-chat-packet__head .danx-icon").exists()).toBe(true);
  });
});

describe("ChatMessageBubble rich content", () => {
  it("renders agent steps", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      text: "done",
      steps: [{ id: "s1", label: "Queried calls table", kind: "tool", durationMs: 120 }],
    });
    expect(w.find('[data-testid="steps"]').text()).toContain("Queried calls table");
  });

  it("renders attachments", () => {
    const w = mountBubble({
      id: "1",
      role: "user",
      text: "see this",
      attachments: [{ id: "a1", name: "report.csv" }],
    });
    expect(w.find(".danx-agent-chat-attachments").text()).toContain("report.csv");
  });

  it("renders citations", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      text: "per the docs",
      citations: [{ id: "c1", title: "Routing guide", source: "docs" }],
    });
    expect(w.find(".danx-agent-chat-citations").text()).toContain("docs");
  });

  it("falls back to the citation title when no source label is given", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      text: "per the docs",
      citations: [{ id: "c1", title: "Routing guide" }],
    });
    expect(w.find(".danx-agent-chat-citations").text()).toContain("Routing guide");
  });

  it("shows a per-message error banner", () => {
    const w = mountBubble({
      id: "1",
      role: "assistant",
      error: "Timed out waiting for the assistant.",
    });
    expect(w.find('[data-testid="message-error"]').text()).toContain("Timed out");
  });
});
