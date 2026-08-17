/**
 * DanxAgentChat Type Definitions
 *
 * The app-supplied ChatAdapter contract, message/packet shapes, and
 * component props/emits/slots for the agent-chat sidebar.
 */

/** Declared packet schema metadata, keyed by packet type (e.g. { sql_query: { label: "SQL" } }). */
export interface ChatPacketSchema {
  /** Friendlier heading shown above the packet payload. Falls back to the raw type when omitted. */
  label?: string;
}

/** A typed structured result attached to an assistant message. */
export interface ChatPacket {
  /** Discriminates which `#packet-{type}` slot (or schema entry) applies. */
  type: string;
  /** The structured payload — rendered via the consumer's slot or a JSON CodeViewer fallback. */
  payload: unknown;
  /** Whether the payload passed the app's own validation. Treated as valid when omitted. */
  valid?: boolean;
  /** Validation failure message, shown when valid is false. */
  error?: string;
}

/** One message in the thread — a completed turn, an in-flight escalation placeholder, or an optimistic send. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string | null;
  packet?: ChatPacket | null;
  /** True while an escalated (dispatched) request is still being polled. */
  working?: boolean;
  /** The polled job id — present only on a working/escalated message. */
  jobId?: string;
  /** True while an optimistic user message hasn't been confirmed by the server yet. */
  pending?: boolean;
  /** Visible per-message failure (send failed, job failed, poll timed out). */
  error?: string;
  /** ISO timestamp — set locally for optimistic messages, or loaded from the server. */
  timestamp?: string;
  /** Arbitrary server metadata. `metadata.type === "system"` messages are filtered from the rendered thread. */
  metadata?: { type?: string; [key: string]: unknown };
}

/** Result of ChatAdapter.resolveThread — thread_id is null when no thread could be established. */
export interface ResolveThreadResult {
  thread_id: string | null;
}

/** Result of ChatAdapter.getThread. */
export interface GetThreadResult {
  messages: ChatMessage[];
}

/** Result of ChatAdapter.sendMessage — either a fast synchronous reply or a dispatched escalation. */
export interface SendMessageResult {
  /** True when the request was escalated to a background job (see ChatAdapter.getJob). */
  dispatched?: boolean;
  /** Present when dispatched is true — the job id to poll. */
  job_id?: string;
  /** The assistant's synchronous reply text, present when dispatched is false/absent. */
  reply?: string | null;
  /** A typed structured result attached to the reply. */
  packet?: ChatPacket;
}

/** Result of ChatAdapter.getJob. `status` is matched by exact string — see useAgentChat's status vocabulary. */
export interface JobStatus {
  status: string;
}

/**
 * App-provided backend contract for DanxAgentChat.
 *
 * DanxAgentChat ships NO default implementation — every app's backend proxy
 * is shaped differently (auth, routing, host). Implement these four methods
 * against your own API and pass the object as the `apiAdapter` prop.
 */
export interface ChatAdapter {
  /** Resolve (or create) the thread backing this (contextType, contextId) pair. */
  resolveThread(ctx: { contextType: string; contextId: string }): Promise<ResolveThreadResult>;
  /** Load the full message history for a resolved thread. */
  getThread(threadId: string): Promise<GetThreadResult>;
  /** Send a user message on a resolved thread. */
  sendMessage(threadId: string, text: string): Promise<SendMessageResult>;
  /** Poll the status of an escalated (dispatched) job. */
  getJob(jobId: string): Promise<JobStatus>;
}

export interface DanxAgentChatProps {
  /** Logical context the chat thread belongs to (e.g. "phone-query"). Paired with contextId to resolve a thread. */
  contextType: string;
  /** The specific context instance id (e.g. a saved query id) — the thread key. */
  contextId: string;
  /**
   * Declared packet schemas the consumer understands, keyed by packet type
   * (e.g. { sql_query: { label: "SQL" } }). Used only for a friendlier packet
   * heading — unknown types still render via the CodeViewer fallback.
   */
  packetSchemas?: Record<string, ChatPacketSchema>;
  /**
   * App-supplied backend adapter. REQUIRED — DanxAgentChat ships no default
   * implementation since every app's backend proxy is shaped differently.
   */
  apiAdapter: ChatAdapter;
  /** Composer placeholder text. @default "Ask a question…" */
  placeholder?: string;
  /** Character threshold past which a message body collapses behind a "Show more" toggle. @default 600 */
  maxVisibleChars?: number;
  /**
   * A message to send automatically the moment the thread resolves — lets a
   * consumer that just created the backing thread hand off the user's
   * already-typed first message instead of re-rendering an empty composer.
   */
  initialMessage?: string | null;
}

export interface DanxAgentChatEmits {
  /** Emitted whenever a message (fast reply or escalation result) carries a packet. */
  packet: [packet: ChatPacket];
  /** Emitted once the thread has resolved and history has loaded. */
  threadReady: [threadId: string];
  /** Emitted on any adapter failure — thread resolution, history load, or a mid-session send. */
  error: [error: unknown];
}

export interface DanxAgentChatSlots {
  /** Consumer-provided packet renderer, keyed by slot name `packet-{type}`, falling back to a JSON CodeViewer. */
  [key: string]: (props: { packet: ChatPacket }) => unknown;
}
