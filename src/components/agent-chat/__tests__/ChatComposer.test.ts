import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ChatComposer from "../ChatComposer.vue";

/**
 * The composer hosts a MarkdownEditor, so the editable surface is a
 * contenteditable div rather than a textarea. Typing means setting its text and
 * firing `input` — the same way the markdown-editor's own tests drive it.
 */
function editor(w: ReturnType<typeof mount>) {
  return w.find(".dx-markdown-editor-content");
}

async function type(w: ReturnType<typeof mount>, value: string) {
  const el = editor(w);
  // The editor converts its own innerHTML back to markdown on `input`, so a
  // block wrapper is what a real keystroke would leave behind.
  el.element.innerHTML = `<p>${value}</p>`;
  await el.trigger("input");
  // The editor syncs HTML back to markdown through a debounce, which is a
  // macrotask — awaiting nextTick alone lands before the model updates.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

function contentOf(w: ReturnType<typeof mount>): string {
  return editor(w).element.textContent ?? "";
}

describe("ChatComposer sending", () => {
  it("emits send with trimmed text and clears the field", async () => {
    const w = mount(ChatComposer);
    await type(w, "  primary US numbers  ");
    await w.find('[data-testid="composer-send"]').trigger("click");
    expect(w.emitted("send")?.[0]).toEqual(["primary US numbers"]);
    expect(contentOf(w)).toBe("");
  });

  it("sends on Enter", async () => {
    const w = mount(ChatComposer);
    await type(w, "go");
    await editor(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")?.[0]).toEqual(["go"]);
  });

  it("emits send exactly once per Enter press", async () => {
    const w = mount(ChatComposer);
    await type(w, "go");
    await editor(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toHaveLength(1);
  });

  it("prevents the default newline when Enter sends", async () => {
    const w = mount(ChatComposer);
    await type(w, "go");
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true });
    editor(w).element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("inserts a newline instead of sending on Shift+Enter", async () => {
    const w = mount(ChatComposer);
    await type(w, "line one");
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: true,
      cancelable: true,
      bubbles: true,
    });
    editor(w).element.dispatchEvent(event);
    expect(w.emitted("send")).toBeUndefined();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not send while an IME composition is active", async () => {
    const w = mount(ChatComposer);
    await type(w, "にほん");
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true });
    Object.defineProperty(event, "isComposing", { value: true });
    editor(w).element.dispatchEvent(event);
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not send whitespace-only text", async () => {
    const w = mount(ChatComposer);
    await type(w, "   ");
    await editor(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not send while disabled", async () => {
    const w = mount(ChatComposer, { props: { disabled: true } });
    await type(w, "hi");
    await editor(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("ignores non-Enter keys", async () => {
    const w = mount(ChatComposer);
    await type(w, "hi");
    await editor(w).trigger("keydown", { key: "a" });
    expect(w.emitted("send")).toBeUndefined();
  });
});

describe("ChatComposer paste", () => {
  // The composer takes no view on what a paste means — it hands the event up
  // and lets the panel decide whether it becomes an attachment.
  it("re-emits a paste to its host untouched", async () => {
    const w = mount(ChatComposer);
    // Emitted from the editor rather than dispatched on the DOM: happy-dom
    // gives a constructed ClipboardEvent no clipboardData, which the editor's
    // own handler cannot read. What matters here is that the composer passes
    // the event straight up without consuming it.
    const event = { preventDefault: vi.fn() } as unknown as ClipboardEvent;

    w.findComponent({ name: "MarkdownEditor" }).vm.$emit("paste", event);
    await nextTick();

    expect(w.emitted("paste")?.[0]).toEqual([event]);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe("ChatComposer send/stop swap", () => {
  it("shows Send when idle", () => {
    const w = mount(ChatComposer);
    expect(w.find('[data-testid="composer-send"]').exists()).toBe(true);
    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(false);
  });

  it("swaps Send for Stop while busy", () => {
    const w = mount(ChatComposer, { props: { busy: true } });
    expect(w.find('[data-testid="composer-stop"]').exists()).toBe(true);
    expect(w.find('[data-testid="composer-send"]').exists()).toBe(false);
  });

  it("emits stop when the stop control is used", async () => {
    const w = mount(ChatComposer, { props: { busy: true } });
    await w.find('[data-testid="composer-stop"]').trigger("click");
    expect(w.emitted("stop")).toHaveLength(1);
  });
});

describe("ChatComposer affordances", () => {
  it("renders the given placeholder", () => {
    const w = mount(ChatComposer, { props: { placeholder: "Type here…" } });
    expect(w.find(".dx-markdown-editor-content").attributes("data-placeholder")).toBe("Type here…");
  });

  it("shows the keyboard hint when enabled", () => {
    const w = mount(ChatComposer, { props: { showHint: true } });
    expect(w.find(".danx-agent-chat-composer__hint").text()).toContain("to send");
  });

  it("hides the keyboard hint once the conversation is under way", () => {
    const w = mount(ChatComposer, { props: { showHint: false } });
    expect(w.find(".danx-agent-chat-composer__hint").exists()).toBe(false);
  });

  it("hides the counter well below the limit", async () => {
    const w = mount(ChatComposer, { props: { maxLength: 100, showHint: false } });
    await type(w, "short");
    expect(w.find('[data-testid="composer-count"]').exists()).toBe(false);
  });

  it("shows the counter as the limit approaches", async () => {
    const w = mount(ChatComposer, { props: { maxLength: 10, showHint: false } });
    await type(w, "123456789");
    expect(w.find('[data-testid="composer-count"]').text()).toContain("9/10");
  });

  it("marks the counter over-limit and blocks sending past the cap", async () => {
    const w = mount(ChatComposer, { props: { maxLength: 5, showHint: false } });
    await type(w, "123456");
    expect(w.find('[data-testid="composer-count"]').classes()).toContain(
      "danx-agent-chat-composer__count--over"
    );
    await editor(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });
});
