import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ChatEmptyState from "../ChatEmptyState.vue";
import ChatMessageActions from "../ChatMessageActions.vue";
import ChatStepList from "../ChatStepList.vue";
import ChatThinkingIndicator from "../ChatThinkingIndicator.vue";
import QueuedMessageChip from "../QueuedMessageChip.vue";

describe("ChatThinkingIndicator", () => {
  it("renders the default working label", () => {
    const w = mount(ChatThinkingIndicator);
    expect(w.text()).toContain("Working on it");
  });

  it("renders a custom phase label", () => {
    const w = mount(ChatThinkingIndicator, { props: { label: "Searching call logs" } });
    expect(w.text()).toContain("Searching call logs");
  });

  it("renders seconds under a minute", () => {
    const w = mount(ChatThinkingIndicator, { props: { elapsed: 42 } });
    expect(w.text()).toContain("42s");
  });

  it("renders minutes and seconds past a minute", () => {
    const w = mount(ChatThinkingIndicator, { props: { elapsed: 95 } });
    expect(w.text()).toContain("1m 35s");
  });

  it("omits the elapsed suffix below one second", () => {
    const w = mount(ChatThinkingIndicator, { props: { elapsed: 0.4 } });
    expect(w.text()).not.toContain("0");
  });

  it("omits the elapsed suffix when no elapsed time is known", () => {
    const w = mount(ChatThinkingIndicator);
    expect(w.text()).not.toContain("·");
  });
});

describe("ChatStepList", () => {
  const steps = [
    { id: "s1", label: "Queried calls table", kind: "tool" as const, durationMs: 120 },
    { id: "s2", label: "Read schema", kind: "read" as const, detail: "table: calls" },
  ];

  it("renders nothing when there are no steps", () => {
    const w = mount(ChatStepList, { props: { steps: [] } });
    expect(w.find('[data-testid="steps"]').exists()).toBe(false);
  });

  it("renders one flat row per step", () => {
    const w = mount(ChatStepList, { props: { steps } });
    expect(w.findAll(".danx-agent-chat-step")).toHaveLength(2);
  });

  it("renders a sub-second duration in ms", () => {
    const w = mount(ChatStepList, { props: { steps } });
    expect(w.text()).toContain("120ms");
  });

  it("renders a longer duration in seconds", () => {
    const w = mount(ChatStepList, {
      props: { steps: [{ id: "s", label: "x", durationMs: 2500 }] },
    });
    expect(w.text()).toContain("2.5s");
  });

  it("keeps step detail collapsed until asked", async () => {
    const w = mount(ChatStepList, { props: { steps } });
    expect(w.find(".danx-agent-chat-step__detail").exists()).toBe(false);
    await w.findAll(".danx-agent-chat-step__row")[1]!.trigger("click");
    expect(w.find(".danx-agent-chat-step__detail").text()).toContain("table: calls");
  });

  it("collapses an expanded step again", async () => {
    const w = mount(ChatStepList, { props: { steps } });
    const row = w.findAll(".danx-agent-chat-step__row")[1]!;
    await row.trigger("click");
    await row.trigger("click");
    expect(w.find(".danx-agent-chat-step__detail").exists()).toBe(false);
  });

  it("does not offer expansion for a step with no detail", async () => {
    const w = mount(ChatStepList, { props: { steps } });
    const row = w.findAll(".danx-agent-chat-step__row")[0]!;
    expect(row.attributes("disabled")).toBeDefined();
    await row.trigger("click");
    expect(w.find(".danx-agent-chat-step__detail").exists()).toBe(false);
  });

  it("shows a spinner for a running step", () => {
    const w = mount(ChatStepList, {
      props: { steps: [{ id: "s", label: "Running", status: "running" as const }] },
    });
    expect(w.find(".danx-spinner").exists()).toBe(true);
  });

  it("marks a failed step", () => {
    const w = mount(ChatStepList, {
      props: { steps: [{ id: "s", label: "Failed", status: "error" as const }] },
    });
    expect(w.find(".danx-agent-chat-step--error").exists()).toBe(true);
  });

  it("renders a step with an unrecognized kind", () => {
    const w = mount(ChatStepList, {
      props: { steps: [{ id: "s", label: "Mystery", kind: "nope" as never }] },
    });
    expect(w.text()).toContain("Mystery");
  });
});

describe("ChatMessageActions", () => {
  it("copies the message text to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const w = mount(ChatMessageActions, { props: { text: "hello" } });
    await w.find('[data-testid="action-copy"]').trigger("click");
    expect(writeText).toHaveBeenCalledWith("hello");
    vi.unstubAllGlobals();
  });

  it("stays silent when the clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    const w = mount(ChatMessageActions, { props: { text: "hello" } });
    await expect(w.find('[data-testid="action-copy"]').trigger("click")).resolves.not.toThrow();
    vi.unstubAllGlobals();
  });

  it("offers no copy action without text", () => {
    const w = mount(ChatMessageActions, { props: { text: "" } });
    expect(w.find('[data-testid="action-copy"]').exists()).toBe(false);
  });

  it("shows retry only when the turn is retryable", async () => {
    const w = mount(ChatMessageActions, { props: { text: "x", canRetry: true } });
    await w.find('[data-testid="action-retry"]').trigger("click");
    expect(w.emitted("retry")).toHaveLength(1);
  });

  it("hides retry by default", () => {
    const w = mount(ChatMessageActions, { props: { text: "x" } });
    expect(w.find('[data-testid="action-retry"]').exists()).toBe(false);
  });

  it("emits the chosen feedback value", async () => {
    const w = mount(ChatMessageActions, { props: { text: "x", showFeedback: true } });
    await w.find('[data-testid="action-thumbs-down"]').trigger("click");
    expect(w.emitted("feedback")?.[0]).toEqual(["down"]);
  });

  it("hides feedback controls unless enabled", () => {
    const w = mount(ChatMessageActions, { props: { text: "x" } });
    expect(w.find('[data-testid="action-thumbs-up"]').exists()).toBe(false);
  });

  // Hover-reveal is CSS-only: the controls must stay in the DOM so keyboard
  // and screen-reader users, who never produce a hover, can still reach them.
  it("keeps actions in the DOM rather than gating them on hover", () => {
    const w = mount(ChatMessageActions, { props: { text: "x" } });
    expect(w.find('[data-testid="message-actions"]').exists()).toBe(true);
  });
});

describe("ChatEmptyState", () => {
  it("renders the headline and description", () => {
    const w = mount(ChatEmptyState, {
      props: { title: "Ask anything", description: "I can query your data." },
    });
    expect(w.text()).toContain("Ask anything");
    expect(w.text()).toContain("I can query your data.");
  });

  it("renders string suggestions and emits the label on select", async () => {
    const w = mount(ChatEmptyState, { props: { suggestions: ["Show top routes"] } });
    await w.find('[data-testid="chat-suggestion"]').trigger("click");
    expect(w.emitted("select")?.[0]).toEqual(["Show top routes"]);
  });

  it("prefers a suggestion's text over its label when sending", async () => {
    const w = mount(ChatEmptyState, {
      props: { suggestions: [{ label: "Top routes", text: "Show me the top 10 routes" }] },
    });
    await w.find('[data-testid="chat-suggestion"]').trigger("click");
    expect(w.emitted("select")?.[0]).toEqual(["Show me the top 10 routes"]);
  });

  it("renders a suggestion icon when supplied", () => {
    const w = mount(ChatEmptyState, {
      props: { suggestions: [{ label: "Query", icon: "database" }] },
    });
    expect(w.find('[data-testid="chat-suggestion"] .danx-icon').exists()).toBe(true);
  });

  it("renders no suggestion list when none are given", () => {
    const w = mount(ChatEmptyState);
    expect(w.find('[data-testid="chat-suggestion"]').exists()).toBe(false);
  });
});

describe("QueuedMessageChip", () => {
  it("renders the queued text", () => {
    const w = mount(QueuedMessageChip, { props: { text: "primary US numbers" } });
    expect(w.text()).toContain("primary US numbers");
  });

  it("emits remove when dismissed", async () => {
    const w = mount(QueuedMessageChip, { props: { text: "queued" } });
    await w.find(".danx-chip__remove").trigger("click");
    expect(w.emitted("remove")).toHaveLength(1);
  });
});

describe("ChatMessageActions copy feedback", () => {
  it("shows a transient copied confirmation then reverts", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const w = mount(ChatMessageActions, { props: { text: "hello" } });

    await w.find('[data-testid="action-copy"]').trigger("click");
    await vi.advanceTimersByTimeAsync(0);
    expect(w.find('[data-testid="action-copy"]').attributes("aria-label")).toBe("Copied");

    await vi.advanceTimersByTimeAsync(1600);
    expect(w.find('[data-testid="action-copy"]').attributes("aria-label")).toBe("Copy message");

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("restarts the confirmation window on a second copy", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const w = mount(ChatMessageActions, { props: { text: "hello" } });

    await w.find('[data-testid="action-copy"]').trigger("click");
    await vi.advanceTimersByTimeAsync(1400);
    // Second copy, 100ms before the first window would have closed.
    await w.find('[data-testid="action-copy"]').trigger("click");
    await vi.advanceTimersByTimeAsync(200);

    // The stale timer must not blink the confirmation out early.
    expect(w.find('[data-testid="action-copy"]').attributes("aria-label")).toBe("Copied");

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("does not reset a component that unmounted before the window closed", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const w = mount(ChatMessageActions, { props: { text: "hello" } });

    await w.find('[data-testid="action-copy"]').trigger("click");
    w.unmount();

    // A pending reset firing into a torn-down component is a leak, and Vue
    // warns on it — this repo's zero-warning policy makes that a failure.
    await expect(vi.advanceTimersByTimeAsync(2000)).resolves.not.toThrow();

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
