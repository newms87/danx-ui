import { ref, type Ref } from "vue";
import type { ChatAdapter, ChatMessage, ChatPacket } from "./types";

// The danxbot job-status vocabulary. We enumerate the IN-PROGRESS states (the
// ones worth polling past) and the SUCCESS states; ANYTHING else that comes
// back — a known failure, `critical_failure`, or a status we don't recognize —
// is treated as a terminal failure and surfaced visibly, rather than being
// silently mistaken for "still running" and polled until a bogus timeout.
const IN_PROGRESS_STATUSES = new Set([
  "launched",
  "running",
  "queued",
  "pending",
  "in_progress",
  "dispatched",
]);
const SUCCESS_STATUSES = new Set(["complete", "completed"]);

// The backend's stable error code for an unreachable/revoked-token chat.
// Matched by exact equality (not a substring sniff) so renaming it fails a
// test rather than silently degrading the "chat unavailable" state.
const CHAT_UNAVAILABLE_CODE = "chat_unavailable";

function pendingJobKey(threadId: string | null): string {
  return `agent-chat:pendingJob:${threadId}`;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export type ChatStatus = "idle" | "resolving" | "ready" | "unavailable" | "error";

export interface UseAgentChatOptions {
  /** App-supplied backend adapter — no default, every app's backend proxy differs. */
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
  /** Injectable delay function, overridden in tests for deterministic polling. */
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
  /** Resolve the thread, load history, and resume any in-flight escalation. */
  init: () => Promise<void>;
  /** Enqueue a message. Strictly serial — see the composable's drain(). */
  send: (text: string) => void;
}

/**
 * useAgentChat Composable
 *
 * A chat session bound to one (contextType, contextId). Owns thread
 * resolution, history load, strictly-serial send with a visible queue, and
 * stateless escalation polling that survives a component remount (the
 * in-flight job id is stashed in sessionStorage and resumed on init).
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
  // message — not just server-loaded ones — shows a relative time in the bubble.
  const stamp = () => new Date().toISOString();

  function fail(err: unknown, { unavailable = false }: { unavailable?: boolean } = {}) {
    error.value = errorMessage(err);
    // The caller decides whether this is the terminal "chat unavailable" state
    // (revoked/expired token, or a failure to even establish the thread) — no
    // string-sniffing of the error message here.
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

  async function reloadThread() {
    const data = await apiAdapter.getThread(threadId.value as string);
    // COPY the adapter's array — never alias it. The composable pushes
    // optimistic/placeholder messages onto messages.value, and an adapter that
    // returns a live internal array (a cache, a store) would otherwise be
    // silently mutated by this component, duplicating every message.
    messages.value = [...(data.messages ?? [])];
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

  // Public: enqueue a message. Strictly serial — see drain().
  function send(text: string) {
    if (typeof text !== "string" || !text.trim()) return;
    if (status.value === "unavailable") return;
    queue.value.push(text.trim());
    drain();
  }

  async function drain() {
    if (sending.value) return; // one send fully resolves before the next starts
    const next = queue.value.shift();
    if (next === undefined) return;
    sending.value = true;
    try {
      await runSend(next);
    } finally {
      sending.value = false;
    }
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
    messages.value.push(optimistic);

    let resp;
    try {
      resp = await apiAdapter.sendMessage(threadId.value as string, text);
    } catch (err) {
      optimistic.pending = false;
      optimistic.error = errorMessage(err);
      // A mid-session revoked/expired token surfaces here — flip to the
      // "chat unavailable" state (which disables the composer) rather than
      // leaving the user typing into a dead channel.
      fail(err, { unavailable: isUnavailable(err) });
      return;
    }
    optimistic.pending = false;

    if (resp.dispatched) {
      const working: ChatMessage = {
        id: localId(),
        role: "assistant",
        working: true,
        jobId: resp.job_id,
        timestamp: stamp(),
      };
      messages.value.push(working);
      writePendingJob(resp.job_id as string);
      await pollJob(working);
      return;
    }

    const assistant: ChatMessage = {
      id: localId(),
      role: "assistant",
      text: resp.reply ?? null,
      timestamp: stamp(),
    };
    if (resp.packet) assistant.packet = resp.packet;
    messages.value.push(assistant);
    if (resp.packet) onPacket(resp.packet);
  }

  function resumePolling(jobId: string) {
    const working: ChatMessage = {
      id: localId(),
      role: "assistant",
      working: true,
      jobId,
      timestamp: stamp(),
    };
    messages.value.push(working);
    // fire-and-forget: resuming shouldn't block init()'s caller
    pollJob(working);
  }

  async function pollJob(working: ChatMessage) {
    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await delay(pollIntervalMs);
      let job;
      try {
        job = await apiAdapter.getJob(working.jobId as string);
      } catch (err) {
        finishWorking(working, { error: errorMessage(err) || "status check failed" });
        fail(err);
        return;
      }
      if (IN_PROGRESS_STATUSES.has(job.status)) continue;

      clearPendingJob();
      if (!SUCCESS_STATUSES.has(job.status)) {
        // Any non-success terminal — a failure, critical_failure, or a status
        // we don't recognize — is reported visibly with the raw status, never
        // silently retried into a fake timeout.
        finishWorking(working, {
          error: `The assistant could not complete this request (status: ${job.status}).`,
        });
        return;
      }
      // success — the escalated agent wrote its packet as a comment; rebuild
      // the thread from the server so the packet renders and can be emitted.
      try {
        await reloadThread();
      } catch (err) {
        finishWorking(working, { error: errorMessage(err) || "could not load result" });
        fail(err);
        return;
      }
      const pkt = latestPacket();
      if (pkt) onPacket(pkt);
      return;
    }
    // No silent timeout — exhaustion is a visible error on the message.
    clearPendingJob();
    finishWorking(working, { error: "Timed out waiting for the assistant." });
  }

  // Clear the working flag on the placeholder message and, on failure, record a
  // visible error on it. (On the success path a thread reload replaces the
  // message list entirely, so this is only observed on the error branches.)
  function finishWorking(working: ChatMessage, { error: errText }: { error?: string } = {}) {
    working.working = false;
    if (errText) working.error = errText;
  }

  return {
    messages,
    queue,
    sending,
    status,
    error,
    threadId,
    init,
    send,
  };
}
