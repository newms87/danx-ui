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
import basicConversationCode from "./agent-chat-examples/BasicConversation.vue?raw";
import packetRepliesCode from "./agent-chat-examples/PacketReplies.vue?raw";
import escalatedRequestCode from "./agent-chat-examples/EscalatedRequest.vue?raw";
</script>

<template>
  <DemoPage
    title="Agent Chat"
    description="A domain-agnostic AI chat sidebar. Ships with no default backend — provide a ChatAdapter implementing your own app's API to make it work."
    :docs="agentChatDocs"
  >
    <DemoSection
      title="Basic Conversation"
      description="Thread resolution, an initial auto-sent message, and strictly-serial sending — send a few messages quickly to see the queue strip."
      :code="basicConversationCode"
    />

    <DemoSection
      title="Packet Rendering (two independent types)"
      description="Proof the component is backend-agnostic: the same DanxAgentChat renders two unrelated packet types purely from what the mock adapter sends back — a SQL preview and a bar chart, each via its own #packet-{type} slot."
      :code="packetRepliesCode"
    />

    <DemoSection
      title="Escalated (Long-Running) Request"
      description="The mock adapter dispatches every send to a background job instead of replying synchronously. DanxAgentChat shows a working state and polls until the job completes."
      :code="escalatedRequestCode"
    />
  </DemoPage>
</template>
