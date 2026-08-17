/**
 * Agent Chat Component Module
 *
 * Exports:
 * - DanxAgentChat: The chat sidebar component
 * - useAgentChat: Composable for managing chat session state independently
 * - Types: TypeScript interfaces, including the app-implemented ChatAdapter contract
 */

export { default as DanxAgentChat } from "./DanxAgentChat.vue";
export { useAgentChat } from "./useAgentChat";
export type { ChatStatus, UseAgentChatOptions, UseAgentChatReturn } from "./useAgentChat";
export type {
  ChatAdapter,
  ChatMessage,
  ChatPacket,
  ChatPacketSchema,
  DanxAgentChatEmits,
  DanxAgentChatProps,
  DanxAgentChatSlots,
  GetThreadResult,
  JobStatus,
  ResolveThreadResult,
  SendMessageResult,
} from "./types";
