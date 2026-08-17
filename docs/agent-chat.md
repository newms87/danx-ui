# Agent Chat Component

A domain-agnostic AI chat sidebar. ANY feature plugs in by passing a `(contextType, contextId)` pair — resolved to a thread by an app-supplied backend adapter — and reacting to the emitted `packet` events.

## No Default Backend

`DanxAgentChat` ships **no default implementation**. Every app's backend proxy is shaped differently (auth, routing, host), so `apiAdapter` is a **required** prop implementing the `ChatAdapter` interface. Nothing renders until you provide one — there is no bundled HTTP client to fall back to.

```typescript
import type { ChatAdapter } from "danx-ui";

const myChatAdapter: ChatAdapter = {
  resolveThread: ({ contextType, contextId }) =>
    fetch(`/api/agent-chat/threads`, {
      method: "POST",
      body: JSON.stringify({ contextType, contextId }),
    }).then((r) => r.json()),

  getThread: (threadId) => fetch(`/api/agent-chat/threads/${threadId}`).then((r) => r.json()),

  sendMessage: (threadId, text) =>
    fetch(`/api/agent-chat/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),

  getJob: (jobId) => fetch(`/api/agent-chat/jobs/${jobId}`).then((r) => r.json()),
};
```

Each app implements these four methods against its own backend proxy — the adapter is the entire integration surface. Keep the actual API token/auth server-side; the browser should only ever talk to your app's own proxy routes, never a third-party service directly.

## Basic Usage

```vue
<template>
  <DanxAgentChat
    context-type="phone-query"
    context-id="saved-query-42"
    :api-adapter="myChatAdapter"
  />
</template>

<script setup lang="ts">
import { DanxAgentChat } from "danx-ui";
import { myChatAdapter } from "./myChatAdapter";
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contextType` | `string` | - | Logical context the chat thread belongs to (required) |
| `contextId` | `string` | - | The specific context instance id — the thread key (required) |
| `apiAdapter` | `ChatAdapter` | - | App-supplied backend adapter (required, no default) |
| `packetSchemas` | `Record<string, ChatPacketSchema>` | `{}` | Friendlier packet headings, keyed by packet type |
| `placeholder` | `string` | `"Ask a question…"` | Composer placeholder text |
| `maxVisibleChars` | `number` | `600` | Character threshold before a message collapses behind "Show more" |
| `initialMessage` | `string \| null` | `null` | Auto-sent the moment the thread resolves |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `packet` | `ChatPacket` | Fired whenever a message (fast reply or escalation result) carries a packet |
| `threadReady` | `string` | Fired once the thread has resolved and history has loaded |
| `error` | `unknown` | Fired on any adapter failure — thread resolution, history load, or a mid-session send |

## Slots

| Slot | Description |
|------|-------------|
| `packet-{type}` | Consumer-provided renderer for a specific packet type. Falls back to a JSON `CodeViewer` when no matching slot is provided. |

```vue
<DanxAgentChat context-type="phone-query" context-id="q1" :api-adapter="adapter">
  <template #packet-sql_query="{ packet }">
    <SqlPreview :sql="packet.payload.sql" />
  </template>
</DanxAgentChat>
```

## The ChatAdapter Contract

```typescript
interface ChatAdapter {
  resolveThread(ctx: { contextType: string; contextId: string }): Promise<{ thread_id: string | null }>;
  getThread(threadId: string): Promise<{ messages: ChatMessage[] }>;
  sendMessage(threadId: string, text: string): Promise<SendMessageResult>;
  getJob(jobId: string): Promise<{ status: string }>;
}
```

- **`resolveThread`** — resolve (or create) the thread backing this `(contextType, contextId)` pair. Return `thread_id: null` (or reject) when the chat can't be established — the component shows a distinct "chat unavailable" state, never a hung spinner.
- **`getThread`** — load the full message history for a resolved thread.
- **`sendMessage`** — send a user message. Two response shapes:
  - **Fast reply**: `{ dispatched: false, reply, packet? }` — rendered immediately.
  - **Escalated**: `{ dispatched: true, job_id }` — the component shows a "Working on it…" placeholder and polls `getJob` until it reaches a terminal status.
- **`getJob`** — poll an escalated job's status. Recognized in-progress statuses: `launched`, `running`, `queued`, `pending`, `in_progress`, `dispatched`. Recognized success statuses: `complete`, `completed`. Anything else (a known failure, `critical_failure`, or an unrecognized status) is treated as a terminal failure and surfaced visibly — never silently retried into a fake timeout.

## Messages and Packets

A `ChatMessage` is either a user turn, an assistant turn, or (filtered out of the rendered thread) a `system` bookkeeping entry:

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text?: string | null;
  packet?: ChatPacket | null;
  working?: boolean; // true while an escalated request is still polling
  error?: string; // visible per-message failure
  timestamp?: string;
  metadata?: { type?: string; [key: string]: unknown };
}
```

A message whose `metadata.type === "system"` (e.g. a bookkeeping marker your backend writes into the thread) is filtered from the rendered conversation — `ChatMessageList` assumes its input may be unfiltered.

A `ChatPacket` is a typed structured result attached to a message:

```typescript
interface ChatPacket {
  type: string; // discriminates the #packet-{type} slot
  payload: unknown;
  valid?: boolean; // false renders a visible "didn't pass validation" state
  error?: string;
}
```

## Serial Sending and the Queue Strip

Messages send **strictly serially** — one send fully resolves (including any escalation poll) before the next one starts. Messages typed while a send is in flight appear in a visible "Queued:" strip below the message list rather than firing concurrently.

## Escalation Polling Survives Remount

When `sendMessage` returns `{ dispatched: true, job_id }`, the in-flight job id is stashed in `sessionStorage` (keyed by thread id) and resumed automatically if the component remounts mid-poll — e.g. the user navigates away and back before the escalated request finishes. The placeholder message and polling loop pick up exactly where they left off.

## Long Message Collapse

Message bodies longer than `maxVisibleChars` (default 600) render truncated with a "Show more" toggle.

## Styling

### CSS Token Overrides

```css
:root {
  --dx-agent-chat-bubble-bg: #fafafa;
  --dx-agent-chat-bubble-radius: 1rem;
}
```

### Available Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-agent-chat-gap` | `--space-sm` | Gap between header/list/queue/footer |
| `--dx-agent-chat-title-color` | `--color-text` | Header title color |
| `--dx-agent-chat-list-gap` | `--space-sm` | Gap between message bubbles |
| `--dx-agent-chat-bubble-bg` | `--color-surface` | Bubble background color |
| `--dx-agent-chat-bubble-border` | `--color-border` | Bubble border color |
| `--dx-agent-chat-bubble-border-user` | `--color-info` | Bubble border color for user messages |
| `--dx-agent-chat-bubble-radius` | `--radius-card` | Bubble corner radius |
| `--dx-agent-chat-bubble-time-color` | `--color-text-muted` | Relative-time label color |

See `agent-chat-tokens.css` in the component source for the full list.

## useAgentChat Composable

For managing chat session state independently of the `DanxAgentChat` component:

```typescript
import { useAgentChat } from "danx-ui";

const { messages, queue, sending, status, error, threadId, init, send } = useAgentChat({
  apiAdapter: myChatAdapter,
  contextType: "phone-query",
  contextId: "saved-query-42",
  onPacket: (packet) => console.log(packet),
  onThreadReady: (threadId) => console.log("ready", threadId),
  onError: (err) => console.error(err),
});

await init();
send("What are the top routes this week?");
```

`status` is one of `"idle" | "resolving" | "ready" | "unavailable" | "error"`.
