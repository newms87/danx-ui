import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownEditorFooter from "../MarkdownEditorFooter.vue";

describe("MarkdownEditorFooter", () => {
  it("renders char count", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 42 },
    });
    expect(wrapper.find(".char-count").text()).toContain("42");
  });

  it("formats large char counts with locale string", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 1234567 },
    });
    // toLocaleString will add commas or equivalent
    expect(wrapper.find(".char-count").text()).toContain("1,234,567");
  });

  it("renders keyboard icon button", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 0 },
    });
    const btn = wrapper.find(".hotkey-help-btn");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("title")).toBe("Keyboard shortcuts (Ctrl+?)");
  });

  it("emits show-hotkeys when button is clicked", async () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 0 },
    });
    await wrapper.find(".hotkey-help-btn").trigger("click");
    expect(wrapper.emitted("show-hotkeys")).toHaveLength(1);
  });

  it("displays zero char count", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 0 },
    });
    expect(wrapper.find(".char-count").text()).toContain("0");
  });
});
