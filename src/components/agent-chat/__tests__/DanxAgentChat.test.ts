import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DanxAgentChat from "../DanxAgentChat.vue";
import type { ChatAdapter } from "../types";

function makeAdapter(overrides: Partial<ChatAdapter> = {}): ChatAdapter {
  return {
    resolveThread: vi.fn().mockResolvedValue({ thread_id: "SAQ-1" }),
    getThread: vi.fn().mockResolvedValue({ messages: [] }),
    sendMessage: vi.fn(),
    getJob: vi.fn(),
    ...overrides,
  };
}

function mountSidebar(apiAdapter: ChatAdapter, { slots = {}, props = {} } = {}) {
  return mount(DanxAgentChat, {
    props: { contextType: "phone-query", contextId: "default", apiAdapter, ...props },
    slots,
  });
}

async function sendText(w: ReturnType<typeof mountSidebar>, text: string) {
  await w.find("textarea").setValue(text);
  await w.find("textarea").trigger("keydown", { key: "Enter" });
}

describe("DanxAgentChat", () => {
  it("resolves its thread on mount and emits threadReady", async () => {
    const apiAdapter = makeAdapter();
    const w = mountSidebar(apiAdapter);
    await flushPromises();

    expect(apiAdapter.resolveThread).toHaveBeenCalledWith({
      contextType: "phone-query",
      contextId: "default",
    });
    expect(w.emitted("threadReady")?.[0]).toEqual(["SAQ-1"]);
    expect(w.find("textarea").exists()).toBe(true);
  });

  it("sends the initialMessage automatically once the thread resolves", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: false, reply: "ok" }),
    });
    mountSidebar(apiAdapter, { props: { initialMessage: "hello there" } });
    await flushPromises();

    expect(apiAdapter.sendMessage).toHaveBeenCalledWith("SAQ-1", "hello there");
  });

  it("renders a distinct 'chat unavailable' state (not a hung spinner) when the token is revoked", async () => {
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const w = mountSidebar(apiAdapter);
    await flushPromises();

    expect(w.find('[data-testid="chat-unavailable"]').exists()).toBe(true);
    // no composer offered while unavailable
    expect(w.find("textarea").exists()).toBe(false);
    expect(w.emitted("error")).toBeTruthy();
  });

  it("emits a packet on a fast reply and passes it up to the consumer", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({
        dispatched: false,
        reply: "done",
        packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
      }),
    });
    const w = mountSidebar(apiAdapter);
    await flushPromises();

    await sendText(w, "primary US numbers");
    await flushPromises();

    expect(w.emitted("packet")?.[0]).toEqual([
      { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
    ]);
  });

  it("shows queued messages in a visible strip while an earlier send is still in flight (serial)", async () => {
    let resolveFirst!: (value: { dispatched: boolean; reply: string }) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((r) => {
              resolveFirst = r;
            })
        )
        .mockResolvedValueOnce({ dispatched: false, reply: "ok" }),
    });
    const w = mountSidebar(apiAdapter);
    await flushPromises();

    await sendText(w, "first");
    await sendText(w, "second");
    await flushPromises();

    const strip = w.find('[data-testid="queue-strip"]');
    expect(strip.exists()).toBe(true);
    expect(strip.text()).toContain("second");
    expect(w.find(".danx-agent-chat__hint").exists()).toBe(true);

    resolveFirst({ dispatched: false, reply: "first done" });
    await flushPromises();
    expect(w.find('[data-testid="queue-strip"]').exists()).toBe(false);
  });

  it("forwards a consumer #packet-{type} slot to the rendered packet", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({
        messages: [
          {
            id: "p",
            role: "assistant",
            packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
          },
        ],
      }),
    });
    const w = mountSidebar(apiAdapter, {
      slots: { "packet-sql_query": `<div class="consumer-packet">consumer packet</div>` },
    });
    await flushPromises();

    expect(w.find(".consumer-packet").text()).toBe("consumer packet");
  });

  it("disables the composer while resolving and re-enables it once ready", async () => {
    const apiAdapter = makeAdapter();
    const w = mountSidebar(apiAdapter);
    // composer is disabled until status flips to "ready"
    expect((w.find("textarea").element as HTMLTextAreaElement).disabled).toBe(true);
    await flushPromises();
    expect((w.find("textarea").element as HTMLTextAreaElement).disabled).toBe(false);
  });
});
