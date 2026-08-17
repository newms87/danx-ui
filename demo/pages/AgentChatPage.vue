<script setup lang="ts">
/**
 * AgentChatPage
 *
 * Demo page for DanxAgentChat with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import agentChatDocs from "../../docs/agent-chat.md?raw";

// Load SFC examples as raw strings for live-editable demos
import fullyFeaturedCode from "./agent-chat-examples/FullyFeatured.vue?raw";
import markdownRepliesCode from "./agent-chat-examples/MarkdownReplies.vue?raw";
import streamingReplyCode from "./agent-chat-examples/StreamingReply.vue?raw";
import packetTypesCode from "./agent-chat-examples/PacketTypes.vue?raw";
import escalatedJobCode from "./agent-chat-examples/EscalatedJob.vue?raw";
import threadHistoryCode from "./agent-chat-examples/ThreadHistory.vue?raw";
import richContentCode from "./agent-chat-examples/RichContent.vue?raw";
import failureStatesCode from "./agent-chat-examples/FailureStates.vue?raw";
import themingCode from "./agent-chat-examples/Theming.vue?raw";
import minimalEmbedCode from "./agent-chat-examples/MinimalEmbed.vue?raw";
</script>

<template>
  <DemoPage
    title="Agent Chat"
    description="A domain-agnostic AI chat sidebar. Ships with no default backend — you provide a ChatAdapter for your own API, and every demo below runs against its own mock implementation."
    :docs="agentChatDocs"
  >
    <DemoSection
      title="Fully featured"
      description="Avatars, message grouping, day dividers, markdown, hover actions, a suggested-prompt empty state, and a cancellable serial send queue. Send several messages quickly to see the queue strip."
      :code="fullyFeaturedCode"
    />

    <DemoSection
      title="Streaming replies"
      description="When the adapter implements streamMessage, tokens render as they arrive behind a live caret and the Send button becomes Stop. Stopping keeps the partial answer rather than discarding it."
      :code="streamingReplyCode"
    />

    <DemoSection
      title="Typed packets"
      description="The SMS Analytics integration: replies can carry a structured payload rendered by a #packet-{type} slot with an Apply action. Covers all three validity states — valid, failed validation, and never-validated — plus the repaired badge the backend sets after a correction pass."
      :code="packetTypesCode"
    />

    <DemoSection
      title="Escalated (long-running) jobs"
      description="A complex ask dispatches a background job. The component polls it, streaming tool-call steps and live elapsed time into the working message, then reloads the thread when it completes. Stop cancels the job upstream."
      :code="escalatedJobCode"
    />

    <DemoSection
      title="Markdown rendering"
      description="Assistant replies render as markdown — headings, tables, fenced code, and quotes — using the library's own zero-dependency renderer, which escapes HTML rather than trusting it."
      :code="markdownRepliesCode"
    />

    <DemoSection
      title="Steps, citations and long answers"
      description="Agent tool calls collapse into flat rows (never one card per call), sources render as chips, and answers past maxVisibleChars clamp behind Show more."
      :code="richContentCode"
    />

    <DemoSection
      title="Existing thread history"
      description="A thread loaded mid-conversation: multiple named participants, a day divider between yesterday and today, consecutive messages grouped under one avatar, and a metadata.type=&quot;system&quot; bookkeeping comment that is filtered out entirely."
      :code="threadHistoryCode"
    />

    <DemoSection
      title="Failure states"
      description="Nothing fails silently. An unreachable chat disables the composer behind a banner; a failed send is retryable in place; a failed job reports its terminal status verbatim instead of polling into a fake timeout."
      :code="failureStatesCode"
    />

    <DemoSection
      title="Theming with tokens"
      description="Every surface is a --dx-agent-chat-* custom property. No styling props — scope the tokens to a wrapper and the whole panel re-skins."
      :code="themingCode"
    />

    <DemoSection
      title="Minimal embed"
      description="Header, avatars, message actions and markdown all switched off, for a compact inline helper."
      :code="minimalEmbedCode"
    />
  </DemoPage>
</template>
