import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatInput from "../ChatInput.vue";

describe("ChatInput", () => {
  it("emits send with the trimmed text and clears the field on button click", async () => {
    const w = mount(ChatInput);
    await w.find("textarea").setValue("  primary US numbers  ");
    await w.find("button").trigger("click");
    expect(w.emitted("send")?.[0]).toEqual(["primary US numbers"]);
    expect((w.find("textarea").element as HTMLTextAreaElement).value).toBe("");
  });

  it("sends on Enter (without Shift)", async () => {
    const w = mount(ChatInput);
    await w.find("textarea").setValue("go");
    await w.find("textarea").trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")?.[0]).toEqual(["go"]);
  });

  it("does not send an empty/whitespace message via button click (button is disabled)", async () => {
    const w = mount(ChatInput);
    await w.find("textarea").setValue("   ");
    await w.find("button").trigger("click");
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not send a whitespace-only message via Enter", async () => {
    const w = mount(ChatInput);
    await w.find("textarea").setValue("   ");
    await w.find("textarea").trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not emit when disabled", async () => {
    const w = mount(ChatInput, { props: { disabled: true } });
    await w.find("textarea").setValue("hi");
    await w.find("button").trigger("click");
    expect(w.emitted("send")).toBeUndefined();
  });

  it("does not emit on Enter when disabled, even with non-empty text", async () => {
    const w = mount(ChatInput, { props: { disabled: true } });
    await w.find("textarea").setValue("hi");
    await w.find("textarea").trigger("keydown", { key: "Enter" });
    expect(w.emitted("send")).toBeUndefined();
  });

  it("renders the given placeholder", () => {
    const w = mount(ChatInput, { props: { placeholder: "Type here…" } });
    expect(w.find("textarea").attributes("placeholder")).toBe("Type here…");
  });
});
