import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatComposer from "../ChatComposer.vue";

function textarea(w: ReturnType<typeof mount>) {
  return w.find('[data-testid="composer-input"]');
}

describe("ChatComposer sending", () => {
  it("emits send with trimmed text and clears the field", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("  primary US numbers  ");
    await w.find('[data-testid="composer-send"]').trigger("click");
    expect(w.emitted("send")?.[0]).toEqual(["primary US numbers"]);
    expect((textarea(w).element as HTMLTextAreaElement).value).toBe("");
  });

  it("sends on Enter", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("go");
    await textarea(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")?.[0]).toEqual(["go"]);
  });

  it("emits send exactly once per Enter press", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("go");
    await textarea(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toHaveLength(1);
  });

  it("prevents the default newline when Enter sends", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("go");
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true });
    textarea(w).element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("inserts a newline instead of sending on Shift+Enter", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("line one");
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: true,
      cancelable: true,
      bubbles: true,
    });
    textarea(w).element.dispatchEvent(event);
    expect(w.emitted("send")).toBeUndefined();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not send while an IME composition is active", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("にほん");
    const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true });
    Object.defineProperty(event, "isComposing", { value: true });
    textarea(w).element.dispatchEvent(event);
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not send whitespace-only text", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("   ");
    await textarea(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not send while disabled", async () => {
    const w = mount(ChatComposer, { props: { disabled: true } });
    await textarea(w).setValue("hi");
    await textarea(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("ignores non-Enter keys", async () => {
    const w = mount(ChatComposer);
    await textarea(w).setValue("hi");
    await textarea(w).trigger("keydown", { key: "a" });
    expect(w.emitted("send")).toBeUndefined();
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
    expect(textarea(w).attributes("placeholder")).toBe("Type here…");
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
    await textarea(w).setValue("short");
    expect(w.find('[data-testid="composer-count"]').exists()).toBe(false);
  });

  it("shows the counter as the limit approaches", async () => {
    const w = mount(ChatComposer, { props: { maxLength: 10, showHint: false } });
    await textarea(w).setValue("123456789");
    expect(w.find('[data-testid="composer-count"]').text()).toContain("9/10");
  });

  it("marks the counter over-limit and blocks sending past the cap", async () => {
    const w = mount(ChatComposer, { props: { maxLength: 5, showHint: false } });
    await textarea(w).setValue("123456");
    expect(w.find('[data-testid="composer-count"]').classes()).toContain(
      "danx-agent-chat-composer__count--over"
    );
    await textarea(w).trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });
});
