import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import {
  REGISTERED_COMPONENTS,
  buildSetup,
  extractScript,
  extractTemplate,
} from "../../../composables/useLivePreview";

import fullyFeatured from "../FullyFeatured.vue?raw";
import markdownReplies from "../MarkdownReplies.vue?raw";
import streamingReply from "../StreamingReply.vue?raw";
import packetTypes from "../PacketTypes.vue?raw";
import escalatedJob from "../EscalatedJob.vue?raw";
import threadHistory from "../ThreadHistory.vue?raw";
import richContent from "../RichContent.vue?raw";
import failureStates from "../FailureStates.vue?raw";
import theming from "../Theming.vue?raw";
import minimalEmbed from "../MinimalEmbed.vue?raw";
import attachments from "../Attachments.vue?raw";

const EXAMPLES = [
  ["FullyFeatured", fullyFeatured],
  ["MarkdownReplies", markdownReplies],
  ["StreamingReply", streamingReply],
  ["PacketTypes", packetTypes],
  ["EscalatedJob", escalatedJob],
  ["ThreadHistory", threadHistory],
  ["RichContent", richContent],
  ["FailureStates", failureStates],
  ["Theming", theming],
  ["MinimalEmbed", minimalEmbed],
  ["Attachments", attachments],
] as const;

/**
 * Compile a demo example exactly the way the live preview does, then MOUNT it.
 *
 * The shared demoExamples smoke test only evaluates each script; it never
 * renders. Without a browser these mounts are the end-to-end proof that the
 * examples on the demo page actually work.
 */
function compileAndMount(source: string) {
  const setup = buildSetup(extractScript(source)!);
  expect(setup).not.toBeNull();
  return mount(
    defineComponent({
      template: extractTemplate(source),
      components: REGISTERED_COMPONENTS,
      setup: setup!,
    })
  );
}

// The mock adapters model network latency with setTimeout, so every test has
// to drive the clock — flushing microtasks alone never reaches their replies.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Advance the fake clock, then let the resulting promise chain settle. */
async function tick(ms = 2000) {
  await vi.advanceTimersByTimeAsync(ms);
  await flushPromises();
}

/**
 * The composer hosts a MarkdownEditor, so typing means writing into its
 * contenteditable and firing `input`. The editor syncs HTML back to markdown
 * through a debounce, which the fake clock has to be advanced past.
 */
async function typeInComposer(w: ReturnType<typeof compileAndMount>, text: string) {
  const el = w.find(".dx-markdown-editor-content");
  el.element.innerHTML = `<p>${text}</p>`;
  await el.trigger("input");
  await tick(0);
  return el;
}

async function send(w: ReturnType<typeof compileAndMount>, text: string) {
  const el = await typeInComposer(w, text);
  await el.trigger("keydown", { key: "Enter" });
  await tick();
}

describe("agent-chat demo examples render", () => {
  it.each(EXAMPLES)("%s mounts and resolves its thread", async (_name, source) => {
    const w = compileAndMount(source);
    await tick();

    expect(w.find('[data-testid="agent-chat-sidebar"]').exists()).toBe(true);
    w.unmount();
  });
});

describe("agent-chat demo examples behave", () => {
  it("FullyFeatured answers with exactly one user and one assistant turn", async () => {
    const w = compileAndMount(fullyFeatured);
    await tick();

    await send(w, "top routes");

    expect(w.findAll(".danx-agent-chat-message")).toHaveLength(2);
    w.unmount();
  });

  it("FullyFeatured offers its suggested prompts before any turn", async () => {
    const w = compileAndMount(fullyFeatured);
    await tick();

    expect(w.findAll('[data-testid="chat-suggestion"]')).toHaveLength(3);
    w.unmount();
  });

  it("MarkdownReplies renders a table and a code block", async () => {
    const w = compileAndMount(markdownReplies);
    await tick();

    await send(w, "top routes");

    const md = w.find(".danx-agent-chat-markdown");
    expect(md.find("table").exists()).toBe(true);
    expect(md.find("pre").exists()).toBe(true);
    w.unmount();
  });

  it("PacketTypes renders the SQL slot and applies a valid packet", async () => {
    const w = compileAndMount(packetTypes);
    await tick();

    await send(w, "give me a query");

    expect(w.find('[data-testid="packet"]').exists()).toBe(true);
    await w.find('[data-testid="packet-apply"]').trigger("click");
    await tick(0);
    // The example mirrors the real consumer: Apply writes into its editor.
    expect(w.text()).toContain("Applied to editor");
    w.unmount();
  });

  it("PacketTypes blocks applying a packet that failed validation", async () => {
    const w = compileAndMount(packetTypes);
    await tick();

    await send(w, "drop the calls table");

    expect(w.find('[data-testid="packet-invalid"]').text()).toContain("only_select_allowed");
    expect(w.find('[data-testid="packet-apply"]').exists()).toBe(false);
    w.unmount();
  });

  it("PacketTypes badges a repaired packet", async () => {
    const w = compileAndMount(packetTypes);
    await tick();

    await send(w, "repair this");

    expect(w.find('[data-testid="packet-repaired"]').exists()).toBe(true);
    w.unmount();
  });

  it("PacketTypes falls back to the JSON viewer for an unregistered type", async () => {
    const w = compileAndMount(packetTypes);
    await tick();

    await send(w, "return an unknown packet");

    expect(w.find('[data-testid="packet"]').exists()).toBe(true);
    expect(w.html()).toContain("carrier_report");
    w.unmount();
  });

  it("StreamingReply streams tokens into a live assistant message", async () => {
    const w = compileAndMount(streamingReply);
    await tick();

    const el = await typeInComposer(w, "tell me");
    await el.trigger("keydown", { key: "Enter" });
    await tick(600);

    const assistant = w.findAll(".danx-agent-chat-message--assistant");
    expect(assistant.length).toBeGreaterThan(0);
    expect(assistant[0]!.text().length).toBeGreaterThan(0);

    await tick(20000);
    w.unmount();
  });

  it("EscalatedJob shows a working state with steps, and offers Stop", async () => {
    const w = compileAndMount(escalatedJob);
    await tick();

    const el = await typeInComposer(w, "analyze");
    await el.trigger("keydown", { key: "Enter" });
    await tick(2500);

    expect(w.find('[data-testid="working-state"]').exists()).toBe(true);
    expect(w.find('[data-testid="steps"]').exists()).toBe(true);
    // A turn in flight is always stoppable; here the adapter also cancels
    // the job upstream.
    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(true);

    w.unmount();
  });

  it("EscalatedJob lands its packet once the job completes", async () => {
    const w = compileAndMount(escalatedJob);
    await tick();

    const el = await typeInComposer(w, "analyze");
    await el.trigger("keydown", { key: "Enter" });
    await tick(30000);

    expect(w.find('[data-testid="packet"]').exists()).toBe(true);
    expect(w.find('[data-testid="working-state"]').exists()).toBe(false);
    w.unmount();
  });

  it("ThreadHistory renders history, groups a run, and hides the system marker", async () => {
    const w = compileAndMount(threadHistory);
    await tick();

    expect(w.text()).toContain("Can you pull primary numbers");
    // The bookkeeping comment must never reach the transcript.
    expect(w.text()).not.toContain("last_run_at marker");
    // Sam's two consecutive messages collapse into one group.
    expect(w.findAll(".danx-agent-chat-group").length).toBeLessThan(
      w.findAll(".danx-agent-chat-message").length
    );
    // Yesterday's turns and today's are separated by day dividers.
    expect(w.findAll(".danx-agent-chat-day").length).toBeGreaterThanOrEqual(2);
    w.unmount();
  });

  it("RichContent renders steps, citations, and clamps a long answer", async () => {
    const w = compileAndMount(richContent);
    await tick();

    await send(w, "how does routing work");

    expect(w.find('[data-testid="steps"]').exists()).toBe(true);
    expect(w.find(".danx-agent-chat-citations").exists()).toBe(true);
    expect(w.find('[data-testid="collapse-toggle"]').exists()).toBe(true);
    w.unmount();
  });

  it("FailureStates shows the unavailable banner and disables the composer", async () => {
    const w = compileAndMount(failureStates);
    await tick();

    expect(w.find('[data-testid="chat-unavailable"]').exists()).toBe(true);
    expect(w.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe("false");
    w.unmount();
  });

  it("Attachments renders files, an upload in flight, and a failure", async () => {
    const w = compileAndMount(attachments);
    await tick();

    // Four files across two turns: an image, a csv, one uploading, one failed.
    expect(w.findAll('[data-testid="attachment"]')).toHaveLength(4);
    expect(w.find(".danx-file__error").exists()).toBe(true);
    expect(w.text()).toContain("62");
    w.unmount();
  });

  it("Attachments reports the clicked file to the host", async () => {
    const w = compileAndMount(attachments);
    await tick();

    await w.findAll('[data-testid="attachment"]')[0]!.trigger("click");
    await tick(0);

    expect(w.text()).toContain("call-volume.png");
    w.unmount();
  });

  it("MinimalEmbed hides the header and avatars", async () => {
    const w = compileAndMount(minimalEmbed);
    await tick();

    expect(w.find(".danx-agent-chat__header").exists()).toBe(false);
    expect(w.find(".danx-agent-chat-group__avatar").exists()).toBe(false);
    w.unmount();
  });

  it("Theming mounts with its token overrides scoped to a wrapper", async () => {
    const w = compileAndMount(theming);
    await tick();

    expect(w.find(".agent-chat-branded").exists()).toBe(true);
    w.unmount();
  });
});
