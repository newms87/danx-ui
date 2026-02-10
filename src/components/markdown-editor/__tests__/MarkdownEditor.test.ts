import { describe, it, expect, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import MarkdownEditor from "../MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountEditor(props: Record<string, unknown> = {}) {
    wrapper = mount(MarkdownEditor, {
      props: {
        modelValue: "",
        ...props,
      },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders the editor container", () => {
      mountEditor();
      expect(wrapper.find(".dx-markdown-editor").exists()).toBe(true);
    });

    it("renders the body container", () => {
      mountEditor();
      expect(wrapper.find(".dx-markdown-editor-body").exists()).toBe(true);
    });

    it("renders the content component", () => {
      mountEditor();
      expect(wrapper.find(".dx-markdown-editor-content").exists()).toBe(true);
    });

    it("renders the footer by default", () => {
      mountEditor();
      expect(wrapper.find(".dx-markdown-editor-footer").exists()).toBe(true);
    });

    it("hides footer when hideFooter is true", () => {
      mountEditor({ hideFooter: true });
      expect(wrapper.find(".dx-markdown-editor-footer").exists()).toBe(false);
    });
  });

  describe("props", () => {
    it("passes placeholder to content", () => {
      mountEditor({ placeholder: "Type something..." });
      expect(wrapper.find("[data-placeholder]").attributes("data-placeholder")).toBe(
        "Type something..."
      );
    });

    it("passes readonly to content", () => {
      mountEditor({ readonly: true });
      expect(wrapper.find(".dx-markdown-editor-content").attributes("contenteditable")).toBe(
        "false"
      );
    });

    it("adds is-readonly class when readonly", () => {
      mountEditor({ readonly: true });
      expect(wrapper.find(".dx-markdown-editor.is-readonly").exists()).toBe(true);
    });

    it("applies theme-light class when theme is light", () => {
      mountEditor({ theme: "light" });
      expect(wrapper.find(".dx-markdown-editor.theme-light").exists()).toBe(true);
    });

    it("does not add theme-light class for dark theme", () => {
      mountEditor({ theme: "dark" });
      expect(wrapper.find(".theme-light").exists()).toBe(false);
    });
  });

  describe("modelValue", () => {
    it("renders initial modelValue content", async () => {
      mountEditor({ modelValue: "Hello **world**" });
      await nextTick();
      await nextTick();
      const content = wrapper.find(".dx-markdown-editor-content");
      expect(content.text()).toContain("Hello");
    });

    it("emits update:modelValue on content change", async () => {
      mountEditor({ modelValue: "Initial" });
      await nextTick();

      // Trigger blur to force sync
      const content = wrapper.find(".dx-markdown-editor-content");
      content.element.innerHTML = "<p>Changed</p>";
      await content.trigger("blur");

      expect(wrapper.emitted("update:modelValue")).toBeDefined();
    });

    it("updates content when modelValue prop changes externally", async () => {
      mountEditor({ modelValue: "First" });
      await nextTick();

      await wrapper.setProps({ modelValue: "Second" });
      await nextTick();
      await nextTick();

      const content = wrapper.find(".dx-markdown-editor-content");
      expect(content.text()).toContain("Second");
    });
  });

  describe("hotkey help popover", () => {
    it("does not show hotkey help initially", () => {
      mountEditor();
      expect(wrapper.find(".dx-hotkey-help-popover").exists()).toBe(false);
    });

    it("shows hotkey help when footer button is clicked", async () => {
      mountEditor();
      await wrapper.find(".hotkey-help-btn").trigger("click");
      expect(wrapper.find(".dx-hotkey-help-popover").exists()).toBe(true);
    });

    it("hides hotkey help when close is emitted", async () => {
      mountEditor();
      await wrapper.find(".hotkey-help-btn").trigger("click");
      expect(wrapper.find(".dx-hotkey-help-popover").exists()).toBe(true);

      await wrapper.find(".danx-dialog__close-x").trigger("click");
      expect(wrapper.find(".dx-hotkey-help-popover").exists()).toBe(false);
    });
  });

  describe("context menu", () => {
    it("does not show context menu initially", () => {
      mountEditor();
      expect(wrapper.find(".dx-context-menu").exists()).toBe(false);
    });

    it("shows context menu on right-click", async () => {
      mountEditor();
      const body = wrapper.find(".dx-markdown-editor-body");
      await body.trigger("contextmenu");
      expect(wrapper.find(".dx-context-menu").exists()).toBe(true);
    });
  });

  describe("popovers", () => {
    it("does not show link popover initially", () => {
      mountEditor();
      expect(wrapper.find(".dx-link-popover-overlay").exists()).toBe(false);
    });

    it("does not show table popover initially", () => {
      mountEditor();
      expect(wrapper.find(".dx-table-popover-overlay").exists()).toBe(false);
    });
  });

  describe("badge slot", () => {
    it("renders badge slot when provided", () => {
      wrapper = mount(MarkdownEditor, {
        props: { modelValue: "" },
        slots: {
          badge: "<span class='test-badge'>Badge</span>",
        },
        attachTo: document.body,
      });
      expect(wrapper.find(".dx-editor-badge").exists()).toBe(true);
      expect(wrapper.find(".test-badge").text()).toBe("Badge");
    });

    it("does not render badge container without slot", () => {
      mountEditor();
      expect(wrapper.find(".dx-editor-badge").exists()).toBe(false);
    });
  });

  describe("char count", () => {
    it("displays char count in footer", async () => {
      mountEditor({ modelValue: "Hello" });
      await nextTick();
      await nextTick();

      const footer = wrapper.find(".char-count");
      // charCount updates after content mount
      expect(footer.exists()).toBe(true);
    });
  });
});
