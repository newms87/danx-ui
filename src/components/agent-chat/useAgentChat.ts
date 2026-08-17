import { computed, ref, type ComputedRef, type Ref } from "vue";
import type {
  ChatAdapter,
  ChatFeedback,
  ChatJobStatus,
  ChatMessage,
  ChatPacket,
  ChatStep,
} from "./types";

// The danxbot job-status vocabulary (agent-types.ts `AgentJob["status"]`).
//
// IN_PROGRESS = worth polling past. SUCCESS = the agent landed its work.
// ANYTHING ELSE — a known failure, or a status we don't recognize — is a
// terminal failure, surfaced visibly rather than polled until a bogus timeout.
//
// `recovered` is a SUCCESS: it means a stream-idle synthetic recovery still
// landed the dispatch. Treating it as a failure (as an earlier revision did)
// reports a completed job as broken.
const IN_PROGRESS_STATUSES = new Set(["queued", "running"]);
const SUCCESS_STATUSES = new Set(["completed", "recovered"]);

// Stable backend code for an unreachable/revoked-token chat. Matched by exact
// equality (never a substring sniff) so renaming it fails a test rather than
// silently degrading the "chat unavailable" state.
const CHAT_UNAVAILABLE_CODE = "chat_unavailable";

function pendingJobKey(threadId: string | null): string {
  return `agent-chat:pendingJob:${threadId}`;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export type ChatStatus = "idle" | "resolving" | "ready" | "unavailable" | "error";

export interface UseAgentChatOptions {
  /** App-supplied backend adapter — no default; every app's backend differs. */
  apiAdapter: ChatAdapter;
  contextType: string;
  contextId: string;
  onPacket?: (packet: ChatPacket) => void;
  onThreadReady?: (threadId: string) => void;
  onError?: (error: unknown) => void;
  /** Delay between escalation-status polls. @default 1500 */
  pollIntervalMs?: number;
  /** Maximum poll attempts before surfacing a visible timeout. @default 120 */
  maxPollAttempts?: number;
  /** Injectable delay, overridden in tests for deterministic polling. */
  delay?: (ms: number) => Promise<void>;
}

export interface UseAgentChatReturn {
  messages: Ref<ChatMessage[]>;
  /** Texts waiting BEHIND the in-flight send (serial strip). */
  queue: Ref<string[]>;
  sending: Ref<boolean>;
  status: Ref<ChatStatus>;
  error: Ref<string | null>;
  threadId: Ref<string | null>;
  /** True while a send/stream/poll is in flight and can be stopped. */
  busy: ComputedRef<boolean>;
  /** True when the thread has no renderable (non-system) messages. */
  isEmpty: ComputedRef<boolean>;
  /** Resolve the thread, load history, and resume any in-flight escalation. */
  init: () => Promise<void>;
  /** Enqueue a message. Strictly serial. */
  send: (text: string) => void;
  /**
   * Halt the pipeline: abort the in-flight request (and the escalated job,
   * when the adapter supports it) without dispatching whatever is queued
   * behind it. The queue survives — the next send() resumes it.
   */
  stop: () => void;
  /** Re-send the last user message after a failure. */
  retry: () => void;
  /** Remove a queued message that hasn't been sent yet. */
  dequeue: (index: number) => void;
  /** Record consumer feedback on a message. */
  setFeedback: (messageId: string, feedback: ChatFeedback) => void;
  /** Drop every local message (does not touch the server thread). */
  clear: () => void;
}

/**
 * useAgentChat Composable
 *
 * A chat session bound to one (contextType, contextId). Owns thread
 * resolution, history load, strictly-serial send with a visible queue,
 * optional token streaming, cancellation, retry, and stateless escalation
 * polling that survives a component remount (the in-flight job id is stashed
 * in sessionStorage and resumed on init).
 */
export function useAgentChat(options: UseAgentChatOptions): UseAgentChatReturn {
  const {
    apiAdapter,
    contextType,
    contextId,
    onPacket = () => {},
    onThreadReady = () => {},
    onError = () => {},
    pollIntervalMs = 1500,
    maxPollAttempts = 120,
    delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;

  const messages = ref<ChatMessage[]>([]);
  const queue = ref<string[]>([]);
  const sending = ref(false);
  const status = ref<ChatStatus>("idle");
  const error = ref<string | null>(null);
  const threadId = ref<string | null>(null);

  let localSeq = 0;
  const localId = () => `local-${localSeq++}`;
  // Locally-created (optimistic) messages get a client timestamp so every
  // message — not just server-loaded ones — can show a relative time.
  const stamp = () => new Date().toISOString();

  /** Abort controller for the in-flight send/stream. */
  let controller: AbortController | null = null;
  /** Job id currently being polled, so stop() can cancel it upstream. */
  let pollingJobId: string | null = null;
  /** Set by stop() so in-flight loops unwind without reporting an error. */
  let aborted = false;

  const busy = computed(() => sending.value);
  const isEmpty = computed(() => visibleMessages(messages.value).length === 0 && !sending.value);

  function visibleMessages(list: ChatMessage[]): ChatMessage[] {
    return list.filter((m) => m.role !== "system" && m.metadata?.type !== "system");
  }

  function fail(err: unknown, { unavailable = false }: { unavailable?: boolean } = {}) {
    error.value = errorMessage(err);
    // The caller decides whether this is the terminal "chat unavailable" state
    // — no string-sniffing of the error message here.
    if (unavailable) status.value = "unavailable";
    onError(err);
  }

  function isUnavailable(err: unknown): boolean {
    return err instanceof Error && err.message === CHAT_UNAVAILABLE_CODE;
  }

  function readPendingJob(): string | null {
    try {
      return globalThis.sessionStorage?.getItem(pendingJobKey(threadId.value)) || null;
    } catch {
      return null;
    }
  }
  function writePendingJob(jobId: string) {
    try {
      globalThis.sessionStorage?.setItem(pendingJobKey(threadId.value), jobId);
    } catch {
      /* sessionStorage unavailable — polling still works in-session */
    }
  }
  function clearPendingJob() {
    try {
      globalThis.sessionStorage?.removeItem(pendingJobKey(threadId.value));
    } catch {
      /* no-op */
    }
  }

  /**
   * How many messages the server held at the last successful reload. Tracked
   * separately from `messages.value` (which also carries local placeholders)
   * so "did the agent's result land?" is answerable without comparing object
   * identity against a reactive proxy.
   */
  let serverMessageCount = 0;

  async function reloadThread() {
    const data = await apiAdapter.getThread(threadId.value as string);
    // COPY the adapter's array — never alias it. The composable pushes
    // optimistic/placeholder messages onto messages.value, and an adapter that
    // returns a live internal array (a cache, a store) would otherwise be
    // silently mutated by this component, duplicating every message.
    const list = [...(data.messages ?? [])];
    serverMessageCount = list.length;
    messages.value = list;
  }

  /**
   * Push a message and return the REACTIVE proxy for it. Mutating the raw
   * object we pushed would update the data but bypass the proxy that the
   * render tracks, so anything mutated later (streamed text, job telemetry)
   * must go through this reference.
   */
  function pushMessage(message: ChatMessage): ChatMessage {
    messages.value.push(message);
    return messages.value[messages.value.length - 1]!;
  }

  function latestPacket(): ChatPacket | null {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const packet = messages.value[i]?.packet;
      if (packet) return packet;
    }
    return null;
  }

  async function init() {
    status.value = "resolving";
    error.value = null;
    let resolved;
    try {
      resolved = await apiAdapter.resolveThread({ contextType, contextId });
    } catch (err) {
      fail(err, { unavailable: true });
      return;
    }
    threadId.value = resolved.thread_id;
    if (!threadId.value) {
      fail(new Error(CHAT_UNAVAILABLE_CODE), { unavailable: true });
      return;
    }
    try {
      await reloadThread();
    } catch (err) {
      fail(err, { unavailable: true });
      return;
    }
    status.value = "ready";
    onThreadReady(threadId.value);

    // Resume an escalation that was still running when we last unmounted.
    const pending = readPendingJob();
    if (pending) resumePolling(pending);
  }

  /** Enqueue a message. Strictly serial — see drain(). */
  function send(text: string) {
    if (typeof text !== "string" || !text.trim()) return;
    if (status.value === "unavailable") return;
    queue.value.push(text.trim());
    drain();
  }

  function dequeue(index: number) {
    queue.value.splice(index, 1);
  }

  /** Re-send the last user message, dropping the failed turn's error state. */
  function retry() {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const message = messages.value[i]!;
      if (message.role === "user" && message.text) {
        // Drop the failed turn (and anything after it) so the retry reads as
        // one attempt, not a growing pile of identical failures.
        messages.value = messages.value.slice(0, i);
        send(message.text);
        return;
      }
    }
  }

  /** Abort the in-flight request, and the escalated job when supported. */
  function stop() {
    if (!sending.value) return;
    aborted = true;
    controller?.abort();
    if (pollingJobId && apiAdapter.cancelJob) {
      // Fire-and-forget: the local state unwinds regardless of whether the
      // upstream cancel succeeds, but a supported cancel must actually be sent.
      void apiAdapter.cancelJob(pollingJobId).catch(() => {});
    }
    clearPendingJob();
  }

  function setFeedback(messageId: string, feedback: ChatFeedback) {
    const message = messages.value.find((m) => m.id === messageId);
    if (message) message.feedback = feedback;
  }

  function clear() {
    messages.value = [];
    queue.value = [];
    error.value = null;
  }

  async function drain() {
    if (sending.value) return; // one send fully resolves before the next starts
    const next = queue.value.shift();
    if (next === undefined) return;
    sending.value = true;
    aborted = false;
    controller = new AbortController();
    try {
      await runSend(next);
    } finally {
      sending.value = false;
      controller = null;
      pollingJobId = null;
    }
    // Stop halts the PIPELINE, not just the one request. Draining here after an
    // abort would immediately dispatch the next queued message, so pressing
    // Stop would still send work. The queue is left standing (never discarded —
    // it is the user's own text, still visible and removable in the strip); the
    // next send() resumes it.
    if (aborted) return;
    drain();
  }

  async function runSend(text: string) {
    const optimistic: ChatMessage = {
      id: localId(),
      role: "user",
      text,
      pending: true,
      timestamp: stamp(),
    };
    const optimisticRef = pushMessage(optimistic);

    const signal = controller!.signal;
    let resp;
    try {
      resp = apiAdapter.streamMessage
        ? await runStream(text, signal)
        : await apiAdapter.sendMessage(threadId.value as string, text, signal);
    } catch (err) {
      optimisticRef.pending = false;
      if (aborted) return; // user-initiated stop is not a failure
      optimisticRef.error = errorMessage(err);
      optimisticRef.retryable = true;
      // A mid-session revoked/expired token surfaces here — flip to the
      // "chat unavailable" state (which disables the composer) rather than
      // leaving the user typing into a dead channel.
      fail(err, { unavailable: isUnavailable(err) });
      return;
    }
    optimisticRef.pending = false;
    if (aborted) return;

    if (resp.dispatched) {
      const working: ChatMessage = {
        id: localId(),
        role: "assistant",
        working: true,
        jobId: resp.job_id,
        steps: resp.steps ?? [],
        timestamp: stamp(),
      };
      const workingRef = pushMessage(working);
      writePendingJob(resp.job_id as string);
      await pollJob(workingRef);
      return;
    }

    // A streamed reply already appended its own assistant message.
    if (streamedMessage) {
      finalizeStreamed(resp);
      return;
    }

    const assistant: ChatMessage = {
      id: localId(),
      role: "assistant",
      text: resp.reply ?? null,
      timestamp: stamp(),
    };
    if (resp.packet) assistant.packet = resp.packet;
    if (resp.steps?.length) assistant.steps = resp.steps;
    if (resp.citations?.length) assistant.citations = resp.citations;
    messages.value.push(assistant);
    if (resp.packet) onPacket(resp.packet);
  }

  /** The assistant message currently being streamed into, if any. */
  let streamedMessage: ChatMessage | null = null;

  async function runStream(text: string, signal: AbortSignal) {
    const target: ChatMessage = {
      id: localId(),
      role: "assistant",
      text: "",
      streaming: true,
      steps: [],
      timestamp: stamp(),
    };
    const targetRef = pushMessage(target);
    streamedMessage = targetRef;
    try {
      return await apiAdapter.streamMessage!(
        threadId.value as string,
        text,
        {
          onToken: (chunk) => {
            targetRef.text = (targetRef.text ?? "") + chunk;
          },
          onStep: (step: ChatStep) => {
            targetRef.steps = [...(targetRef.steps ?? []), step];
          },
        },
        signal
      );
    } catch (err) {
      // Drop an empty placeholder so a failed stream doesn't leave a blank
      // bubble; keep partial text when some arrived (never delete user-visible
      // output on stop/failure).
      targetRef.streaming = false;
      if (!targetRef.text) {
        messages.value = messages.value.filter((m) => m.id !== targetRef.id);
      }
      streamedMessage = null;
      throw err;
    }
  }

  /** Apply the terminal result of a streamed reply to its live message. */
  function finalizeStreamed(resp: {
    reply?: string | null;
    packet?: ChatPacket;
    steps?: ChatStep[];
    citations?: import("./types").ChatCitation[];
  }) {
    const target = streamedMessage!;
    streamedMessage = null;
    target.streaming = false;
    // Prefer the authoritative final text when the backend sends one.
    if (typeof resp.reply === "string" && resp.reply) target.text = resp.reply;
    if (resp.packet) target.packet = resp.packet;
    if (resp.steps?.length) target.steps = resp.steps;
    if (resp.citations?.length) target.citations = resp.citations;
    if (resp.packet) onPacket(resp.packet);
  }

  function resumePolling(jobId: string) {
    const working: ChatMessage = {
      id: localId(),
      role: "assistant",
      working: true,
      jobId,
      steps: [],
      timestamp: stamp(),
    };
    const workingRef = pushMessage(working);
    // fire-and-forget: resuming shouldn't block init()'s caller
    void pollJob(workingRef);
  }

  /**
   * Reload the thread and report whether the escalated agent already wrote its
   * result. Used before declaring a poll failure: a job that ages out of the
   * worker's in-memory registry 404s even though it SUCCEEDED and already
   * persisted its packet, so trusting the poll alone reports a false failure.
   */
  async function resultAlreadyLanded(before: number): Promise<boolean> {
    try {
      await reloadThread();
    } catch {
      return false;
    }
    return serverMessageCount > before;
  }

  async function pollJob(working: ChatMessage) {
    pollingJobId = working.jobId ?? null;
    // Server-side message count before the job — a reload that raises it means
    // the agent's result landed even if the job row itself has aged out.
    const baseline = serverMessageCount;

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await delay(pollIntervalMs);
      if (aborted) {
        finishWorking(working, { error: "Stopped." });
        return;
      }
      let job: ChatJobStatus;
      try {
        job = await apiAdapter.getJob(working.jobId as string);
      } catch (err) {
        // The job may have aged out of the worker's registry AFTER succeeding.
        // Check the thread before calling this a failure.
        if (await resultAlreadyLanded(baseline)) {
          clearPendingJob();
          emitLatestPacket();
          return;
        }
        finishWorking(working, { error: errorMessage(err) || "status check failed" });
        fail(err);
        return;
      }

      working.job = job;
      if (job.steps?.length) working.steps = job.steps;
      if (IN_PROGRESS_STATUSES.has(job.status)) continue;

      clearPendingJob();
      if (!SUCCESS_STATUSES.has(job.status)) {
        // Any non-success terminal — a failure, timeout, canceled, or a status
        // we don't recognize — is reported visibly with the raw status, never
        // silently retried into a fake timeout.
        finishWorking(working, {
          error: `The assistant could not complete this request (status: ${job.status}).`,
          retryable: true,
        });
        return;
      }
      // Success — the escalated agent wrote its result into the thread; rebuild
      // from the server so the packet renders and can be emitted.
      try {
        await reloadThread();
      } catch (err) {
        finishWorking(working, { error: errorMessage(err) || "could not load result" });
        fail(err);
        return;
      }
      emitLatestPacket();
      return;
    }
    // No silent timeout — exhaustion is a visible, retryable error.
    clearPendingJob();
    finishWorking(working, { error: "Timed out waiting for the assistant.", retryable: true });
  }

  function emitLatestPacket() {
    const packet = latestPacket();
    if (packet) onPacket(packet);
  }

  // Clear the working flag on the placeholder and, on failure, record a visible
  // error. (On the success path a thread reload replaces the message list
  // entirely, so this is only observed on the error branches.)
  function finishWorking(
    working: ChatMessage,
    { error: errText, retryable }: { error?: string; retryable?: boolean } = {}
  ) {
    // A recovery reload replaces the whole list, which can detach this
    // placeholder. Re-attach it rather than mutating an orphan, or the failure
    // would be recorded on an object nothing renders.
    const attached = messages.value.find((m) => m.id === working.id);
    const target = attached ?? pushMessage({ ...working });
    target.working = false;
    if (errText) target.error = errText;
    if (retryable) target.retryable = true;
  }

  return {
    messages,
    queue,
    sending,
    status,
    error,
    threadId,
    busy,
    isEmpty,
    init,
    send,
    stop,
    retry,
    dequeue,
    setFeedback,
    clear,
  };
}
