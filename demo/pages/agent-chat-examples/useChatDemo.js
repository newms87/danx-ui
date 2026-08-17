/**
 * Mock ChatAdapter factories for the DanxAgentChat demos.
 *
 * DanxAgentChat ships no default backend, so every demo needs its own adapter.
 * These fakes model the real danxbot / SMS-Analytics contract — fast replies,
 * escalated jobs polled to completion, typed packets with tri-state validity,
 * and the error codes the proxy actually returns — so the demos exercise the
 * same paths a real integration does.
 *
 * Registered in demo/composables/useLivePreview.ts so live-editable examples
 * can import them (imports there resolve from a flat registry, not from Vite).
 */

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let seq = 0;
function nextId(prefix) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function stamp(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

/**
 * Base adapter: a thread store keyed by contextType:contextId, plus a
 * `reply(text)` hook each demo overrides to decide what comes back.
 */
function createBaseAdapter(options) {
  const { reply, history = [], latency = 400 } = options;
  const threads = {};

  return {
    async resolveThread({ contextType, contextId }) {
      await delay(200);
      const threadId = `${contextType}:${contextId}`;
      // Seed from a COPY so the demo's history constant is never mutated.
      if (!threads[threadId]) threads[threadId] = history.map((m) => ({ ...m }));
      return { thread_id: threadId };
    },
    async getThread(threadId) {
      await delay(120);
      // Return a copy — an adapter handing out its live array lets a consumer
      // mutate the store by accident.
      return { messages: (threads[threadId] || []).map((m) => ({ ...m })) };
    },
    async sendMessage(threadId, text) {
      await delay(latency);
      const thread = threads[threadId];
      thread.push({ id: nextId("srv"), role: "user", text, timestamp: stamp() });
      const result = reply(text, thread);
      if (!result.dispatched) {
        thread.push({
          id: nextId("srv"),
          role: "assistant",
          text: result.reply,
          packet: result.packet,
          steps: result.steps,
          citations: result.citations,
          timestamp: stamp(),
        });
      }
      return result;
    },
    async getJob() {
      return { status: "completed" };
    },
  };
}

/** A plain question-and-answer assistant with markdown replies. */
export function createBasicAdapter() {
  return createBaseAdapter({
    reply(text) {
      return {
        dispatched: false,
        reply: [
          `You asked about **${text}**.`,
          "",
          "Here's what I found:",
          "",
          "- Grouped messages share one avatar and timestamp",
          "- Send a few messages quickly to see the queue strip",
          "- Hover a turn to reveal copy and feedback actions",
        ].join("\n"),
      };
    },
  });
}

/** Shows markdown: headings, lists, tables, inline and block code. */
export function createMarkdownAdapter() {
  return createBaseAdapter({
    reply() {
      return {
        dispatched: false,
        reply: [
          "### Top routes this week",
          "",
          "| Route | Volume | Change |",
          "|-------|--------|--------|",
          "| US-East | 12,480 | +4% |",
          "| US-West | 9,120 | -2% |",
          "",
          "Use `route_id` to join against the carrier table:",
          "",
          "```sql",
          "SELECT route_id, SUM(volume)",
          "FROM calls",
          "GROUP BY route_id",
          "ORDER BY 2 DESC;",
          "```",
          "",
          "> Volumes exclude test traffic.",
        ].join("\n"),
      };
    },
  });
}

/**
 * The SMS-Analytics integration: a `sql_query` packet the consumer applies to
 * an editor. Covers all three validity states plus the repaired badge.
 */
export function createPacketAdapter() {
  return createBaseAdapter({
    reply(text) {
      const lower = text.toLowerCase();
      if (lower.includes("drop") || lower.includes("delete")) {
        return {
          dispatched: false,
          reply: "I can only produce read-only queries.",
          packet: {
            type: "sql_query",
            payload: { sql: "DROP TABLE calls" },
            valid: false,
            error: 'only_select_allowed: got "drop"',
          },
        };
      }
      if (lower.includes("repair") || lower.includes("fix")) {
        return {
          dispatched: false,
          reply: "My first attempt didn't validate, so I corrected it.",
          packet: {
            type: "sql_query",
            payload: { sql: "SELECT phone_number FROM numbers WHERE is_primary = true" },
            valid: true,
            repaired: true,
          },
        };
      }
      if (lower.includes("chart") || lower.includes("graph")) {
        return {
          dispatched: false,
          reply: "Here's the weekly breakdown.",
          packet: {
            type: "chart_data",
            payload: { labels: ["Mon", "Tue", "Wed", "Thu"], values: [12, 19, 7, 15] },
            valid: true,
          },
        };
      }
      if (lower.includes("unknown") || lower.includes("raw")) {
        // No `valid` field at all — the tri-state "not validated" case, which
        // falls back to the JSON viewer.
        return {
          dispatched: false,
          reply: "I don't have a renderer registered for this one.",
          packet: { type: "carrier_report", payload: { carrier: "Acme", errors: 3 } },
        };
      }
      return {
        dispatched: false,
        reply: "Here's the query.",
        packet: {
          type: "sql_query",
          payload: { sql: "SELECT phone_number FROM numbers WHERE is_primary = true" },
          valid: true,
        },
      };
    },
  });
}

/**
 * Escalation: the backend dispatches a long-running job, the component polls
 * it, and the result lands in the thread on completion.
 */
export function createEscalationAdapter() {
  const threads = {};
  const jobs = {};

  return {
    async resolveThread({ contextType, contextId }) {
      await delay(200);
      const threadId = `${contextType}:${contextId}`;
      if (!threads[threadId]) threads[threadId] = [];
      return { thread_id: threadId };
    },
    async getThread(threadId) {
      await delay(120);
      return { messages: (threads[threadId] || []).map((m) => ({ ...m })) };
    },
    async sendMessage(threadId, text) {
      await delay(300);
      threads[threadId].push({ id: nextId("srv"), role: "user", text, timestamp: stamp() });
      const jobId = nextId("job");
      jobs[jobId] = { threadId, polls: 0, startedAt: Date.now() };
      return { dispatched: true, job_id: jobId, status: "queued" };
    },
    async getJob(jobId) {
      await delay(600);
      const job = jobs[jobId];
      job.polls += 1;
      const elapsed = (Date.now() - job.startedAt) / 1000;

      const steps = [
        { id: `${jobId}-1`, label: "Loaded schema", kind: "read", durationMs: 240, status: "ok" },
        {
          id: `${jobId}-2`,
          label: "Scanned 4.2M call records",
          kind: "search",
          durationMs: 1800,
          status: job.polls > 1 ? "ok" : "running",
        },
      ];

      if (job.polls < 3) {
        return { status: "running", elapsed_seconds: elapsed, summary: "Analyzing call volume", steps };
      }

      threads[job.threadId].push({
        id: nextId("srv"),
        role: "assistant",
        text: "Finished the long-running analysis.",
        steps: steps.map((s) => ({ ...s, status: "ok" })),
        packet: {
          type: "sql_query",
          payload: { sql: "SELECT region, SUM(volume) FROM calls GROUP BY region" },
          valid: true,
        },
        citations: [{ id: nextId("cite"), title: "calls", source: "warehouse.calls" }],
        timestamp: stamp(),
      });
      return { status: "completed", elapsed_seconds: elapsed };
    },
    async cancelJob() {
      await delay(100);
    },
  };
}

/** Streams a reply token-by-token, with a live caret and a working Stop. */
export function createStreamingAdapter() {
  const threads = {};
  const SENTENCE =
    "Streaming keeps the first token fast, so the answer starts appearing " +
    "immediately instead of after the whole reply is generated. Press Stop at " +
    "any time — the partial answer is kept, never discarded.";

  return {
    async resolveThread({ contextType, contextId }) {
      await delay(200);
      const threadId = `${contextType}:${contextId}`;
      if (!threads[threadId]) threads[threadId] = [];
      return { thread_id: threadId };
    },
    async getThread(threadId) {
      await delay(120);
      return { messages: (threads[threadId] || []).map((m) => ({ ...m })) };
    },
    async streamMessage(threadId, text, handlers, signal) {
      await delay(250);
      threads[threadId].push({ id: nextId("srv"), role: "user", text, timestamp: stamp() });
      handlers.onStep({ id: nextId("step"), label: "Drafting reply", kind: "reasoning", status: "ok" });

      const words = SENTENCE.split(" ");
      for (const word of words) {
        if (signal.aborted) break;
        await delay(45);
        handlers.onToken(word + " ");
      }
      return { dispatched: false };
    },
    async sendMessage() {
      return { dispatched: false, reply: "" };
    },
    async getJob() {
      return { status: "completed" };
    },
    async cancelJob() {},
  };
}

/** Every failure path: unreachable chat, failed job, and a retryable send error. */
export function createFailureAdapter(mode) {
  if (mode === "unavailable") {
    return {
      async resolveThread() {
        await delay(250);
        // The literal code the proxy returns on a revoked/expired token.
        throw new Error("chat_unavailable");
      },
      async getThread() {
        return { messages: [] };
      },
      async sendMessage() {
        return { dispatched: false, reply: "" };
      },
      async getJob() {
        return { status: "completed" };
      },
    };
  }

  const threads = {};
  return {
    async resolveThread({ contextType, contextId }) {
      await delay(200);
      const threadId = `${contextType}:${contextId}`;
      if (!threads[threadId]) threads[threadId] = [];
      return { thread_id: threadId };
    },
    async getThread(threadId) {
      await delay(120);
      return { messages: (threads[threadId] || []).map((m) => ({ ...m })) };
    },
    async sendMessage(threadId, text) {
      await delay(400);
      if (mode === "job-failed") {
        threads[threadId].push({ id: nextId("srv"), role: "user", text, timestamp: stamp() });
        return { dispatched: true, job_id: nextId("job") };
      }
      throw new Error("upstream_error");
    },
    async getJob() {
      await delay(500);
      // A terminal status the component surfaces verbatim rather than
      // polling into a fake timeout.
      return { status: "failed" };
    },
  };
}

/**
 * A thread that already has history — including a `metadata.type: "system"`
 * bookkeeping comment the component must never render — plus a second human
 * participant and a day-old turn so grouping and day dividers are visible.
 */
export function createHistoryAdapter() {
  const DAY = 86400000;
  return createBaseAdapter({
    history: [
      {
        id: "h1",
        role: "user",
        author: "Dana",
        text: "Can you pull primary numbers for the US?",
        timestamp: stamp(-DAY - 3600000),
      },
      {
        id: "h2",
        role: "assistant",
        text: "Sure — here's the query.",
        packet: {
          type: "sql_query",
          payload: { sql: "SELECT phone_number FROM numbers WHERE country = 'US'" },
          valid: true,
        },
        timestamp: stamp(-DAY - 3599000),
      },
      {
        id: "h3",
        role: "assistant",
        text: "last_run_at marker",
        metadata: { type: "system" },
        timestamp: stamp(-DAY - 3598000),
      },
      { id: "h4", role: "user", author: "Sam", text: "Thanks!", timestamp: stamp(-7200000) },
      { id: "h5", role: "user", author: "Sam", text: "One more thing…", timestamp: stamp(-7199000) },
      {
        id: "h6",
        role: "assistant",
        text: "Go ahead — I'm listening.",
        timestamp: stamp(-7198000),
      },
    ],
    reply() {
      return { dispatched: false, reply: "Got it." };
    },
  });
}

/** Replies with a long answer plus citations and attachments. */
export function createRichAdapter() {
  return createBaseAdapter({
    reply() {
      return {
        dispatched: false,
        reply:
          "Carrier routing is negotiated per corridor. " +
          "Each corridor has its own rate card, and the rate card is versioned " +
          "so historical invoices stay reproducible. ".repeat(8),
        steps: [
          { id: nextId("s"), label: "Searched routing docs", kind: "search", durationMs: 320, status: "ok" },
          {
            id: nextId("s"),
            label: "Read corridor-rates.md",
            kind: "read",
            durationMs: 90,
            status: "ok",
            detail: "corridor-rates.md\n\n## Versioning\nRate cards are immutable once published.",
          },
        ],
        citations: [
          { id: nextId("c"), title: "Corridor rates", source: "docs/corridor-rates.md" },
          { id: nextId("c"), title: "Invoice reproducibility", source: "docs/invoices.md" },
        ],
      };
    },
  });
}

/**
 * A thread carrying file attachments in the library's PreviewFile shape —
 * an image with a thumbnail, a document, one still uploading, and one that
 * failed. The same shape any DanxFileUpload field produces.
 */
export function createAttachmentAdapter() {
  const swatch = (hex) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="${hex}"/></svg>`
    )}`;

  return createBaseAdapter({
    history: [
      {
        id: "a1",
        role: "user",
        text: "Here are the exports from last week — anything odd?",
        attachments: [
          {
            id: "f1",
            name: "call-volume.png",
            size: 184320,
            mime: "image/png",
            url: swatch("#2563eb"),
            thumb: { url: swatch("#2563eb") },
          },
          { id: "f2", name: "carriers.csv", size: 20481, mime: "text/csv", url: "#" },
        ],
        timestamp: stamp(-600000),
      },
      {
        id: "a2",
        role: "assistant",
        text: "Volume looks flat except Tuesday. The carrier file has 3 rows with no routing code.",
        timestamp: stamp(-599000),
      },
      {
        id: "a3",
        role: "user",
        text: "Uploading the raw dump too.",
        attachments: [
          { id: "f3", name: "raw-dump.zip", size: 88400000, mime: "application/zip", url: "", progress: 62 },
          {
            id: "f4",
            name: "screenshot.png",
            size: 40960,
            mime: "image/png",
            url: "",
            error: "Upload failed — file exceeds 25 MB",
          },
        ],
        timestamp: stamp(-60000),
      },
    ],
    reply() {
      return { dispatched: false, reply: "Got the files — reading them now." };
    },
  });
}
