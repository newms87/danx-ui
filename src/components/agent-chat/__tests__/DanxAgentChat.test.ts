import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxAgentChat from "../DanxAgentChat.vue";
import type { ChatAdapter } from "../types";

function makeAdapter(overrides: Partial<ChatAdapter> = {}): ChatAdapter {
  return {
    resolveThread: vi.fn().mockResolvedValue({ thread_id: "SAQ-1" }),
    getThread: vi.fn().mockResolvedValue({ messages: [] }),
    sendMessage: vi.fn().mockResolvedValue({ dispatched: false, reply: "ok" }),
    getJob: vi.fn(),
    ...overrides,
  };
}

function mountChat(apiAdapter: ChatAdapter, { slots = {}, props = {} } = {}) {
  return mount(DanxAgentChat, {
    props: { contextType: "query_card", contextId: "42", apiAdapter, ...props },
    slots,
  });
}

/**
 * The composer hosts a MarkdownEditor, so typing means writing into its
 * contenteditable and firing `input`. The editor syncs HTML back to markdown
 * through a debounce — a macrotask — so nextTick alone lands too early.
 */
async function type(w: ReturnType<typeof mountChat>, text: string) {
  const el = w.find(".dx-markdown-editor-content");
  el.element.innerHTML = `<p>${text}</p>`;
  await el.trigger("input");
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
  await el.trigger("keydown", { key: "Enter" });
}

describe("DanxAgentChat lifecycle", () => {
  it("resolves its thread on mount and emits threadReady", async () => {
    const apiAdapter = makeAdapter();
    const w = mountChat(apiAdapter);
    await flushPromises();

    expect(apiAdapter.resolveThread).toHaveBeenCalledWith({
      contextType: "query_card",
      contextId: "42",
    });
    expect(w.emitted("threadReady")?.[0]).toEqual(["SAQ-1"]);
  });

  it("sends the initialMessage once the thread resolves", async () => {
    const apiAdapter = makeAdapter();
    mountChat(apiAdapter, { props: { initialMessage: "hello there" } });
    await flushPromises();
    expect(apiAdapter.sendMessage).toHaveBeenCalledWith("SAQ-1", "hello there", expect.anything());
  });

  it("renders a distinct unavailable state instead of a hung spinner", async () => {
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    expect(w.find('[data-testid="chat-unavailable"]').exists()).toBe(true);
    // A MarkdownEditor goes read-only rather than disabled: the surface stops
    // being contenteditable.
    expect(w.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe("false");
    expect(w.emitted("error")).toBeTruthy();
  });

  it("disables the composer until the thread is ready", async () => {
    const w = mountChat(makeAdapter());
    // A MarkdownEditor goes read-only rather than disabled: the surface stops
    // being contenteditable.
    expect(w.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe("false");
    await flushPromises();
    expect(w.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe("true");
  });
});

describe("DanxAgentChat conversation", () => {
  it("renders exactly one user and one assistant turn per send", async () => {
    const store: unknown[] = [];
    const apiAdapter = makeAdapter({
      // An adapter that hands back its own live array — the shape that used to
      // make every message render twice.
      getThread: vi.fn().mockImplementation(async () => ({ messages: store })),
      sendMessage: vi.fn().mockImplementation(async (_id, text) => {
        store.push({ id: "s1", role: "user", text });
        store.push({ id: "s2", role: "assistant", text: "reply" });
        return { dispatched: false, reply: "reply" };
      }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await type(w, "what");
    await flushPromises();

    expect(w.findAll(".danx-agent-chat-message")).toHaveLength(2);
  });

  it("emits send when a message is queued", async () => {
    const w = mountChat(makeAdapter());
    await flushPromises();
    await type(w, "hello");
    expect(w.emitted("send")?.[0]).toEqual(["hello"]);
  });

  it("emits a packet from a fast reply", async () => {
    const packet = { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true };
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: false, reply: "done", packet }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await type(w, "primary US numbers");
    await flushPromises();

    expect(w.emitted("packet")?.[0]).toEqual([packet]);
  });

  it("emits applyPacket when the apply action is used", async () => {
    const packet = { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true };
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({ messages: [{ id: "p", role: "assistant", packet }] }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await w.find('[data-testid="packet-apply"]').trigger("click");

    expect(w.emitted("applyPacket")?.[0]).toEqual([packet]);
  });

  it("forwards a consumer #packet-{type} slot", async () => {
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
    const w = mountChat(apiAdapter, {
      slots: { "packet-sql_query": `<div class="consumer-packet">consumer packet</div>` },
    });
    await flushPromises();
    expect(w.find(".consumer-packet").text()).toBe("consumer packet");
  });

  it("shows a cancellable queue strip while an earlier send is in flight", async () => {
    let resolveFirst!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
        .mockResolvedValue({ dispatched: false, reply: "ok" }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await type(w, "first");
    await type(w, "second");
    await flushPromises();

    const strip = w.find('[data-testid="queue-strip"]');
    expect(strip.exists()).toBe(true);
    expect(strip.text()).toContain("second");

    await strip.find(".danx-chip__remove").trigger("click");
    expect(w.find('[data-testid="queue-strip"]').exists()).toBe(false);

    resolveFirst({ dispatched: false, reply: "done" });
    await flushPromises();
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("records feedback locally and re-emits it", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi
        .fn()
        .mockResolvedValue({ messages: [{ id: "a1", role: "assistant", text: "x" }] }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await w.find('[data-testid="action-thumbs-up"]').trigger("click");

    expect(w.emitted("feedback")?.[0]?.[0]).toMatchObject({ feedback: "up" });
  });
});

describe("DanxAgentChat attachments", () => {
  const uploadHandler = () =>
    vi.fn(async (file: File) => ({
      id: `server-${file.name}`,
      name: file.name,
      size: file.size,
      mime: file.type,
      url: `https://cdn.example.com/${file.name}`,
    }));

  /** happy-dom cannot populate a real DataTransfer, so the clipboard is stubbed. */
  function pasteWith(files: File[], text = "") {
    return {
      preventDefault: vi.fn(),
      clipboardData: {
        items: files.map((f) => ({ kind: "file", type: f.type, getAsFile: () => f })),
        files,
        getData: () => text,
      },
    } as unknown as ClipboardEvent;
  }

  async function pasteIntoComposer(w: ReturnType<typeof mountChat>, event: ClipboardEvent) {
    w.findComponent({ name: "ChatComposer" }).vm.$emit("paste", event);
    await flushPromises();
  }

  it("stages a pasted image above the composer", async () => {
    const w = mountChat(makeAdapter(), { props: { fileUploadHandler: uploadHandler() } });
    await flushPromises();

    await pasteIntoComposer(w, pasteWith([new File(["x"], "shot.png", { type: "image/png" })]));

    expect(w.find('[data-testid="pending-attachments"]').text()).toContain("shot.png");
  });

  it("removes a staged file before it is sent", async () => {
    const w = mountChat(makeAdapter(), { props: { fileUploadHandler: uploadHandler() } });
    await flushPromises();
    await pasteIntoComposer(w, pasteWith([new File(["x"], "shot.png", { type: "image/png" })]));

    // DanxFile's remove is a two-step confirmation: first click arms it.
    const remove = w.find('[data-testid="pending-attachments"] .danx-file__action-btn--remove');
    await remove.trigger("click");
    await remove.trigger("click");
    await flushPromises();

    expect(w.find('[data-testid="pending-attachments"]').exists()).toBe(false);
  });

  // No handler anywhere means no attachment affordance at all — a pasted image
  // must fall through to the editor rather than vanish into a dead tray.
  it("ignores a pasted image when no upload handler is configured", async () => {
    const w = mountChat(makeAdapter());
    await flushPromises();

    const event = pasteWith([new File(["x"], "shot.png", { type: "image/png" })]);
    await pasteIntoComposer(w, event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(w.find('[data-testid="pending-attachments"]').exists()).toBe(false);
  });

  it("sends the staged files with the message and clears the tray", async () => {
    const apiAdapter = makeAdapter();
    const w = mountChat(apiAdapter, { props: { fileUploadHandler: uploadHandler() } });
    await flushPromises();
    await pasteIntoComposer(w, pasteWith([new File(["x"], "shot.png", { type: "image/png" })]));

    await type(w, "what is this");
    await flushPromises();

    expect(apiAdapter.sendMessage).toHaveBeenCalledWith(
      "SAQ-1",
      "what is this",
      expect.anything(),
      expect.arrayContaining([expect.objectContaining({ name: "shot.png" })])
    );
    expect(w.find('[data-testid="pending-attachments"]').exists()).toBe(false);
  });

  it("re-emits openAttachment from a message in the thread", async () => {
    const file = {
      id: "f1",
      name: "report.csv",
      size: 10,
      mime: "text/csv",
      url: "https://x/report.csv",
    };
    const apiAdapter = makeAdapter({
      getThread: vi
        .fn()
        .mockResolvedValue({ messages: [{ id: "m1", role: "user", attachments: [file] }] }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await w.find('[data-testid="attachment"]').trigger("click");

    expect(w.emitted("openAttachment")?.[0]).toEqual([file]);
  });
});

describe("DanxAgentChat session bar", () => {
  const MODELS = [
    { id: "fable", label: "Fable 5", shortcut: "1" },
    { id: "opus", label: "Opus 5", shortcut: "2" },
  ];

  it("renders nothing above the composer when no telemetry is supplied", async () => {
    const w = mountChat(makeAdapter());
    await flushPromises();
    expect(w.find('[data-testid="session-bar"]').exists()).toBe(false);
  });

  it("updates the model model when a model is picked", async () => {
    const w = mountChat(makeAdapter(), { props: { models: MODELS, model: "opus" } });
    await flushPromises();

    w.findComponent({ name: "ChatSessionBar" }).vm.$emit("selectModel", "fable");
    await flushPromises();

    expect(w.emitted("update:model")?.[0]).toEqual(["fable"]);
  });

  it("shows supplied session counters", async () => {
    const w = mountChat(makeAdapter(), { props: { sessionStats: { tokens: 1600 } } });
    await flushPromises();
    expect(w.find('[data-testid="session-bar"]').text()).toContain("1.6k tokens");
  });
});

describe("DanxAgentChat empty state", () => {
  it("shows suggestions and sends the chosen one", async () => {
    const apiAdapter = makeAdapter();
    const w = mountChat(apiAdapter, { props: { suggestions: ["Show top routes"] } });
    await flushPromises();

    expect(w.find('[data-testid="chat-empty"]').exists()).toBe(true);
    await w.find('[data-testid="chat-suggestion"]').trigger("click");
    await flushPromises();

    expect(apiAdapter.sendMessage).toHaveBeenCalledWith(
      "SAQ-1",
      "Show top routes",
      expect.anything()
    );
  });

  it("lets a consumer replace the entire empty state", async () => {
    const w = mountChat(makeAdapter(), {
      slots: { empty: `<div class="my-empty">custom</div>` },
    });
    await flushPromises();
    expect(w.find(".my-empty").exists()).toBe(true);
  });
});

describe("DanxAgentChat header", () => {
  it("renders the title and a connected status dot when ready", async () => {
    const w = mountChat(makeAdapter(), { props: { title: "SQL Assistant" } });
    await flushPromises();
    expect(w.find(".danx-agent-chat__title").text()).toBe("SQL Assistant");
    expect(w.find('[data-testid="status-dot"]').classes()).toContain(
      "danx-agent-chat__status-dot--ready"
    );
  });

  it("marks the status dot as disconnected when unavailable", async () => {
    const w = mountChat(
      makeAdapter({ resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")) })
    );
    await flushPromises();
    expect(w.find('[data-testid="status-dot"]').classes()).toContain(
      "danx-agent-chat__status-dot--unavailable"
    );
  });

  it("clears the conversation and emits clear", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi
        .fn()
        .mockResolvedValue({ messages: [{ id: "a1", role: "assistant", text: "x" }] }),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await w.find('[data-testid="chat-clear"]').trigger("click");

    expect(w.emitted("clear")).toHaveLength(1);
    expect(w.find('[data-testid="chat-empty"]').exists()).toBe(true);
  });

  it("renders extra header controls from the slot", async () => {
    const w = mountChat(makeAdapter(), {
      slots: { "header-actions": `<button class="extra">x</button>` },
    });
    await flushPromises();
    expect(w.find(".extra").exists()).toBe(true);
  });

  it("hides the header when showHeader is false", async () => {
    const w = mountChat(makeAdapter(), { props: { showHeader: false } });
    await flushPromises();
    expect(w.find(".danx-agent-chat__header").exists()).toBe(false);
  });
});

describe("DanxAgentChat stop affordance", () => {
  it("aborts the escalated job upstream when the adapter can cancel", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-1" }),
      // Never settles: the turn stays in flight for the duration of the test.
      getJob: vi.fn().mockImplementation(() => new Promise(() => {})),
      cancelJob: vi.fn().mockResolvedValue(undefined),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await type(w, "complex");
    await flushPromises();

    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(true);
    await w.find('[data-testid="composer-stop"]').trigger("click");
    expect(apiAdapter.cancelJob).toHaveBeenCalledWith("job-1");
    w.unmount();
  });

  // Regression: Stop used to be gated on the adapter implementing cancelJob,
  // so the real danxbot proxy — which does not proxy cancel — offered no Stop
  // at all. Every turn holds an AbortController, so every turn is stoppable
  // locally; cancelJob only decides whether the UPSTREAM job is cancelled too.
  it("offers Stop while busy even when the adapter cannot cancel upstream", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockImplementation(
        (_id: string, _text: string, signal: AbortSignal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")));
          })
      ),
    });
    const w = mountChat(apiAdapter);
    await flushPromises();

    await type(w, "hi");
    await flushPromises();

    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(true);
    await w.find('[data-testid="composer-stop"]').trigger("click");
    await flushPromises();

    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(false);
    w.unmount();
  });
});
