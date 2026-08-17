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
      getThread: vi.fn().mockResolvedValue({ messages: [{ id: "1", role: "user", text: "hi" }] }),
    });
    const chat = useAgentChat({
      apiAdapter,
      contextType: "query_card",
      contextId: "42",
      onThreadReady,
      ...NO_DELAY,
    });

    await chat.init();

    expect(chat.status.value).toBe("ready");
    expect(chat.threadId.value).toBe("SAQ-1");
    expect(chat.messages.value).toHaveLength(1);
    expect(onThreadReady).toHaveBeenCalledWith("SAQ-1");
  });

  it("goes to 'unavailable' (not a hung spinner) when thread resolution fails", async () => {
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

  it("goes to 'unavailable' when the adapter resolves with no thread_id", async () => {
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockResolvedValue({ thread_id: null }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.status.value).toBe("unavailable");
  });

  it("goes to 'unavailable' when the initial history load fails", async () => {
    const apiAdapter = makeAdapter({ getThread: vi.fn().mockRejectedValue(new Error("boom")) });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.status.value).toBe("unavailable");
  });
});

describe("useAgentChat adapter isolation", () => {
  // Regression: reloadThread() used to alias the adapter's array, so the
  // composable's optimistic pushes mutated the adapter's own store and every
  // message rendered twice (user, user, assistant, assistant).
  function storeBackedAdapter(store: ChatMessage[]) {
    return makeAdapter({
      getThread: vi.fn().mockImplementation(async () => ({ messages: store })),
      sendMessage: vi.fn().mockImplementation(async (_id: string, text: string) => {
        store.push({ id: "s1", role: "user", text });
        store.push({ id: "s2", role: "assistant", text: "reply" });
        return { dispatched: false, reply: "reply" };
      }),
    });
  }

  it("never mutates the array an adapter returns from getThread", async () => {
    const store: ChatMessage[] = [];
    const chat = useAgentChat({
      apiAdapter: storeBackedAdapter(store),
      contextType: "c",
      contextId: "d",
      ...NO_DELAY,
    });
    await chat.init();

    chat.send("what");
    await flushPromises();

    expect(store.map((m) => m.id)).toEqual(["s1", "s2"]);
  });

  it("renders exactly one user + one assistant message per fast-reply send", async () => {
    const store: ChatMessage[] = [];
    const chat = useAgentChat({
      apiAdapter: storeBackedAdapter(store),
      contextType: "c",
      contextId: "d",
      ...NO_DELAY,
    });
    await chat.init();

    chat.send("what");
    await flushPromises();

    expect(chat.messages.value.map((m) => m.role)).toEqual(["user", "assistant"]);
  });
});

describe("useAgentChat serial send", () => {
  it("sends strictly serially — a second message waits until the first resolves", async () => {
    let resolveFirst!: (value: { dispatched: boolean; reply: string }) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
        .mockResolvedValueOnce({ dispatched: false, reply: "second done" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("a");
    chat.send("b");
    await flushPromises();

    expect(chat.sending.value).toBe(true);
    expect(chat.queue.value).toEqual(["b"]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);

    resolveFirst({ dispatched: false, reply: "first done" });
    await flushPromises();

    expect(chat.queue.value).toEqual([]);
    expect(chat.sending.value).toBe(false);
    expect(chat.messages.value.filter((m) => m.role === "user").map((m) => m.text)).toEqual([
      "a",
      "b",
    ]);
  });

  it("drops a queued message via dequeue before it is sent", async () => {
    let resolveFirst!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)))
        .mockResolvedValue({ dispatched: false, reply: "ok" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("first");
    chat.send("second");
    await flushPromises();
    expect(chat.queue.value).toEqual(["second"]);

    chat.dequeue(0);
    expect(chat.queue.value).toEqual([]);

    resolveFirst({ dispatched: false, reply: "done" });
    await flushPromises();
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("ignores empty and whitespace-only sends", async () => {
    const apiAdapter = makeAdapter();
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("   ");
    chat.send("");
    await flushPromises();
    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("ignores sends while unavailable", async () => {
    const apiAdapter = makeAdapter({
      resolveThread: vi.fn().mockRejectedValue(new Error("chat_unavailable")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("hi");
    await flushPromises();
    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("emits a fast-reply packet via onPacket and attaches steps + citations", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({
        dispatched: false,
        reply: "here",
        packet: { type: "sql_query", payload: { sql: "SELECT 1" }, valid: true },
        steps: [{ id: "s1", label: "Parsed request" }],
        citations: [{ id: "c1", title: "calls table" }],
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
    const assistant = chat.messages.value.find((m) => m.role === "assistant")!;
    expect(assistant.steps).toHaveLength(1);
    expect(assistant.citations).toHaveLength(1);
  });

  it("does not throw when no onPacket callback was provided", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({
        dispatched: false,
        reply: "here",
        packet: { type: "sql_query", payload: {}, valid: true },
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("x");
    await flushPromises();
    expect(chat.messages.value[chat.messages.value.length - 1]?.packet?.type).toBe("sql_query");
  });
});

describe("useAgentChat escalation polling", () => {
  it("polls to completion, reloads the thread, and emits the packet", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-9" }),
      getJob: vi
        .fn()
        .mockResolvedValueOnce({ status: "running" })
        .mockResolvedValueOnce({ status: "completed" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
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
    expect(globalThis.sessionStorage.getItem("agent-chat:pendingJob:SAQ-1")).toBeNull();
  });

  // `recovered` means a stream-idle synthetic recovery still LANDED the
  // dispatch. Reporting it as a failure marks completed work as broken.
  it("treats a 'recovered' terminal status as success, not failure", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-r" }),
      getJob: vi.fn().mockResolvedValue({ status: "recovered" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
        .mockResolvedValueOnce({
          messages: [
            { id: "p", role: "assistant", packet: { type: "sql_query", payload: {}, valid: true } },
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

    chat.send("complex");
    await flushPromises();

    expect(onPacket).toHaveBeenCalled();
    expect(chat.messages.value.some((m) => m.error)).toBe(false);
  });

  it.each(["failed", "timeout", "canceled", "throttled", "superseded", "some_new_status"])(
    "reports terminal status %s visibly and stops polling",
    async (status) => {
      const apiAdapter = makeAdapter({
        sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-x" }),
        getJob: vi.fn().mockResolvedValue({ status }),
      });
      const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
      await chat.init();

      chat.send("complex");
      await flushPromises();

      expect(apiAdapter.getJob).toHaveBeenCalledTimes(1);
      const working = chat.messages.value.find((m) => m.jobId === "job-x")!;
      expect(working.working).toBe(false);
      expect(working.error).toContain(status);
      expect(working.retryable).toBe(true);
    }
  );

  it("keeps polling through in-progress statuses", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-q" }),
      getJob: vi
        .fn()
        .mockResolvedValueOnce({ status: "queued" })
        .mockResolvedValueOnce({ status: "running" })
        .mockResolvedValueOnce({ status: "completed" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    expect(apiAdapter.getJob).toHaveBeenCalledTimes(3);
  });

  it("surfaces live job telemetry onto the working message", async () => {
    let resolveJob!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-t" }),
      getJob: vi
        .fn()
        .mockResolvedValueOnce({ status: "running", elapsed_seconds: 12, summary: "Searching" })
        .mockImplementation(() => new Promise((r) => (resolveJob = r))),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    const working = chat.messages.value.find((m) => m.jobId === "job-t")!;
    expect(working.job?.elapsed_seconds).toBe(12);
    expect(working.job?.summary).toBe("Searching");
    resolveJob({ status: "failed" });
    await flushPromises();
  });

  it("streams job-reported steps onto the working message", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-s" }),
      getJob: vi.fn().mockResolvedValue({
        status: "failed",
        steps: [{ id: "s1", label: "Ran query", status: "ok" }],
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    expect(chat.messages.value.find((m) => m.jobId === "job-s")?.steps).toHaveLength(1);
  });

  it("surfaces a visible timeout rather than polling forever", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-to" }),
      getJob: vi.fn().mockResolvedValue({ status: "running" }),
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
    expect(chat.messages.value.find((m) => m.jobId === "job-to")?.error).toMatch(/timed out/i);
  });

  // A job that ages out of the worker's registry 404s even though it already
  // SUCCEEDED and wrote its result. Trusting the poll alone reports a false failure.
  it("reloads before declaring failure, and recovers when the result already landed", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-gone" }),
      getJob: vi.fn().mockRejectedValue(new Error("Job not found")),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
        .mockResolvedValueOnce({
          messages: [
            { id: "u", role: "user", text: "complex" },
            {
              id: "p",
              role: "assistant",
              packet: { type: "sql_query", payload: { sql: "SELECT 3" }, valid: true },
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

    chat.send("complex");
    await flushPromises();

    expect(onPacket).toHaveBeenCalled();
    expect(chat.messages.value.some((m) => m.error)).toBe(false);
  });

  it("reports the poll failure when the reload shows no result landed", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-e" }),
      getJob: vi.fn().mockRejectedValue(new Error("network down")),
      getThread: vi.fn().mockResolvedValue({ messages: [] }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    expect(chat.messages.value.find((m) => m.jobId === "job-e")?.error).toBe("network down");
  });

  it("reports the poll failure when the recovery reload itself fails", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-rr" }),
      getJob: vi.fn().mockRejectedValue(new Error("network down")),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
        .mockRejectedValue(new Error("reload failed")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    expect(chat.messages.value.find((m) => m.jobId === "job-rr")?.error).toBe("network down");
  });

  it("surfaces a visible error when the post-success reload fails", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-pr" }),
      getJob: vi.fn().mockResolvedValue({ status: "completed" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
        .mockRejectedValueOnce(new Error("reload failed")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    expect(chat.messages.value.find((m) => m.jobId === "job-pr")?.error).toBe("reload failed");
  });

  it("resumes polling an in-flight job on init after a remount", async () => {
    globalThis.sessionStorage.setItem("agent-chat:pendingJob:SAQ-1", "job-resume");
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      getJob: vi.fn().mockResolvedValue({ status: "completed" }),
      getThread: vi
        .fn()
        .mockResolvedValueOnce({ messages: [] })
        .mockResolvedValueOnce({
          messages: [
            { id: "p", role: "assistant", packet: { type: "sql_query", payload: {}, valid: true } },
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
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledWith("job-resume");
    expect(onPacket).toHaveBeenCalled();
  });

  it("keeps a queued message waiting until an escalated send finishes polling", async () => {
    let resolveJob!: (value: { status: string }) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce({ dispatched: true, job_id: "job-1" })
        .mockResolvedValueOnce({ dispatched: false, reply: "second done" }),
      getJob: vi.fn().mockImplementation(() => new Promise((r) => (resolveJob = r))),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("first");
    chat.send("second");
    await flushPromises();

    expect(chat.queue.value).toEqual(["second"]);
    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(1);

    resolveJob({ status: "completed" });
    await flushPromises();

    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(2);
  });
});

describe("useAgentChat streaming", () => {
  it("appends tokens into a live message and clears streaming on completion", async () => {
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockImplementation(async (_id, _text, handlers) => {
        handlers.onToken("Hel");
        handlers.onToken("lo");
        handlers.onStep?.({ id: "s1", label: "Looked up route" });
        return { dispatched: false, reply: "Hello" };
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    const assistant = chat.messages.value.find((m) => m.role === "assistant")!;
    expect(assistant.text).toBe("Hello");
    expect(assistant.streaming).toBe(false);
    expect(assistant.steps).toHaveLength(1);
    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("attaches a packet delivered at the end of a stream", async () => {
    const onPacket = vi.fn();
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockImplementation(async (_id, _text, handlers) => {
        handlers.onToken("done");
        return {
          dispatched: false,
          reply: "done",
          packet: { type: "sql_query", payload: {}, valid: true },
        };
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
    chat.send("hi");
    await flushPromises();
    expect(onPacket).toHaveBeenCalled();
  });

  it("drops an empty placeholder when the stream fails before any token", async () => {
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockRejectedValue(new Error("stream_died")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    expect(chat.messages.value.filter((m) => m.role === "assistant")).toHaveLength(0);
    expect(chat.messages.value.find((m) => m.role === "user")?.error).toBe("stream_died");
  });

  it("keeps partial text when the stream fails mid-way", async () => {
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockImplementation(async (_id, _text, handlers) => {
        handlers.onToken("partial");
        throw new Error("stream_died");
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    const assistant = chat.messages.value.find((m) => m.role === "assistant")!;
    expect(assistant.text).toBe("partial");
    expect(assistant.streaming).toBe(false);
  });
});

describe("useAgentChat stop / retry / feedback / clear", () => {
  it("stops an in-flight send without recording it as an error", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockImplementation(
        (_id, _text, signal: AbortSignal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new Error("aborted")));
          })
      ),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();
    chat.stop();
    await flushPromises();

    expect(chat.sending.value).toBe(false);
    expect(chat.messages.value.find((m) => m.role === "user")?.error).toBeUndefined();
  });

  it("cancels the upstream job when the adapter supports it", async () => {
    const cancelJob = vi.fn().mockResolvedValue(undefined);
    let resolveJob!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-c" }),
      getJob: vi.fn().mockImplementation(() => new Promise((r) => (resolveJob = r))),
      cancelJob,
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();
    chat.stop();

    expect(cancelJob).toHaveBeenCalledWith("job-c");
    resolveJob({ status: "canceled" });
    await flushPromises();
  });

  it("does nothing when stop is called with no send in flight", async () => {
    const apiAdapter = makeAdapter({ cancelJob: vi.fn() });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.stop();
    expect(apiAdapter.cancelJob).not.toHaveBeenCalled();
  });

  it("swallows an upstream cancel rejection", async () => {
    const cancelJob = vi.fn().mockRejectedValue(new Error("cancel failed"));
    let resolveJob!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-c" }),
      getJob: vi.fn().mockImplementation(() => new Promise((r) => (resolveJob = r))),
      cancelJob,
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    expect(() => chat.stop()).not.toThrow();
    resolveJob({ status: "canceled" });
    await flushPromises();
  });

  it("marks a stopped escalation on the working message", async () => {
    let resolveJob!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-s" }),
      getJob: vi.fn().mockImplementation(() => new Promise((r) => (resolveJob = r))),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("complex");
    await flushPromises();
    chat.stop();
    resolveJob({ status: "running" });
    await flushPromises();
    expect(chat.messages.value.find((m) => m.jobId === "job-s")?.error).toBe("Stopped.");
  });

  it("retry re-sends the last user message and drops the failed turn", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi
        .fn()
        .mockRejectedValueOnce(new Error("upstream_error"))
        .mockResolvedValueOnce({ dispatched: false, reply: "ok" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();
    expect(chat.messages.value.find((m) => m.role === "user")?.error).toBe("upstream_error");

    chat.retry();
    await flushPromises();

    expect(apiAdapter.sendMessage).toHaveBeenCalledTimes(2);
    expect(chat.messages.value.filter((m) => m.role === "user")).toHaveLength(1);
    expect(chat.messages.value.some((m) => m.error)).toBe(false);
  });

  it("retry is a no-op when there is no user message to resend", async () => {
    const apiAdapter = makeAdapter();
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.retry();
    await flushPromises();
    expect(apiAdapter.sendMessage).not.toHaveBeenCalled();
  });

  it("records feedback on a message, and ignores an unknown id", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi
        .fn()
        .mockResolvedValue({ messages: [{ id: "a1", role: "assistant", text: "x" }] }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.setFeedback("a1", "up");
    expect(chat.messages.value.find((m) => m.id === "a1")?.feedback).toBe("up");

    expect(() => chat.setFeedback("nope", "down")).not.toThrow();
  });

  it("clear empties the local transcript and queue", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi
        .fn()
        .mockResolvedValue({ messages: [{ id: "a1", role: "assistant", text: "x" }] }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.clear();

    expect(chat.messages.value).toEqual([]);
    expect(chat.queue.value).toEqual([]);
    expect(chat.error.value).toBeNull();
  });
});

describe("useAgentChat derived state", () => {
  it("isEmpty ignores system bookkeeping messages", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({
        messages: [{ id: "s", role: "assistant", text: "marker", metadata: { type: "system" } }],
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.isEmpty.value).toBe(true);
  });

  it("isEmpty is false once a real message exists", async () => {
    const apiAdapter = makeAdapter({
      getThread: vi.fn().mockResolvedValue({ messages: [{ id: "1", role: "user", text: "hi" }] }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.isEmpty.value).toBe(false);
  });

  it("busy tracks the in-flight send", async () => {
    let resolveFirst!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockImplementation(() => new Promise((r) => (resolveFirst = r))),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    expect(chat.busy.value).toBe(false);
    chat.send("hi");
    await flushPromises();
    expect(chat.busy.value).toBe(true);
    resolveFirst({ dispatched: false, reply: "ok" });
    await flushPromises();
    expect(chat.busy.value).toBe(false);
  });
});

describe("useAgentChat mid-session failures", () => {
  it("flips a ready session to 'unavailable' on a revoked token", async () => {
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

  it("stays usable after an ordinary send error and marks it retryable", async () => {
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockRejectedValue(new Error("upstream_error")),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    expect(chat.status.value).toBe("ready");
    const user = chat.messages.value.find((m) => m.role === "user")!;
    expect(user.error).toBe("upstream_error");
    expect(user.retryable).toBe(true);
  });

  it("stringifies a non-Error rejection", async () => {
    const apiAdapter = makeAdapter({ sendMessage: vi.fn().mockRejectedValue("plain string") });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();
    chat.send("hi");
    await flushPromises();
    expect(chat.messages.value.find((m) => m.role === "user")?.error).toBe("plain string");
  });
});

describe("useAgentChat storage resilience", () => {
  it("treats a blocked sessionStorage read as no pending job", async () => {
    const spy = vi.spyOn(globalThis.sessionStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const apiAdapter = makeAdapter();
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });

    await chat.init();

    expect(chat.status.value).toBe("ready");
    expect(apiAdapter.getJob).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("keeps polling when sessionStorage writes are blocked", async () => {
    const setSpy = vi.spyOn(globalThis.sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const removeSpy = vi.spyOn(globalThis.sessionStorage, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-b" }),
      getJob: vi.fn().mockResolvedValue({ status: "completed" }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("complex");
    await flushPromises();

    expect(apiAdapter.getJob).toHaveBeenCalledWith("job-b");
    setSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe("useAgentChat defaults", () => {
  it("uses the real default poll interval when none is injected", async () => {
    vi.useFakeTimers();
    try {
      const apiAdapter = makeAdapter({
        sendMessage: vi.fn().mockResolvedValue({ dispatched: true, job_id: "job-default" }),
        getJob: vi.fn().mockResolvedValue({ status: "completed" }),
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
});

describe("useAgentChat streaming finalization", () => {
  it("applies steps and citations delivered only in the stream's final result", async () => {
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockImplementation(async (_id, _text, handlers) => {
        handlers.onToken("done");
        return {
          dispatched: false,
          reply: "done",
          steps: [{ id: "s1", label: "Summarized" }],
          citations: [{ id: "c1", title: "calls table" }],
        };
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    const assistant = chat.messages.value.find((m) => m.role === "assistant")!;
    expect(assistant.steps).toHaveLength(1);
    expect(assistant.citations).toHaveLength(1);
  });

  it("keeps the streamed text when the final result carries no authoritative reply", async () => {
    const apiAdapter = makeAdapter({
      streamMessage: vi.fn().mockImplementation(async (_id, _text, handlers) => {
        handlers.onToken("streamed only");
        return { dispatched: false };
      }),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();

    expect(chat.messages.value.find((m) => m.role === "assistant")?.text).toBe("streamed only");
  });

  it("does not record a result when a stopped send resolves after the abort", async () => {
    let resolveSend!: (v: unknown) => void;
    const apiAdapter = makeAdapter({
      sendMessage: vi.fn().mockImplementation(() => new Promise((r) => (resolveSend = r))),
    });
    const chat = useAgentChat({ apiAdapter, contextType: "c", contextId: "d", ...NO_DELAY });
    await chat.init();

    chat.send("hi");
    await flushPromises();
    chat.stop();
    // The adapter ignored the abort signal and resolved anyway.
    resolveSend({ dispatched: false, reply: "late reply" });
    await flushPromises();

    expect(chat.messages.value.some((m) => m.text === "late reply")).toBe(false);
  });
});
