import { computed, type ComputedRef, type Ref } from "vue";
import { isDifferentDay } from "../../shared/formatters/relativeTime";
import type { ChatMessage } from "./types";

/** Consecutive messages from the same sender within this window merge visually. */
const GROUP_WINDOW_MS = 60_000;

/** A run of consecutive messages from one sender, rendered under one meta row. */
export interface ChatMessageGroup {
  id: string;
  role: ChatMessage["role"];
  /** Author name carried by the first message of the run, when present. */
  author?: string;
  /** Timestamp of the first message — the group's header time. */
  timestamp?: string;
  messages: ChatMessage[];
  /**
   * Day label rendered ABOVE this group, when it opens a new calendar day.
   * Null for every group that continues the current day.
   */
  dayBoundary: boolean;
}

export interface UseChatGroupingReturn {
  /** Messages with bookkeeping entries removed. */
  visibleMessages: ComputedRef<ChatMessage[]>;
  /** Visible messages collapsed into sender runs. */
  groups: ComputedRef<ChatMessageGroup[]>;
}

/** True for bookkeeping entries that must never render in the conversation. */
export function isSystemMessage(message: ChatMessage): boolean {
  return message.role === "system" || message.metadata?.type === "system";
}

/**
 * Decide whether `message` continues the run started by `previous`.
 *
 * A run breaks on: a different sender, a gap longer than the group window, a
 * calendar-day change, or a message that owns block-level content (a packet,
 * steps, or an error) — those need their own meta row to stay scannable.
 */
export function continuesGroup(previous: ChatMessage, message: ChatMessage): boolean {
  if (previous.role !== message.role) return false;
  if ((previous.author ?? "") !== (message.author ?? "")) return false;
  if (previous.packet || message.packet) return false;
  if (previous.error || message.error) return false;
  if (previous.steps?.length || message.steps?.length) return false;
  if (isDifferentDay(previous.timestamp, message.timestamp)) return false;

  if (!previous.timestamp || !message.timestamp) return true;
  const gap = new Date(message.timestamp).getTime() - new Date(previous.timestamp).getTime();
  return Number.isNaN(gap) ? true : Math.abs(gap) <= GROUP_WINDOW_MS;
}

/**
 * Collapse a flat message list into sender runs, flagging groups that open a
 * new calendar day so the list can render a day divider above them.
 */
export function groupMessages(list: ChatMessage[]): ChatMessageGroup[] {
  const groups: ChatMessageGroup[] = [];
  let previous: ChatMessage | null = null;

  for (const message of list) {
    const last = groups[groups.length - 1];
    if (last && previous && continuesGroup(previous, message)) {
      last.messages.push(message);
    } else {
      groups.push({
        id: `group-${message.id}`,
        role: message.role,
        author: message.author,
        timestamp: message.timestamp,
        messages: [message],
        // The very first group always renders its day label; later groups only
        // when they cross into a new day.
        dayBoundary: previous === null || isDifferentDay(previous.timestamp, message.timestamp),
      });
    }
    previous = message;
  }

  return groups;
}

/**
 * useChatGrouping Composable
 *
 * Filters bookkeeping messages out of a thread and collapses what remains into
 * sender runs for rendering. Pure derivation — holds no state of its own.
 */
export function useChatGrouping(messages: Ref<ChatMessage[]>): UseChatGroupingReturn {
  const visibleMessages = computed(() => (messages.value ?? []).filter((m) => !isSystemMessage(m)));
  const groups = computed(() => groupMessages(visibleMessages.value));
  return { visibleMessages, groups };
}
