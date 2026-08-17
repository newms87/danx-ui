import { describe, it, expect } from "vitest";
import { ref } from "vue";
import {
  continuesGroup,
  groupMessages,
  isSystemMessage,
  useChatGrouping,
} from "../useChatGrouping";
import type { ChatMessage } from "../types";

const T0 = "2026-08-17T10:00:00.000Z";
/** +10s — inside the 60s grouping window. */
const T10s = "2026-08-17T10:00:10.000Z";
/** +5min — outside the window. */
const T5m = "2026-08-17T10:05:00.000Z";
/** Next calendar day. */
const NEXT_DAY = "2026-08-18T10:00:00.000Z";

function msg(over: Partial<ChatMessage> = {}): ChatMessage {
  return { id: "m", role: "assistant", text: "hi", timestamp: T0, ...over };
}

describe("isSystemMessage", () => {
  it("flags a system role", () => {
    expect(isSystemMessage(msg({ role: "system" }))).toBe(true);
  });

  it("flags a metadata.type system marker on an otherwise normal role", () => {
    expect(isSystemMessage(msg({ metadata: { type: "system" } }))).toBe(true);
  });

  it("does not flag an ordinary message", () => {
    expect(isSystemMessage(msg())).toBe(false);
  });
});

describe("continuesGroup", () => {
  it("continues for the same sender inside the time window", () => {
    expect(continuesGroup(msg({ timestamp: T0 }), msg({ timestamp: T10s }))).toBe(true);
  });

  it("breaks when the sender changes", () => {
    expect(continuesGroup(msg({ role: "user" }), msg({ role: "assistant" }))).toBe(false);
  });

  it("breaks when the gap exceeds the grouping window", () => {
    expect(continuesGroup(msg({ timestamp: T0 }), msg({ timestamp: T5m }))).toBe(false);
  });

  it("breaks across a calendar day even within the window arithmetic", () => {
    expect(continuesGroup(msg({ timestamp: T0 }), msg({ timestamp: NEXT_DAY }))).toBe(false);
  });

  it("breaks when either message carries a packet", () => {
    const withPacket = msg({ packet: { type: "sql_query", payload: {} } });
    expect(continuesGroup(msg(), withPacket)).toBe(false);
  });

  it("breaks when either message carries an error", () => {
    expect(continuesGroup(msg(), msg({ error: "boom" }))).toBe(false);
  });

  it("breaks when either message carries steps", () => {
    expect(continuesGroup(msg(), msg({ steps: [{ id: "s", label: "Ran" }] }))).toBe(false);
  });

  it("breaks when the author changes even for the same role", () => {
    expect(continuesGroup(msg({ author: "Ann" }), msg({ author: "Bo" }))).toBe(false);
  });

  it("continues when neither message carries a timestamp", () => {
    expect(continuesGroup(msg({ timestamp: undefined }), msg({ timestamp: undefined }))).toBe(true);
  });
});

describe("groupMessages", () => {
  it("merges consecutive same-sender messages into one group", () => {
    const groups = groupMessages([
      msg({ id: "1", timestamp: T0 }),
      msg({ id: "2", timestamp: T10s }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.messages.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("starts a new group when the sender changes", () => {
    const groups = groupMessages([
      msg({ id: "1", role: "user" }),
      msg({ id: "2", role: "assistant" }),
    ]);
    expect(groups.map((g) => g.role)).toEqual(["user", "assistant"]);
  });

  it("marks the first group as a day boundary", () => {
    const groups = groupMessages([msg({ id: "1" })]);
    expect(groups[0]!.dayBoundary).toBe(true);
  });

  it("marks only the group that opens a new calendar day", () => {
    const groups = groupMessages([
      msg({ id: "1", role: "user", timestamp: T0 }),
      msg({ id: "2", role: "assistant", timestamp: T0 }),
      msg({ id: "3", role: "user", timestamp: NEXT_DAY }),
    ]);
    expect(groups.map((g) => g.dayBoundary)).toEqual([true, false, true]);
  });

  it("carries the first message's author and timestamp onto the group", () => {
    const groups = groupMessages([msg({ id: "1", author: "Ann", timestamp: T0 })]);
    expect(groups[0]!.author).toBe("Ann");
    expect(groups[0]!.timestamp).toBe(T0);
  });

  it("returns no groups for an empty list", () => {
    expect(groupMessages([])).toEqual([]);
  });
});

describe("useChatGrouping", () => {
  it("filters system messages out before grouping", () => {
    const messages = ref<ChatMessage[]>([
      msg({ id: "1", text: "real" }),
      msg({ id: "2", text: "bookkeeping", metadata: { type: "system" } }),
    ]);
    const { visibleMessages, groups } = useChatGrouping(messages);
    expect(visibleMessages.value.map((m) => m.id)).toEqual(["1"]);
    expect(groups.value).toHaveLength(1);
  });

  it("recomputes when the source list changes", () => {
    const messages = ref<ChatMessage[]>([msg({ id: "1", role: "user" })]);
    const { groups } = useChatGrouping(messages);
    expect(groups.value).toHaveLength(1);
    messages.value = [...messages.value, msg({ id: "2", role: "assistant" })];
    expect(groups.value).toHaveLength(2);
  });

  it("tolerates a null-ish message list", () => {
    const messages = ref<ChatMessage[]>(undefined as unknown as ChatMessage[]);
    const { visibleMessages } = useChatGrouping(messages);
    expect(visibleMessages.value).toEqual([]);
  });
});
