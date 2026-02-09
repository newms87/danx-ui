import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import MarkdownEditorContent from "../MarkdownEditorContent.vue";

describe("MarkdownEditorContent", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountContent(props: Record<string, unknown> = {}) {
    wrapper = mount(MarkdownEditorContent, {
      props: {
        html: "<p>Hello</p>",
        ...props,
      },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders the content container", () => {
      mountContent();
      expect(wrapper.find(".dx-markdown-editor-content").exists()).toBe(true);
    });

    it("renders html content", () => {
      mountContent({ html: "<p>Test content</p>" });
      expect(wrapper.find("p").text()).toBe("Test content");
    });

    it("is contenteditable by default", () => {
      mountContent();
      expect(wrapper.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe(
        "true"
      );
    });

    it("is not contenteditable when readonly", () => {
      mountContent({ readonly: true });
      expect(wrapper.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe(
        "false"
      );
    });

    it("has is-readonly class when readonly", () => {
      mountContent({ readonly: true });
      expect(wrapper.find(".is-readonly").exists()).toBe(true);
    });

    it("sets data-placeholder attribute", () => {
      mountContent({ placeholder: "Type here..." });
      expect(wrapper.find(".dx-markdown-editor-content").attributes("data-placeholder")).toBe(
        "Type here..."
      );
    });

    it("uses default placeholder", () => {
      mountContent();
      expect(wrapper.find(".dx-markdown-editor-content").attributes("data-placeholder")).toBe(
        "Start typing..."
      );
    });
  });

  describe("empty state", () => {
    it("has is-empty class when content is empty", async () => {
      mountContent({ html: "" });
      await nextTick();
      expect(wrapper.find(".is-empty").exists()).toBe(true);
    });

    it("does not have is-empty class when content has text", async () => {
      mountContent({ html: "<p>Some text</p>" });
      await nextTick();
      expect(wrapper.find(".is-empty").exists()).toBe(false);
    });

    it("updates is-empty when html prop changes to empty", async () => {
      mountContent({ html: "<p>Text</p>" });
      await nextTick();
      expect(wrapper.find(".is-empty").exists()).toBe(false);

      await wrapper.setProps({ html: "" });
      await nextTick();
      await nextTick();
      expect(wrapper.find(".is-empty").exists()).toBe(true);
    });
  });

  describe("events", () => {
    it("emits input on content change", async () => {
      mountContent();
      await wrapper.find(".dx-markdown-editor-content").trigger("input");
      expect(wrapper.emitted("input")).toHaveLength(1);
    });

    it("emits keydown on key press", async () => {
      mountContent();
      await wrapper.find(".dx-markdown-editor-content").trigger("keydown", { key: "a" });
      expect(wrapper.emitted("keydown")).toHaveLength(1);
    });

    it("emits blur on blur", async () => {
      mountContent();
      await wrapper.find(".dx-markdown-editor-content").trigger("blur");
      expect(wrapper.emitted("blur")).toHaveLength(1);
    });
  });

  describe("Ctrl+Click link handling", () => {
    it("opens link on Ctrl+Click", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      mountContent({ html: '<p><a href="https://example.com">Link</a></p>' });

      const link = wrapper.find("a");
      await link.trigger("click", { ctrlKey: true });

      expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
      openSpy.mockRestore();
    });

    it("does not open link without modifier key", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      mountContent({ html: '<p><a href="https://example.com">Link</a></p>' });

      const link = wrapper.find("a");
      await link.trigger("click");

      expect(openSpy).not.toHaveBeenCalled();
      openSpy.mockRestore();
    });

    it("opens link on Meta+Click (Mac)", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      mountContent({ html: '<p><a href="https://example.com">Link</a></p>' });

      const link = wrapper.find("a");
      await link.trigger("click", { metaKey: true });

      expect(openSpy).toHaveBeenCalled();
      openSpy.mockRestore();
    });

    it("does nothing when clicking non-link with Ctrl", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      mountContent({ html: "<p>Plain text</p>" });

      await wrapper.find("p").trigger("click", { ctrlKey: true });
      expect(openSpy).not.toHaveBeenCalled();
      openSpy.mockRestore();
    });

    it("does nothing when link has no href", async () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      mountContent({ html: "<p><a>No href link</a></p>" });

      const link = wrapper.find("a");
      await link.trigger("click", { ctrlKey: true });

      expect(openSpy).not.toHaveBeenCalled();
      openSpy.mockRestore();
    });
  });

  describe("container-mounted emit", () => {
    it("emits container-mounted with HTMLElement on mount", () => {
      mountContent();
      const emitted = wrapper.emitted("container-mounted");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toBeInstanceOf(HTMLElement);
    });
  });
});
