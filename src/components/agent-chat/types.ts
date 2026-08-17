/**
 * DanxAgentChat Type Definitions
 *
 * The app-supplied ChatAdapter contract, message/packet/step shapes, and
 * component props/emits/slots for the agent-chat sidebar.
 */

import type { Component } from "vue";
import type { IconName } from "../icon/icons";
import type { PreviewFile } from "../danx-file";
import type { FileUploadHandler } from "../danx-file-upload";
import type { UsageMeterSegment } from "../usage-meter";

/** Declared packet schema metadata, keyed by packet type. */
export interface ChatPacketSchema {
  /** Friendlier heading shown above the packet payload. Falls back to the raw type. */
  label?: string;
  /** Icon shown beside the packet heading. */
  icon?: Component | IconName | string;
  /** Label for the packet's primary action button (e.g. "Apply to editor"). */
  applyLabel?: string;
}

/**
 * A typed structured result attached to an assistant message.
 *
 * `valid` is deliberately TRI-STATE:
 * - `true`  — the backend validated the payload and it passed
 * - `false` — validation ran and failed; `error` explains why, and the payload
 *             must NOT be applied
 * - `undefined` — no validation was performed (e.g. a packet type the backend
 *             does not validate, or one restored from history). Render it, but
 *             let the consumer decide whether to trust it.
 */
export interface ChatPacket {
  /** Discriminates which `#packet-{type}` slot (or schema entry) applies. */
  type: string;
  /** The structured payload — rendered via the consumer's slot or a JSON fallback. */
  payload: unknown;
  /** Tri-state validity — see the interface docs. */
  valid?: boolean;
  /** Validation failure message, present when `valid` is false. */
  error?: string;
  /**
   * True when the backend ran a repair pass to produce this packet (it asked
   * the model to correct an initially-invalid payload). Surfaced as a badge so
   * a silently-corrected result is never mistaken for a first-try one.
   */
  repaired?: boolean;
}

/**
 * One step an agent took while producing a message — a tool call, a search, a
 * reasoning block. Rendered as flat collapsible rows, never as nested cards.
 */
export interface ChatStep {
  id: string;
  /** Short verb + target, e.g. "Queried calls table". */
  label: string;
  /** What kind of step this was — drives the icon. */
  kind?: "tool" | "search" | "read" | "write" | "reasoning";
  /** Expanded detail (raw input/output, reasoning text). */
  detail?: string;
  /** Wall-clock duration in ms, shown as a muted suffix. */
  durationMs?: number;
  /** Step outcome. `running` renders a spinner. */
  status?: "running" | "ok" | "error";
}

/** A source the assistant cited, rendered below the message. */
export interface ChatCitation {
  id: string;
  title: string;
  url?: string;
  /** Short source label (domain, table name, file path). */
  source?: string;
}

/**
 * A file attached to a message.
 *
 * This is the library's own `PreviewFile` — the same shape `DanxFile`,
 * `DanxFileUpload` and `DanxFileViewer` speak — rather than a chat-specific
 * one. A file therefore looks and behaves the same in a chat thread as it
 * does anywhere else in an app: thumbnails for images, a play badge for
 * video, a live progress bar while it uploads, and an error state if it
 * fails. Anything an app already produces for an upload field can be
 * attached to a message unchanged.
 */
export type ChatAttachment = PreviewFile;

/**
 * Context-window usage, rendered as a segmented meter in the session bar.
 *
 * `segments` are the library's own `UsageMeterSegment` — this is a
 * `DanxUsageMeter` fed by the app, not a chat-specific bar. Supply it only
 * when your backend actually reports usage; omit it and the meter never
 * renders.
 */
export interface ChatContextUsage {
  /** Capacity denominator, e.g. the model's context window in tokens. */
  total: number;
  /** Consumption broken down by category (system, tools, history, …). */
  segments: UsageMeterSegment[];
  /** Heading above the meter. @default "Context window" */
  label?: string;
}

/** One quota row — a plan limit, a rate limit, a billing period. */
export interface ChatUsageLimit {
  id: string;
  /** Row heading, e.g. "5-hour limit" or "Weekly · all models". */
  label: string;
  /** Consumed share of the limit, 0-100. */
  percent: number;
  /** ISO timestamp the limit resets at, rendered as a relative time. */
  resetsAt?: string;
}

/** Live session counters shown as a compact separated line. */
export interface ChatSessionStats {
  /** Wall-clock duration of the session so far. */
  elapsedMs?: number;
  /** Tokens consumed so far. */
  tokens?: number;
  /** Background tasks still running. */
  runningTasks?: number;
}

/** One selectable model in the composer's picker. */
export interface ChatModel {
  id: string;
  label: string;
  /** Key hint shown on the row. A hint only — bind the real key yourself. */
  shortcut?: string;
  /** Groups models under a submenu, e.g. "More models". */
  group?: string;
  disabled?: boolean;
}

/** Consumer feedback recorded on an assistant message. */
export type ChatFeedback = "up" | "down";

/** One message in the thread. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string | null;
  packet?: ChatPacket | null;
  /** True while an escalated (dispatched) request is still being polled. */
  working?: boolean;
  /** True while text is arriving incrementally — renders a live caret. */
  streaming?: boolean;
  /** The polled job id — present only on a working/escalated message. */
  jobId?: string;
  /** Live job telemetry, surfaced beside the working indicator. */
  job?: ChatJobStatus;
  /** True while an optimistic user message hasn't been confirmed yet. */
  pending?: boolean;
  /** Visible per-message failure (send failed, job failed, poll timed out). */
  error?: string;
  /** True when the failure is retryable — renders a Retry action. */
  retryable?: boolean;
  /** ISO timestamp. */
  timestamp?: string;
  /** Display name of the author, for multi-user threads. */
  author?: string;
  /** Agent steps (tool calls / reasoning) taken to produce this message. */
  steps?: ChatStep[];
  /** Sources cited by this message. */
  citations?: ChatCitation[];
  /** Files attached to this message. */
  attachments?: ChatAttachment[];
  /** Consumer feedback already recorded on this message. */
  feedback?: ChatFeedback;
  /**
   * Arbitrary server metadata. Messages with `metadata.type === "system"` are
   * bookkeeping entries and are filtered out of the rendered thread.
   */
  metadata?: { type?: string; [key: string]: unknown };
}

/** Result of ChatAdapter.resolveThread — `thread_id` is null when none could be established. */
export interface ResolveThreadResult {
  thread_id: string | null;
}

/** Result of ChatAdapter.getThread. */
export interface GetThreadResult {
  messages: ChatMessage[];
}

/** Result of ChatAdapter.sendMessage — a fast reply or a dispatched escalation. */
export interface SendMessageResult {
  /** True when the request was escalated to a background job. */
  dispatched?: boolean;
  /** Present when dispatched — the job id to poll. */
  job_id?: string;
  /** The assistant's synchronous reply text. */
  reply?: string | null;
  /** A typed structured result attached to the reply. */
  packet?: ChatPacket;
  /** Steps the agent took, when the backend reports them. */
  steps?: ChatStep[];
  /** Sources cited by the reply. */
  citations?: ChatCitation[];
}

/**
 * Result of ChatAdapter.getJob.
 *
 * `status` is matched against the danxbot job vocabulary — see
 * IN_PROGRESS_STATUSES / SUCCESS_STATUSES in useAgentChat.ts. Every other
 * field is optional telemetry surfaced in the working indicator.
 */
export interface ChatJobStatus {
  status: string;
  /** Human summary written by the agent on completion. */
  summary?: string;
  /** Elapsed wall-clock seconds, shown live beside "Working on it…". */
  elapsed_seconds?: number;
  started_at?: string;
  completed_at?: string;
  /** Steps the agent has taken so far — streamed into the working message. */
  steps?: ChatStep[];
}

/** Handlers a streaming adapter calls as tokens arrive. */
export interface ChatStreamHandlers {
  /** Called with each text chunk. Chunks are appended, not replaced. */
  onToken: (chunk: string) => void;
  /** Called when the agent reports a step (tool call, search). */
  onStep?: (step: ChatStep) => void;
}

/**
 * App-provided backend contract for DanxAgentChat.
 *
 * DanxAgentChat ships NO default implementation — every app's backend proxy is
 * shaped differently (auth, routing, host). Implement these methods against
 * your own API and pass the object as the `apiAdapter` prop.
 *
 * ERROR CONTRACT: reject with an `Error` whose `.message` is the backend's
 * stable error code (e.g. `"chat_unavailable"`). The component matches codes by
 * exact equality and never sniffs substrings, so a renamed code fails a test
 * rather than silently degrading a state.
 */
export interface ChatAdapter {
  /** Resolve (or create) the thread backing this (contextType, contextId) pair. */
  resolveThread(ctx: { contextType: string; contextId: string }): Promise<ResolveThreadResult>;
  /** Load the full message history for a resolved thread. */
  getThread(threadId: string): Promise<GetThreadResult>;
  /**
   * Send a user message on a resolved thread.
   *
   * `attachments` are files the user staged with the message, already uploaded
   * by the app's own `FileUploadHandler` — so each carries a real `url` and
   * the adapter only has to reference them. It is omitted entirely when the
   * turn carries no files.
   */
  sendMessage(
    threadId: string,
    text: string,
    signal?: AbortSignal,
    attachments?: ChatAttachment[]
  ): Promise<SendMessageResult>;
  /** Poll the status of an escalated (dispatched) job. */
  getJob(jobId: string): Promise<ChatJobStatus>;
  /**
   * OPTIONAL — stream a reply token-by-token instead of returning it whole.
   * When present, DanxAgentChat prefers this over `sendMessage`. Resolve with
   * the same result shape once the stream completes.
   */
  streamMessage?(
    threadId: string,
    text: string,
    handlers: ChatStreamHandlers,
    signal: AbortSignal
  ): Promise<SendMessageResult>;
  /**
   * OPTIONAL — cancel an escalated job UPSTREAM. Stop is offered regardless
   * (every turn holds an AbortController); this only stops the backend from
   * continuing to work on an answer nobody is waiting for.
   */
  cancelJob?(jobId: string): Promise<void>;
}

/** A one-tap prompt offered in the empty state. */
export interface ChatSuggestion {
  /** Text sent when the chip is clicked. Falls back to `label`. */
  text?: string;
  label: string;
  icon?: Component | IconName | string;
}

export interface DanxAgentChatProps {
  /** Logical context the thread belongs to (e.g. "query_card"). */
  contextType: string;
  /** The specific context instance id — the thread key. */
  contextId: string;
  /**
   * App-supplied backend adapter. REQUIRED — DanxAgentChat ships no default
   * implementation since every app's backend proxy is shaped differently.
   */
  apiAdapter: ChatAdapter;
  /** Declared packet schemas, keyed by packet type. */
  packetSchemas?: Record<string, ChatPacketSchema>;
  /** Panel heading. @default "Assistant" */
  title?: string;
  /** Name shown on assistant messages. @default "Assistant" */
  assistantName?: string;
  /** Avatar image URL for assistant messages. */
  assistantAvatar?: string;
  /** Name shown on your own messages. @default "You" */
  userName?: string;
  /** Avatar image URL for your own messages. */
  userAvatar?: string;
  /** Show avatars beside messages. @default true */
  showAvatars?: boolean;
  /** Show the panel header. @default true */
  showHeader?: boolean;
  /** Composer placeholder text. @default "Ask a question…" */
  placeholder?: string;
  /** Character threshold past which a message collapses behind "Show more". @default 600 */
  maxVisibleChars?: number;
  /** Render message text as markdown. @default true */
  markdown?: boolean;
  /** Headline shown in the empty state. @default "How can I help?" */
  emptyTitle?: string;
  /** Supporting line shown in the empty state. */
  emptyDescription?: string;
  /** One-tap prompts offered in the empty state. */
  suggestions?: (ChatSuggestion | string)[];
  /** A message sent automatically once the thread resolves. */
  initialMessage?: string | null;
  /** Maximum characters accepted by the composer. */
  maxLength?: number;
  /** Enable copy/retry/feedback actions on messages. @default true */
  messageActions?: boolean;
  /**
   * Upload handler for files attached to a message. Falls back to the app-wide
   * handler registered with `setFileUploadHandler`. With NEITHER, attachments
   * are switched off entirely — no attach button, and a pasted image falls
   * through to the editor. Offering to accept a file with nowhere to put it
   * would strand it on a message that can never carry it.
   */
  fileUploadHandler?: FileUploadHandler;
  /** MIME filter for attachments, `accept`-attribute semantics (e.g. "image/*,.pdf"). */
  acceptFiles?: string;
  /** Largest attachment accepted, in bytes. */
  maxFileSize?: number;
  /**
   * Characters above which a pasted blob stops being message text and becomes
   * a `.txt` attachment instead. @default 4000
   */
  largePasteThreshold?: number;
  /**
   * Context-window usage. Renders a segmented meter in the session bar.
   * Omitted entirely when not supplied — the panel invents no numbers.
   */
  contextUsage?: ChatContextUsage;
  /** Live session counters ("1m 34s · 1.6k tokens · 1 running task"). */
  sessionStats?: ChatSessionStats;
  /** Plan/rate limit rows shown under the context meter. */
  usageLimits?: ChatUsageLimit[];
  /** Models offered in the composer's picker. No list, no picker. */
  models?: ChatModel[];
}

export interface DanxAgentChatEmits {
  /** Emitted whenever a message carries a packet. */
  packet: [packet: ChatPacket];
  /** Emitted when the consumer asks to apply a packet (the Apply action). */
  applyPacket: [packet: ChatPacket];
  /**
   * Emitted when an attachment on a message is clicked. The component does not
   * open anything itself — where a file should open (a viewer, a new tab, an
   * app route) is the app's decision, not the chat panel's.
   */
  openAttachment: [file: ChatAttachment];
  /** Emitted once the thread has resolved and history has loaded. */
  threadReady: [threadId: string];
  /** Emitted on any adapter failure. */
  error: [error: unknown];
  /** Emitted when the user rates an assistant message. */
  feedback: [payload: { message: ChatMessage; feedback: ChatFeedback }];
  /** Emitted when a message is sent (after it is queued). */
  send: [text: string];
  /** Emitted when the user clears the conversation. */
  clear: [];
  /** Emitted when the user picks a different model (also updates `v-model:model`). */
  "update:model": [modelId: string];
}

/**
 * Payload passed to agent-chat slots.
 *
 * `packet` is optional because the same slot map also carries the propless
 * `empty` / `header-actions` slots — a `packet-{type}` slot always receives it.
 */
export interface ChatPacketSlotProps {
  packet?: ChatPacket;
}

export interface DanxAgentChatSlots {
  /**
   * Consumer-provided packet renderer, keyed by slot name `packet-{type}`.
   * The index signature also admits the fixed `empty` / `header-actions`
   * slots, which simply ignore the payload.
   */
  [key: string]: (props: ChatPacketSlotProps) => unknown;
}
