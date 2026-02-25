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

  it("renders keyboard icon button with tooltip", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 0 },
    });
    const btn = wrapper.find(".hotkey-help-btn");
    expect(btn.exists()).toBe(true);
    const tooltip = wrapper
      .findAllComponents({ name: "DanxTooltip" })
      .find((t) => t.props("tooltip") === "Keyboard shortcuts (Ctrl+?)");
    expect(tooltip).toBeDefined();
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

  it("renders default slot content", () => {
    const wrapper = mount(MarkdownEditorFooter, {
      props: { charCount: 0 },
      slots: {
        default: "<span class='save-status'>Saved</span>",
      },
    });
    expect(wrapper.find(".save-status").text()).toBe("Saved");
  });

  describe("raw toggle", () => {
    it("renders the raw toggle button with tooltip", () => {
      const wrapper = mount(MarkdownEditorFooter, {
        props: { charCount: 0 },
      });
      const btn = wrapper.find(".raw-toggle-btn");
      expect(btn.exists()).toBe(true);
      const tooltip = wrapper
        .findAllComponents({ name: "DanxTooltip" })
        .find((t) => t.props("tooltip") === "Show raw markdown");
      expect(tooltip).toBeDefined();
    });

    it("emits toggle-raw when raw toggle button is clicked", async () => {
      const wrapper = mount(MarkdownEditorFooter, {
        props: { charCount: 0 },
      });
      await wrapper.find(".raw-toggle-btn").trigger("click");
      expect(wrapper.emitted("toggle-raw")).toHaveLength(1);
    });

    it("does not have is-active class when isRawMode is false", () => {
      const wrapper = mount(MarkdownEditorFooter, {
        props: { charCount: 0, isRawMode: false },
      });
      expect(wrapper.find(".raw-toggle-btn.is-active").exists()).toBe(false);
    });

    it("has is-active class when isRawMode is true", () => {
      const wrapper = mount(MarkdownEditorFooter, {
        props: { charCount: 0, isRawMode: true },
      });
      expect(wrapper.find(".raw-toggle-btn.is-active").exists()).toBe(true);
    });

    it("defaults isRawMode to false when not provided", () => {
      const wrapper = mount(MarkdownEditorFooter, {
        props: { charCount: 0 },
      });
      expect(wrapper.find(".raw-toggle-btn.is-active").exists()).toBe(false);
    });
  });
});
