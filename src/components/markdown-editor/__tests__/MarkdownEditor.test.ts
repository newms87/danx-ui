import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { readFileSync } from "fs";
import { resolve } from "path";
import MarkdownEditor from "../MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  let wrapper: VueWrapper;

  // DanxDialog uses <dialog> element which requires showModal/close mocks
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  afterEach(() => {
    wrapper?.unmount();
    // Clean up teleported content (DanxDialog teleports to body)
    document.body.querySelectorAll(".danx-dialog").forEach((el) => el.remove());
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

    it("applies theme-light class when added by consumer", () => {
      wrapper = mount(MarkdownEditor, {
        props: { modelValue: "" },
        attrs: { class: "theme-light" },
        attachTo: document.body,
      });
      expect(wrapper.find(".dx-markdown-editor.theme-light").exists()).toBe(true);
    });

    it("does not have theme-light class by default", () => {
      mountEditor();
      expect(wrapper.find(".theme-light").exists()).toBe(false);
    });

    it("accepts debounceMs prop without error", () => {
      mountEditor({ debounceMs: 100 });
      expect(wrapper.find(".dx-markdown-editor").exists()).toBe(true);
    });

    it("uses --dx-mde-color token for .dx-markdown-content text color (not inherit)", () => {
      const cssPath = resolve(__dirname, "../markdown-editor.css");
      const css = readFileSync(cssPath, "utf-8");

      // The .dx-markdown-content block must use the theme token, not inherit
      const markdownContentMatch = css.match(/\.dx-markdown-content\s*\{[^}]*color:\s*([^;]+);/);
      expect(markdownContentMatch).not.toBeNull();
      expect(markdownContentMatch![1]!.trim()).toBe("var(--dx-mde-color)");
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
    // HotkeyHelpPopover uses DanxDialog which teleports to document.body.
    // The class="dx-hotkey-help-popover" on HotkeyHelpPopover's <DanxDialog> is
    // not inherited (Teleport root drops attrs), so we query for the
    // HotkeyHelpPopover Vue component instance instead.
    function findHotkeyPopover() {
      return wrapper.findComponent({ name: "HotkeyHelpPopover" });
    }

    it("does not show hotkey help initially", () => {
      mountEditor();
      expect(findHotkeyPopover().exists()).toBe(false);
    });

    it("shows hotkey help when footer button is clicked", async () => {
      mountEditor();
      await wrapper.find(".hotkey-help-btn").trigger("click");
      await nextTick();
      expect(findHotkeyPopover().exists()).toBe(true);
    });

    it("hides hotkey help when close is emitted", async () => {
      mountEditor();
      await wrapper.find(".hotkey-help-btn").trigger("click");
      await nextTick();
      expect(findHotkeyPopover().exists()).toBe(true);

      findHotkeyPopover().vm.$emit("close");
      await nextTick();
      expect(findHotkeyPopover().exists()).toBe(false);
    });
  });

  describe("context menu", () => {
    it("does not show context menu initially", () => {
      mountEditor();
      expect(wrapper.find(".danx-context-menu").exists()).toBe(false);
    });

    it("shows context menu on right-click", async () => {
      mountEditor();
      const body = wrapper.find(".dx-markdown-editor-body");
      await body.trigger("contextmenu");
      expect(wrapper.find(".danx-context-menu").exists()).toBe(true);
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

  describe("footer slot", () => {
    it("renders footer slot content between char count and hotkey button", () => {
      wrapper = mount(MarkdownEditor, {
        props: { modelValue: "" },
        slots: {
          footer: "<span class='test-footer-content'>Save status</span>",
        },
        attachTo: document.body,
      });
      const footer = wrapper.find(".dx-markdown-editor-footer");
      expect(footer.exists()).toBe(true);
      expect(footer.find(".test-footer-content").text()).toBe("Save status");
    });
  });

  describe("raw mode", () => {
    it("renders the raw toggle button in the footer", () => {
      mountEditor();
      expect(wrapper.find(".raw-toggle-btn").exists()).toBe(true);
    });

    it("does not show raw mode by default", () => {
      mountEditor();
      expect(wrapper.find(".dx-markdown-editor-raw").exists()).toBe(false);
      expect(wrapper.find(".dx-markdown-editor-content").exists()).toBe(true);
    });

    it("shows raw markdown source when raw toggle is clicked", async () => {
      mountEditor({ modelValue: "# Hello **world**" });
      await nextTick();

      await wrapper.find(".raw-toggle-btn").trigger("click");
      await nextTick();

      expect(wrapper.find(".dx-markdown-editor-raw").exists()).toBe(true);
      expect(wrapper.find(".dx-markdown-editor-content").exists()).toBe(false);
      expect(wrapper.find(".dx-markdown-editor-raw").text()).toBe("# Hello **world**");
    });

    it("switches back to rendered mode when toggled again", async () => {
      mountEditor({ modelValue: "# Hello" });
      await nextTick();

      // Toggle on
      await wrapper.find(".raw-toggle-btn").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-markdown-editor-raw").exists()).toBe(true);

      // Toggle off
      await wrapper.find(".raw-toggle-btn").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-markdown-editor-raw").exists()).toBe(false);
      expect(wrapper.find(".dx-markdown-editor-content").exists()).toBe(true);
    });

    it("updates raw content when modelValue changes externally", async () => {
      mountEditor({ modelValue: "First" });
      await nextTick();

      await wrapper.find(".raw-toggle-btn").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-markdown-editor-raw").text()).toBe("First");

      await wrapper.setProps({ modelValue: "Second" });
      await nextTick();
      expect(wrapper.find(".dx-markdown-editor-raw").text()).toBe("Second");
    });

    it("shows active state on raw toggle button when active", async () => {
      mountEditor();

      expect(wrapper.find(".raw-toggle-btn.is-active").exists()).toBe(false);

      await wrapper.find(".raw-toggle-btn").trigger("click");
      await nextTick();

      expect(wrapper.find(".raw-toggle-btn.is-active").exists()).toBe(true);
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

    it("initializes char count from modelValue on mount", async () => {
      mountEditor({ modelValue: "Hello world" });
      await nextTick();
      await nextTick();

      const footer = wrapper.find(".char-count");
      expect(footer.text()).toContain("11");
    });
  });
});
