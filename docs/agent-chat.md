# Agent Chat

A domain-agnostic AI chat sidebar. Any feature plugs in by passing a `(contextType, contextId)` pair — resolved to a thread by an app-supplied adapter — and reacting to the results the agent sends back.

## No default backend

`DanxAgentChat` ships **no default implementation**. Every app's backend proxy differs in auth, routing and host, so `apiAdapter` is a **required** prop implementing the `ChatAdapter` interface. There is no bundled HTTP client to fall back on — the adapter is the entire integration surface, which is what keeps the component backend-agnostic.

Keep credentials server-side. The browser should only ever talk to your own proxy routes; the adapter never accepts a token, header, or upstream base URL as a prop.

```ts
import type { ChatAdapter } from "danx-ui";

export const myChatAdapter: ChatAdapter = {
  resolveThread: ({ contextType, contextId }) =>
    post("/api/agent-chat/threads", { contextType, contextId }),

  getThread: (threadId) => get(`/api/agent-chat/threads/${threadId}`),

  sendMessage: (threadId, text) =>
    post(`/api/agent-chat/threads/${threadId}/messages`, { text }),

  getJob: (jobId) => get(`/api/agent-chat/jobs/${jobId}`),
};
```

### Error contract

Reject with an `Error` whose `.message` is your backend's stable error code. The component matches codes by **exact equality** and never sniffs substrings, so renaming a code fails a test instead of silently degrading a state.

The one code the component acts on is `chat_unavailable`: it flips the panel into a terminal disconnected state and disables the composer, rather than leaving someone typing into a dead channel. Every other error surfaces in place on the message that caused it.

> Watch for asymmetric error handling in your own HTTP helpers. If your `GET` helper throws `"/api/... -> 502"` while your `POST` helper throws the parsed `error` field, a failed poll will surface a raw URL to the user. Normalize both to the code.

## Basic usage

```vue
<template>
  <DanxAgentChat
    context-type="query_card"
    context-id="42"
    :api-adapter="myChatAdapter"
    :suggestions="['Show me the top routes this week']"
  />
</template>

<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { myChatAdapter } from "./myChatAdapter";
</script>
```

The panel fills its container, so give it a bounded height.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contextType` | `string` | — | Logical context the thread belongs to (required) |
| `contextId` | `string` | — | Context instance id — the thread key (required) |
| `apiAdapter` | `ChatAdapter` | — | App-supplied backend adapter (required, no default) |
| `packetSchemas` | `Record<string, ChatPacketSchema>` | `{}` | Heading, icon and apply label per packet type |
| `title` | `string` | `"Assistant"` | Panel heading |
| `assistantName` | `string` | `"Assistant"` | Name shown on assistant turns |
| `assistantAvatar` | `string` | — | Avatar image for the assistant |
| `userName` | `string` | `"You"` | Name shown on your turns |
| `userAvatar` | `string` | — | Avatar image for you |
| `showAvatars` | `boolean` | `true` | Render avatars |
| `showHeader` | `boolean` | `true` | Render the panel header |
| `placeholder` | `string` | `"Ask a question…"` | Composer placeholder |
| `maxVisibleChars` | `number` | `600` | Threshold before a message clamps behind "Show more" |
| `markdown` | `boolean` | `true` | Render assistant text as markdown |
| `emptyTitle` | `string` | `"How can I help?"` | Empty-state headline |
| `emptyDescription` | `string` | — | Empty-state supporting line |
| `suggestions` | `(ChatSuggestion \| string)[]` | `[]` | One-tap prompts in the empty state |
| `initialMessage` | `string \| null` | `null` | Sent automatically once the thread resolves |
| `maxLength` | `number` | — | Composer character cap |
| `messageActions` | `boolean` | `true` | Enable copy / retry / feedback |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `packet` | `ChatPacket` | A message carried a structured result |
| `applyPacket` | `ChatPacket` | The user pressed Apply on a packet |
| `openAttachment` | `ChatAttachment` | The user clicked a file attached to a message |
| `threadReady` | `string` | Thread resolved and history loaded |
| `error` | `unknown` | Any adapter failure |
| `feedback` | `{ message, feedback }` | The user rated an assistant message |
| `send` | `string` | A message was queued for sending |
| `clear` | — | The user cleared the conversation |

`packet` fires when a result arrives; `applyPacket` fires when the user explicitly asks to use it. Prefer `applyPacket` for anything that mutates app state — it survives a page reload, whereas `packet` only fires for results that arrive live.

## Slots

| Slot | Description |
|------|-------------|
| `packet-{type}` | Renderer for a packet type, forwarded down to every message |
| `header-actions` | Extra controls in the panel header |
| `empty` | Replace the entire empty state |

```vue
<DanxAgentChat :api-adapter="adapter" context-type="query_card" context-id="42">
  <template #packet-sql_query="{ packet }">
    <SqlPreview :sql="packet.payload.sql" />
  </template>
</DanxAgentChat>
```

An unregistered packet type falls back to a JSON viewer rather than disappearing.

## The ChatAdapter contract

```ts
interface ChatAdapter {
  resolveThread(ctx): Promise<{ thread_id: string | null }>;
  getThread(threadId): Promise<{ messages: ChatMessage[] }>;
  sendMessage(threadId, text, signal?): Promise<SendMessageResult>;
  getJob(jobId): Promise<ChatJobStatus>;

  // optional
  streamMessage?(threadId, text, handlers, signal): Promise<SendMessageResult>;
  cancelJob?(jobId): Promise<void>;
}
```

- **`resolveThread`** — resolve or create the thread for this context pair. Returning `thread_id: null` (or rejecting) puts the panel in the disconnected state.
- **`getThread`** — full message history. **Return a copy if you keep the array internally**; treat it as handed off. (The component copies defensively too.)
- **`sendMessage`** — either a fast reply `{ dispatched: false, reply, packet? }`, or an escalation `{ dispatched: true, job_id }`.
- **`getJob`** — poll an escalated job. See the status vocabulary below.
- **`streamMessage`** *(optional)* — when present it is preferred over `sendMessage`; call `handlers.onToken` per chunk and resolve with the final result.
- **`cancelJob`** *(optional)* — cancels the escalated job **upstream**. Stop does not depend on it: every turn holds an `AbortController`, so every turn is stoppable locally. Implementing `cancelJob` is what stops the backend from continuing to burn work on an answer nobody is waiting for.

### Job status vocabulary

| Bucket | Statuses | Behavior |
|--------|----------|----------|
| In progress | `queued`, `running` | Keep polling |
| Success | `completed`, `recovered` | Reload the thread, emit the packet |
| Everything else | `failed`, `timeout`, `canceled`, `throttled`, `escalated`, `superseded`, **and any unrecognized value** | Terminal failure, reported verbatim with a Retry |

`recovered` is a **success**: it means a synthetic recovery still landed the dispatch. Treating it as a failure reports completed work as broken.

Unrecognized statuses fail loudly on purpose. Polling an unknown status until a timeout would turn a backend change into a three-minute hang.

### Jobs that outlive their own status endpoint

A job can succeed, write its result, and *then* age out of the worker's registry — so the next poll 404s even though the work is done. Before declaring failure the component reloads the thread and checks whether the result already landed, so a completed job is never reported as broken.

## Messages

```ts
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string | null;
  packet?: ChatPacket | null;
  working?: boolean;      // escalation in flight
  streaming?: boolean;    // tokens arriving — renders a caret
  error?: string;         // visible per-message failure
  retryable?: boolean;    // renders a Retry action
  author?: string;        // multi-participant threads
  steps?: ChatStep[];     // tool calls / reasoning
  citations?: ChatCitation[];
  attachments?: ChatAttachment[];
  timestamp?: string;
  metadata?: { type?: string };
}
```

Messages with `role: "system"` or `metadata.type === "system"` are bookkeeping and never render. The component filters them itself — do not assume a pre-filtered feed.

## Attachments

**A chat attachment is the library's own `PreviewFile`** — the same shape `DanxFile`, `DanxFileUpload` and `DanxFileViewer` speak. `ChatAttachment` is an alias for it, not a chat-specific type.

```ts
type ChatAttachment = PreviewFile;

interface PreviewFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
  blobUrl?: string;      // local preview while uploading
  progress?: number | null; // non-null and < 100 = still uploading
  thumb?: { url: string };
  error?: string;        // failed upload, takes priority over progress
  // …see docs/danx-file.md for the rest
}
```

Attachments render through `DanxFile`, so a file behaves in a chat thread exactly as it does anywhere else in an app: images get a real thumbnail, video gets a play badge, an upload in flight shows a live progress bar, and a failure shows an error state instead of a silently broken chip. Anything your app already produces for an upload field can be attached to a message unchanged — there is no conversion step and no second file format to maintain.

```ts
const message: ChatMessage = {
  id: "m1",
  role: "user",
  text: "Here's the export — what stands out?",
  attachments: [
    { id: "f1", name: "calls.csv", size: 20481, mime: "text/csv", url: "/files/calls.csv" },
  ],
};
```

### Attaching files to a message

Paste an image or a file into the composer and it is staged for the next message, uploading in place. Paste a text blob larger than `largePasteThreshold` and it becomes a `.txt` attachment instead of a wall of message text — the same move the Claude Code box makes, and for the same reason: past a certain length a paste stops being something you said and starts being something you handed over.

```vue
<DanxAgentChat
  :api-adapter="adapter"
  :file-upload-handler="myUploadHandler"
  accept-files="image/*,.pdf,.csv"
  :max-file-size="25 * 1024 * 1024"
  :large-paste-threshold="4000"
  context-type="query_card"
  context-id="42"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fileUploadHandler` | `FileUploadHandler` | app-wide handler | Uploads a staged file |
| `acceptFiles` | `string` | — | MIME filter, `accept`-attribute semantics |
| `maxFileSize` | `number` | — | Largest attachment accepted, in bytes |
| `largePasteThreshold` | `number` | `4000` | Characters above which a paste becomes a file |

**No handler means no attachments.** `fileUploadHandler` falls back to the app-wide handler registered with `setFileUploadHandler`; with neither, attachments are switched off entirely and a pasted image falls through to the editor. Accepting a file with nowhere to put it would strand it on a message that can never carry it.

Uploads run through the same `useFileUpload` orchestration `DanxFileUpload` uses, so progress, per-file errors and retry behave identically to an upload field. Staged files show above the composer and can be removed before sending.

When a turn carries files, the adapter's `sendMessage` receives them as a fourth argument, already uploaded and carrying real URLs:

```ts
sendMessage(threadId, text, signal, attachments) {
  return post(`/api/agent-chat/threads/${threadId}/messages`, {
    text,
    file_ids: attachments?.map((f) => f.id),
  });
}
```

A turn with no files calls `sendMessage` with the same three arguments it always has, so existing adapters need no change. A turn carrying only files and no text still sends — a screenshot with no words on it is a real message.

Clicking an attachment emits `openAttachment` with the file. The panel deliberately does not open anything itself — whether a file opens in `DanxFileViewer`, a new tab, or an app route is your decision, not the chat panel's.

## Packets and the tri-state `valid`

```ts
interface ChatPacket {
  type: string;
  payload: unknown;
  valid?: boolean;   // TRI-state — see below
  error?: string;
  repaired?: boolean;
}
```

| `valid` | Meaning | Rendering |
|---------|---------|-----------|
| `true` | Validation ran and passed | Normal, Apply offered |
| `false` | Validation ran and failed | Blocking alert with `error`; **no Apply** |
| `undefined` | Never validated | Rendered normally, Apply offered |

Treating `undefined` as invalid would hide legitimate results from any packet type your backend doesn't validate. Guard on `packet.valid !== false` in your `applyPacket` handler.

`repaired: true` marks a packet the backend corrected after an initially-invalid attempt. It renders as a badge so a silently-fixed result is never mistaken for a first-try one.

## Session bar: context usage and model picking

Everything in the strip above the composer is **opt-in and prop-fed**. The panel invents no numbers — supply a prop and its part appears; supply none and the bar renders nothing at all.

```vue
<DanxAgentChat
  :api-adapter="adapter"
  :session-stats="{ elapsedMs: 94_000, tokens: 1600, runningTasks: 1 }"
  :context-usage="{
    total: 1_000_000,
    segments: [
      { id: 'system', label: 'System prompt', value: 40_000, variant: 'muted' },
      { id: 'tools', label: 'Tool definitions', value: 15_400, variant: 'warning' },
      { id: 'history', label: 'Conversation', value: 300_000, variant: 'info' },
    ],
  }"
  :usage-limits="[
    { id: '5h', label: '5-hour limit', percent: 9, resetsAt: resetIso },
    { id: 'week', label: 'Weekly · all models', percent: 20, resetsAt: weekIso },
  ]"
  :models="[
    { id: 'fable', label: 'Fable 5', shortcut: '1' },
    { id: 'opus', label: 'Opus 5', shortcut: '2' },
    { id: 'haiku', label: 'Haiku 4.5', group: 'More models' },
  ]"
  v-model:model="modelId"
  context-type="query_card"
  context-id="42"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `sessionStats` | `ChatSessionStats` | `{ elapsedMs, tokens, runningTasks }` — renders "1m 34s · 1.6k tokens · 1 running task" |
| `contextUsage` | `ChatContextUsage` | `{ total, segments, label? }` — a segmented context-window meter |
| `usageLimits` | `ChatUsageLimit[]` | `{ id, label, percent, resetsAt? }` rows under the meter |
| `models` | `ChatModel[]` | `{ id, label, shortcut?, group?, disabled? }` |
| `v-model:model` | `string` | The model in effect |

The summary line shows the counters and the context percentage; clicking it opens the meter and the quota rows. `resetsAt` renders as a relative time.

`contextUsage.segments` are the library's own `UsageMeterSegment` — this is a `DanxUsageMeter`, not a chat-specific bar, so the same segments render identically anywhere else you use one.

**`shortcut` is a hint, not a binding.** It renders the key on the row and binds nothing. Register the real key with `useHotkeys` so the label and the binding cannot drift apart.

Picking a model updates `v-model:model` and emits `update:model`. The component does not tell the adapter which model to use — thread that through your own `apiAdapter` closure, since only your backend knows what a model id means.

## Behavior worth knowing

**Serial sending.** Messages send strictly one at a time. Anything typed mid-flight waits in a visible queue strip and can be removed before it sends.

**Stop halts the pipeline, not just the request.** Pressing Stop aborts the in-flight turn and stops there — it does not roll straight on to the next queued message, which would make the button a lie. The queue is left standing rather than discarded (it is text the user typed, still visible and still removable), and the next send resumes it.

**Escalation survives remount.** An in-flight job id is stashed in `sessionStorage` keyed by thread, so navigating away and back resumes polling instead of losing the turn.

**Auto-scroll never fights you.** The transcript sticks to the newest message only while you are within 100px of the bottom. Scroll up and it stops following, offering a "New messages" pill instead. It scrolls the container, never the page.

**Grouping.** Consecutive messages from the same sender within 60 seconds share one avatar and timestamp. A message carrying a packet, steps, or an error always starts its own group.

**Accessibility.** The transcript is a `role="log"` region (no doubled `aria-live`), each turn is an `<article>` with an author/time label, message actions stay in the DOM so they're keyboard reachable, and all motion is disabled under `prefers-reduced-motion`.

**The composer is a real markdown editor.** The input is the library's own `MarkdownEditor`, so writing a message has the same affordances as writing anywhere else in the app: fenced code with syntax highlighting, block quotes, tables, lists, links, the editor's context menu and its hotkeys. A chat box people paste code into should render that code, not flatten it into one grey line.

Enter sends; Shift+Enter inserts a newline. That works because `MarkdownEditor` emits `keydown` to its host *before* running its own handler and skips that handler when the host calls `preventDefault` — so the editor's own Enter behaviour (list continuation, paragraph splitting) stays intact for the newline case and is suppressed for the sending case.

**Assistant replies render through `MarkdownContent`.** Fenced code becomes a real `CodeViewer` — highlighted, copyable, language-labelled — and tables, block quotes, task lists and footnotes render as proper elements. `MarkdownContent` builds Vue nodes rather than injecting an HTML string, so there is no `v-html` anywhere on this path and assistant output cannot inject markup by construction.

Your own text is never re-interpreted as markdown. Silently turning `_x_` into italics, or eating a leading `#`, misrepresents what someone typed.

## Styling

Every surface is a `--dx-agent-chat-*` custom property; there are no styling props.

```css
.my-panel {
  --dx-agent-chat-user-bg: var(--color-info-subtle);
  --dx-agent-chat-composer-radius: 1.25rem;
}
```

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-agent-chat-gap-intra` | `0.5rem` | Gap within one sender's run |
| `--dx-agent-chat-gap-inter` | `1.25rem` | Gap between runs |
| `--dx-agent-chat-user-bg` | `--color-surface-sunken` | User bubble fill |
| `--dx-agent-chat-user-max-width` | `85%` | User bubble width cap |
| `--dx-agent-chat-user-radius` | `0.75rem` | User bubble radius |
| `--dx-agent-chat-avatar-size` | `1.375rem` | Avatar edge length |
| `--dx-agent-chat-body-size` | `0.875rem` | Message body size |
| `--dx-agent-chat-composer-radius` | `0.75rem` | Composer corner radius |
| `--dx-agent-chat-caret-color` | `--color-interactive` | Streaming caret |
| `--dx-agent-chat-enter-duration` | `180ms` | Message entry duration |

See `agent-chat-tokens.css` for the full list.

The two gap tokens carry the grouping effect: the ratio between them is what makes a transcript scannable. Setting them equal makes the conversation read as an undifferentiated wall.

### Why the roles look different

The user gets a filled, width-capped bubble; the assistant runs full-bleed with no container. That asymmetry is deliberate — symmetric bubbles read as a casual messenger between peers, and boxing an assistant's markdown, tables and code fights the content at sidebar widths. It also means the two roles stay distinguishable in grayscale, rather than relying on color alone.

## useAgentChat composable

For driving a session independently of the UI:

```ts
const {
  messages, queue, sending, status, error, threadId, busy, isEmpty,
  init, send, stop, retry, dequeue, setFeedback, clear,
} = useAgentChat({
  apiAdapter: myChatAdapter,
  contextType: "query_card",
  contextId: "42",
  onPacket: (packet) => console.log(packet),
});

await init();
send("What are the top routes this week?");
```

`status` is `"idle" | "resolving" | "ready" | "unavailable" | "error"`.

`useChatGrouping` (message runs and day boundaries) and `useChatAutoScroll` (stick-to-bottom behavior) are exported separately if you are building a custom transcript.
