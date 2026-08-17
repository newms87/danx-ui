import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { useAgentChat } from "../useAgentChat";
import type { ChatAdapter, ChatMessage } from "../types";

function makeAdapter(overrides: Partial<ChatAdapter> = {}): ChatAdapter {
  return {
    resolveThread: vi.fn().mockResolvedValue({ thread_id: "SAQ-1" }),
    getThread: vi.fn().mockResolvedValue({ messages: [] }),
    sendMessage: vi.fn(),
    getJob: vi.fn(),
    ...overrides,
  };
}

// No real timers — polling delay resolves immediately so escalation tests are
// deterministic under flushPromises.
const NO_DELAY = { delay: () => Promise.resolve(), pollIntervalMs: 0 };

beforeEach(() => {
  globalThis.sessionStorage?.clear?.();
});

describe("useAgentChat init", () => {
  it("resolves the thread, loads history, and fires thread-ready", async () => {
    const onThreadReady = vi.fn();
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({
        messages: [{ id: "1", role: "user", text: "hi" }],
      }),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "phone-query",
      contextId: "default",
      onThreadReady,
      ...NO_DELAY,
    });

    await chat.init();

    expect(chat.status.value).toBe("ready");
    expect(chat.threadId.value).toBe("SAQ-1");
    expect(chat.messages.value).toHaveLength(1);
    expect(onThreadReady).toHaveBeenCalledWith("SAQ-1");
  });

  it("goes to the 'unavailable' state (not a hung spinner) when thread resolution fails", async () => {
    const onError = vi.fn();
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      onError,
      ...NO_DELAY,
    });

    await chat.init();

    expect(chat.status.value).toBe("unavailable");
    expect(onError).toHaveBeenCalled();
  });

  it("goes to the 'unavailable' state when the adapter resolves with no thread_id", async () => {
    const onError = vi.fn();
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockResolvedValue({ thread_id: null }),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      onError,
      ...NO_DELAY,
    });

    await chat.init();

    expect(chat.status.value).toBe("unavailable");
    expect(onError).toHaveBeenCalled();
  });
});

describe("useAgentChat adapter isolation", () => {
  // Regression: reloadThread() used to alias the adapter's array, so the
  // composable's optimistic pushes mutated the adapter's own store and every
  // message rendered twice (user, user, assistant, assistant).
  it("never mutates the array an adapter returns from getThread", async () => {
    const store: ChatMessage[] = [];
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockImplementation(async () => ({ messages: store })),
      sendMessage: vi.fn().mockImplementation(async (_id: string, text: string) => {
        store.push({ id: "s1", role: "user", text });
        store.push({ id: "s2", role: "assistant", text: "reply" });
        return { dispatched: false, reply: "reply" };
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("what");
    await flushPromises();

    // The adapter's own array holds ONLY what the adapter itself wrote.
    expect(store.map((m) => m.id)).toEqual(["s1", "s2"]);
  });

  it("renders exactly one user + one assistant message per fast-reply send", async () => {
    const store: ChatMessage[] = [];
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockImplementation(async () => ({ messages: store })),
      sendMessage: vi.fn().mockImplementation(async (_id: string, text: string) => {
        store.push({ id: "s1", role: "user", text });
        store.push({ id: "s2", role: "assistant", text: "reply" });
        return { dispatched: false, reply: "reply" };
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("what");
    await flushPromises();

    expect(chat.messages.value.map((m) => m.role)).toEqual(["user", "assistant"]);
  });
});

describe("useAgentChat serial send", () => {
  it("sends strictly serially — a second message waits in the queue until the first resolves", async () => {
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
        .mockResolvedValueOnce({ dispatched: false, reply: "second done" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("a");
    chat.send("b");
    await flushPromises();

    // first in flight, second still queued
    expect(chat.sending.value).toBe(true);
    expect(chat.queue.value).toEqual(["b"]);
    expect(chat.messages.value.filter((m) => m.role === "user").map((m) => m.text)).toEqual(["a"]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);

    resolveFirst({ dispatched: false, reply: "first done" });
    await flushPromises();

    expect(chat.queue.value).toEqual([]);
    expect(chat.sending.value).toBe(false);
    expect(chat.messages.value.filter((m) => m.role === "user").map((m) => m.text)).toEqual([
      "a",
      "b",
    ]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(2);
  });

  it("does not send an empty/whitespace message", async () => {
    const apiAdapter = makeAdapter();
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("   ");
    await flushPromises();

    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("does not send while unavailable", async () => {
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("doesn't throw when a packet arrives and no onPacket callback was provided (default no-op)", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({
        dispatched: false,
        reply: "here",
        packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("primary US numbers");
    await flushPromises();

    expect(chat.messages.value.find((m) => m.role === "assistant")?.packet?.type).toBe("sql_query");
  });

  it("emits a fast-reply packet via onPacket", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({
        dispatched: false,
        reply: "here",
        packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
      }),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      onPacket,
      ...NO_DELAY,
    });
    await chat.init();

    chat.send("primary US numbers");
    await flushPromises();

    expect(onPacket).toHaveBeenCalledWith({
      type: "sql_query",
      payload: { sql: "SELECT 1" },
      valid: true,
    });
  });
});

describe("useAgentChat escalation polling", () => {
  it("shows a working state, polls statelessly to completion, reloads the thread, and emits the packet", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-9" }),
      getJob: vi
        .fn()
        .mockResolvedValueOnce({ status: "running" })
        .mockResolvedValueOnce({ status: "complete" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] }) // init
        .mockResolvedValueOnce({
          messages: [
            { id: "u", role: "user", text: "complex" },
            {
              id: "p",
              role: "assistant",
              packet: { type: "sql_query", payload: { sql: "SELECT 2" }, valid: true },
            },
          ],
        }),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      onPacket,
      ...NO_DELAY,
    });
    await chat.init();

    chat.send("complex multi-step");
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledTimes(2);
    expect(onPacket).toHaveBeenCalledWith({
      type: "sql_query",
      payload: { sql: "SELECT 2" },
      valid: true,
    });
    // no in-flight pending job left behind
    expect(globalThis.sessionStorage.getItem("agent-chat:pendingJob:SAQ-1")).toBeNull();
  });

  it("marks the working message with a visible error on a failed job — never a silent drop", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-x" }),
      getJob: vi.fn().mockResolvedValue({ status: "failed" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    const working = chat.messages.value.find((m) => m.jobId === "job-x");
    expect(working?.working).toBe(false);
    expect(working?.error).toMatch(/could not complete/i);
  });

  it("surfaces a visible timeout error rather than polling forever (no silent timeout)", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-t" }),
      getJob: vi.fn().mockResolvedValue({ status: "running" }), // never terminal
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      maxPollAttempts: 3,
      ...NO_DELAY,
    });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledTimes(3);
    const working = chat.messages.value.find((m) => m.jobId === "job-t");
    expect(working?.error).toMatch(/timed out/i);
  });

  it("surfaces a visible error when a poll request itself fails", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-e" }),
      getJob: vi.fn().mockRejectedValue(new Error("network down")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    const working = chat.messages.value.find((m) => m.jobId === "job-e");
    expect(working?.working).toBe(false);
    expect(working?.error).toBe("network down");
  });

  it("surfaces a visible error when the post-success thread reload fails", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-r" }),
      getJob: vi.fn().mockResolvedValue({ status: "complete" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] }) // init
        .mockRejectedValueOnce(new Error("reload failed")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    const working = chat.messages.value.find((m) => m.jobId === "job-r");
    expect(working?.working).toBe(false);
    expect(working?.error).toBe("reload failed");
  });

  it("resumes polling an in-flight job on init after a remount (survives remount mid-poll)", async () => {
    globalThis.sessionStorage.setItem("agent-chat:pendingJob:SAQ-1", "job-resume");
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      getJob: vi.fn().mockResolvedValue({ status: "complete" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] }) // init reload
        .mockResolvedValueOnce({
          messages: [
            {
              id: "p",
              role: "assistant",
              packet: { type: "sql_query", payload: { sql: "SELECT 3" }, valid: true },
            },
          ],
        }), // post-resume reload
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "c",
      contextId: "d",
      onPacket,
      ...NO_DELAY,
    });

    await chat.init();
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledWith("job-resume");
    expect(onPacket).toHaveBeenCalledWith({
      type: "sql_query",
      payload: { sql: "SELECT 3" },
      valid: true,
    });
  });

  it("reports a visible failure (and stops polling) on a terminal status it doesn't recognize, e.g. critical_failure", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-cf" }),
      getJob: vi.fn().mockResolvedValue({ status: "critical_failure" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledTimes(1); // recognized as terminal, not polled to timeout
    const working = chat.messages.value.find((m) => m.jobId === "job-cf");
    expect(working?.error).toMatch(/critical_failure/);
  });

  it("keeps a queued message waiting until an escalated first message finishes polling (serial × escalation)", async () => {
    let resolveJob!: (value: { status: string }) => void;
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({ messages: [] }),
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce({ dispatched: true, job_id: "job-1" })
        .mockResolvedValueOnce({ dispatched: false, reply: "second done" }),
      getJob: vi.fn().mockImplementation(
        () =>
          new Promise((r) => {
            resolveJob = r;
          })
      ),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("first");
    chat.send("second");
    await flushPromises();

    // first escalated + polling; second must NOT have been sent yet
    expect(chat.queue.value).toEqual(["second"]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);

    resolveJob({ status: "complete" });
    await flushPromises();

    expect(chat.queue.value).toEqual([]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(2);
  });
});

describe("useAgentChat defaults", () => {
  it("polls using the real default delay/pollIntervalMs when not overridden", async () => {
    vi.useFakeTimers();
    try {
      const apiAdapter = makeAdapter({
        sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-default" }),
        getJob: vi.fn().mockResolvedValue({ status: "complete" }),
      });
      const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d" });
      await chat.init();

      chat.send("complex");
      await vi.advanceTimersByTimeAsync(2000);

      expect(apiAdapter.getJob).toHaveBeenCalledWith("job-default");
    } finally {
      vi.useRealTimers();
    }
  });

  it("readPendingJob swallows a sessionStorage access failure and treats it as no pending job", async () => {
    const getItemSpy = vi.spyOn(globalThis.sessionStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const apiAdapter = makeAdapter();
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });

    await chat.init();

    expect(chat.status.value).toBe("ready");
    expect(apiAdapter.getJob).not.toHaveBeenCalled();
    getItemSpy.mockRestore();
  });
});

describe("useAgentChat unavailable states", () => {
  it("flips to 'unavailable' when the initial history load fails", async () => {
    const apiAdapter = makeAdapter({ getThread: vi.fn().mockRejectedValue(new Error("boom")) });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.status.value).toBe("unavailable");
  });

  it("flips a ready session to 'unavailable' when a mid-session send hits a revoked token", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.status.value).toBe("ready");

    chat.send("hi");
    await flushPromises();

    expect(chat.status.value).toBe("unavailable");
  });

  it("does NOT flip to 'unavailable' for an ordinary mid-session send error (stays usable)", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockRejectedValue(new Error("upstream_error")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    expect(chat.status.value).toBe("ready");
    // the failed turn is still surfaced on the optimistic message
    expect(chat.messages.value.find((m) => m.role === "user")?.error).toBe("upstream_error");
  });
});
