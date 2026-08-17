/**
 * Agent Chat Component Module
 *
 * Exports:
 * - DanxAgentChat: The chat sidebar component
 * - useAgentChat: Composable managing a chat session independently of the UI
 * - useChatGrouping / useChatAutoScroll: the transcript's derivation + scroll logic
 * - Types: TypeScript interfaces, including the app-implemented ChatAdapter contract
 */

export { default as DanxAgentChat } from "./DanxAgentChat.vue";
export { useAgentChat } from "./useAgentChat";
export type { ChatStatus, UseAgentChatOptions, UseAgentChatReturn } from "./useAgentChat";
export { useChatGrouping, groupMessages, continuesGroup, isSystemMessage } from "./useChatGrouping";
export type { ChatMessageGroup, UseChatGroupingReturn } from "./useChatGrouping";
export { useChatAutoScroll } from "./useChatAutoScroll";
export type { UseChatAutoScrollOptions, UseChatAutoScrollReturn } from "./useChatAutoScroll";
export type {
  ChatAdapter,
  ChatAttachment,
  ChatCitation,
  ChatFeedback,
  ChatJobStatus,
  ChatMessage,
  ChatPacket,
  ChatPacketSchema,
  ChatStep,
  ChatStreamHandlers,
  ChatSuggestion,
  DanxAgentChatEmits,
  DanxAgentChatProps,
  DanxAgentChatSlots,
  GetThreadResult,
  ResolveThreadResult,
  SendMessageResult,
} from "./types";
