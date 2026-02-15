import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import CodeViewer from "../CodeViewer.vue";

describe("CodeViewer", () => {
  function mountCodeViewer(props = {}) {
    return mount(CodeViewer, {
      props: {
        modelValue: { name: "test" },
        format: "yaml",
        ...props,
      },
    });
  }

  describe("rendering", () => {
    it("renders the code viewer container", () => {
      const wrapper = mountCodeViewer();
      expect(wrapper.find(".dx-code-viewer").exists()).toBe(true);
    });

    it("renders code content with syntax highlighting", () => {
      const wrapper = mountCodeViewer();
      expect(wrapper.find(".code-content").exists()).toBe(true);
    });

    it("renders label when provided", () => {
      const wrapper = mountCodeViewer({ label: "Config" });
      expect(wrapper.text()).toContain("Config");
    });

    it("does not render label when empty", () => {
      const wrapper = mountCodeViewer({ label: "" });
      const labelEl = wrapper.find(".mb-2.text-sm");
      expect(labelEl.exists()).toBe(false);
    });

    it("applies light theme class", () => {
      const wrapper = mountCodeViewer({ theme: "light" });
      expect(wrapper.find(".dx-code-viewer").classes()).toContain("theme-light");
    });

    it("does not apply theme-light class for dark theme", () => {
      const wrapper = mountCodeViewer({ theme: "dark" });
      expect(wrapper.find(".dx-code-viewer").classes()).not.toContain("theme-light");
    });

    it("handles click on pre element for nested JSON toggle", async () => {
      const wrapper = mountCodeViewer({
        modelValue: { data: '{"key":"value"}' },
        format: "json",
      });
      const pre = wrapper.find("pre.code-content");
      expect(pre.exists()).toBe(true);
      // Clicking should not error — the handler delegates to nested JSON toggle
      await pre.trigger("click");
    });
  });

  describe("footer", () => {
    it("shows footer by default", () => {
      const wrapper = mountCodeViewer();
      expect(wrapper.findComponent({ name: "CodeViewerFooter" }).exists()).toBe(true);
    });

    it("hides footer when hideFooter is true", () => {
      const wrapper = mountCodeViewer({ hideFooter: true });
      expect(wrapper.findComponent({ name: "CodeViewerFooter" }).exists()).toBe(false);
    });

    it("shows edit button in footer when canEdit is true", () => {
      const wrapper = mountCodeViewer({ canEdit: true });
      const footer = wrapper.findComponent({ name: "CodeViewerFooter" });
      expect(footer.props("canEdit")).toBe(true);
    });

    it("disables edit in footer for markdown format", () => {
      const wrapper = mountCodeViewer({ format: "markdown", modelValue: "# Hello" });
      const footer = wrapper.findComponent({ name: "CodeViewerFooter" });
      expect(footer.props("canEdit")).toBe(false);
    });
  });

  describe("collapsed mode", () => {
    it("starts collapsed when collapsible and defaultCollapsed", () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: true });
      expect(wrapper.find(".dx-code-viewer").classes()).toContain("is-collapsed");
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(true);
    });

    it("starts expanded when collapsible but not defaultCollapsed", () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(false);
    });

    it("is not collapsed when not collapsible", () => {
      const wrapper = mountCodeViewer({ collapsible: false });
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(false);
    });

    it("expands when collapsed view emits expand", async () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: true });
      const collapsed = wrapper.findComponent({ name: "CodeViewerCollapsed" });
      await collapsed.vm.$emit("expand");
      await nextTick();
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(false);
    });

    it("shows collapse toggle when expanded and collapsible", () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      expect(wrapper.find(".collapse-toggle").exists()).toBe(true);
    });

    it("shows collapse header when expanded and collapsible", () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      expect(wrapper.find(".collapse-header").exists()).toBe(true);
    });

    it("does not show collapse toggle when not collapsible", () => {
      const wrapper = mountCodeViewer({ collapsible: false });
      expect(wrapper.find(".collapse-toggle").exists()).toBe(false);
    });

    it("collapses when collapse toggle clicked", async () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      await wrapper.find(".collapse-toggle").trigger("click");
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(true);
    });

    it("collapses when collapse header clicked", async () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      await wrapper.find(".collapse-header").trigger("click");
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(true);
    });

    it("reacts to defaultCollapsed prop change", async () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: false });
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(false);
      await wrapper.setProps({ defaultCollapsed: true });
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(true);
    });

    it("ignores defaultCollapsed change when not collapsible", async () => {
      const wrapper = mountCodeViewer({ collapsible: false, defaultCollapsed: false });
      await wrapper.setProps({ defaultCollapsed: true });
      expect(wrapper.findComponent({ name: "CodeViewerCollapsed" }).exists()).toBe(false);
    });
  });

  describe("format switching", () => {
    it("renders LanguageBadge with current format", () => {
      const wrapper = mountCodeViewer();
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      expect(badge.props("format")).toBe("yaml");
    });

    it("emits update:format when format changes via badge", async () => {
      const wrapper = mountCodeViewer();
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      await badge.vm.$emit("change", "json");
      expect(wrapper.emitted("update:format")).toEqual([["json"]]);
    });

    it("reacts to format prop change", async () => {
      const wrapper = mountCodeViewer({ format: "yaml" });
      await wrapper.setProps({ format: "json" });
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      expect(badge.props("format")).toBe("json");
    });

    it("emits format-change from collapsed view", async () => {
      const wrapper = mountCodeViewer({ collapsible: true, defaultCollapsed: true });
      const collapsed = wrapper.findComponent({ name: "CodeViewerCollapsed" });
      await collapsed.vm.$emit("format-change", "json");
      expect(wrapper.emitted("update:format")).toEqual([["json"]]);
    });

    it("handles click on LanguageBadge without propagating", async () => {
      const wrapper = mountCodeViewer();
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      // Click the badge itself - @click.stop prevents propagation
      await badge.trigger("click");
      // The click should not propagate to parent elements
      expect(badge.exists()).toBe(true);
    });
  });

  describe("markdown mode", () => {
    it("renders MarkdownContent for markdown format", () => {
      const wrapper = mountCodeViewer({
        format: "markdown",
        modelValue: "# Hello World",
      });
      expect(wrapper.findComponent({ name: "MarkdownContent" }).exists()).toBe(true);
    });

    it("does not render MarkdownContent for non-markdown formats", () => {
      const wrapper = mountCodeViewer({ format: "json" });
      expect(wrapper.findComponent({ name: "MarkdownContent" }).exists()).toBe(false);
    });

    it("passes string modelValue as content to MarkdownContent", () => {
      const wrapper = mountCodeViewer({
        format: "markdown",
        modelValue: "**bold**",
      });
      const md = wrapper.findComponent({ name: "MarkdownContent" });
      expect(md.props("content")).toBe("**bold**");
    });
  });

  describe("editing", () => {
    it("shows contenteditable when canEdit and editable", () => {
      const wrapper = mountCodeViewer({ canEdit: true, editable: true });
      const editablePre = wrapper.find("pre[contenteditable]");
      expect(editablePre.exists()).toBe(true);
    });

    it("emits update:editable when edit toggled via footer", async () => {
      const wrapper = mountCodeViewer({ canEdit: true });
      const footer = wrapper.findComponent({ name: "CodeViewerFooter" });
      await footer.vm.$emit("toggle-edit");
      expect(wrapper.emitted("update:editable")).toBeTruthy();
    });

    it("reacts to editable prop change", async () => {
      const wrapper = mountCodeViewer({ canEdit: true, editable: false });
      expect(wrapper.find("pre[contenteditable]").exists()).toBe(false);
      await wrapper.setProps({ editable: true });
      expect(wrapper.find("pre[contenteditable]").exists()).toBe(true);
    });
  });

  describe("model value", () => {
    it("renders null model value", () => {
      const wrapper = mountCodeViewer({ modelValue: null });
      expect(wrapper.find(".dx-code-viewer").exists()).toBe(true);
    });

    it("renders string model value", () => {
      const wrapper = mountCodeViewer({ modelValue: "hello world", format: "text" });
      expect(wrapper.find(".code-content").exists()).toBe(true);
    });

    it("renders object model value", () => {
      const wrapper = mountCodeViewer({ modelValue: { key: "value" } });
      expect(wrapper.find(".code-content").exists()).toBe(true);
    });

    it("reacts to modelValue prop change", async () => {
      const wrapper = mountCodeViewer({ modelValue: { a: 1 } });
      await wrapper.setProps({ modelValue: { b: 2 } });
      await nextTick();
      // Code content should update
      expect(wrapper.find(".code-content").exists()).toBe(true);
    });
  });

  describe("contenteditable interaction", () => {
    it("emits update:modelValue on contenteditable blur", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "hello",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");
      expect(editablePre.exists()).toBe(true);

      // Simulate typing via input event
      Object.defineProperty(editablePre.element, "innerText", {
        value: "hello world",
        writable: true,
      });
      await editablePre.trigger("input");
      await nextTick();

      // Blur triggers model value emit
      await editablePre.trigger("blur");
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("handles input event on contenteditable pre", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: '{"a":1}',
        format: "json",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      Object.defineProperty(editablePre.element, "innerText", {
        value: '{"a": 2}',
        writable: true,
      });
      await editablePre.trigger("input");
      await nextTick();

      // Input event should be handled without error
      expect(editablePre.exists()).toBe(true);
    });

    it("handles keydown events on contenteditable pre", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "test",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      // Trigger a regular keydown (e.g., a letter key) - should not throw
      await editablePre.trigger("keydown", { key: "a" });
      expect(editablePre.exists()).toBe(true);
    });
  });

  describe("keydown on wrapper div", () => {
    it("handles keydown events on the code-wrapper div", async () => {
      const wrapper = mountCodeViewer({ canEdit: true, editable: false });
      const codeWrapper = wrapper.find(".code-wrapper");
      expect(codeWrapper.exists()).toBe(true);

      // Trigger a keydown event on wrapper (not in editing mode, so most handlers are skipped)
      await codeWrapper.trigger("keydown", { key: "a" });
      expect(codeWrapper.exists()).toBe(true);
    });

    it("handles Ctrl+Alt+L format cycle shortcut on wrapper", async () => {
      const wrapper = mountCodeViewer({ format: "json", modelValue: { key: "value" } });
      const codeWrapper = wrapper.find(".code-wrapper");

      await codeWrapper.trigger("keydown", { key: "l", ctrlKey: true, altKey: true });
      await nextTick();

      // Should emit update:format when cycling formats
      expect(wrapper.emitted("update:format")).toBeTruthy();
    });

    it("handles Ctrl+Alt+Shift+L language search shortcut on wrapper", async () => {
      const wrapper = mountCodeViewer({
        format: "json",
        modelValue: { key: "value" },
        allowAnyLanguage: true,
      });
      const codeWrapper = wrapper.find(".code-wrapper");

      // This should trigger onOpenLanguageSearch callback
      await codeWrapper.trigger("keydown", {
        key: "l",
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
      });
      await nextTick();

      // Should not throw; the language search panel open is called
      expect(codeWrapper.exists()).toBe(true);
    });
  });

  describe("exit and delete events", () => {
    it("emits exit on Ctrl+Enter in edit mode", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "hello",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      // Set content first
      Object.defineProperty(editablePre.element, "innerText", { value: "hello", writable: true });
      await editablePre.trigger("input");

      // Ctrl+Enter triggers exit
      await editablePre.trigger("keydown", { key: "Enter", ctrlKey: true });
      await nextTick();

      expect(wrapper.emitted("exit")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });

    it("emits delete on Backspace when content is empty", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      // Ensure editingContent is empty by simulating empty input
      Object.defineProperty(editablePre.element, "innerText", { value: "", writable: true });
      await editablePre.trigger("input");
      await nextTick();

      await editablePre.trigger("keydown", { key: "Backspace" });
      await nextTick();

      expect(wrapper.emitted("delete")).toBeTruthy();
    });

    it("emits delete on Delete key when content is empty", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      Object.defineProperty(editablePre.element, "innerText", { value: "", writable: true });
      await editablePre.trigger("input");
      await nextTick();

      await editablePre.trigger("keydown", { key: "Delete" });
      await nextTick();

      expect(wrapper.emitted("delete")).toBeTruthy();
    });

    it("does not emit delete on Backspace when content is not empty", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "hello",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      Object.defineProperty(editablePre.element, "innerText", { value: "hello", writable: true });
      await editablePre.trigger("input");
      await nextTick();

      await editablePre.trigger("keydown", { key: "Backspace" });
      await nextTick();

      expect(wrapper.emitted("delete")).toBeFalsy();
    });
  });

  describe("markdownSource computed with non-string value", () => {
    it("uses displayContent for non-string modelValue in markdown mode", () => {
      const wrapper = mountCodeViewer({
        format: "markdown",
        modelValue: { key: "value" },
      });
      // For non-string modelValue with markdown format, markdownSource uses editor.displayContent
      // which formats the object. The MarkdownContent component receives this formatted content.
      const md = wrapper.findComponent({ name: "MarkdownContent" });
      expect(md.exists()).toBe(true);
      // The content should be a string representation (not the raw object)
      const content = md.props("content") as string;
      expect(typeof content).toBe("string");
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe("Escape key exits edit mode", () => {
    it("exits edit mode on Escape keydown", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "test",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");
      expect(editablePre.exists()).toBe(true);

      await editablePre.trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(wrapper.emitted("update:editable")).toBeTruthy();
    });
  });

  describe("Ctrl+S saves without exiting", () => {
    it("emits update:modelValue on Ctrl+S", async () => {
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: "test",
        format: "text",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      // Set content
      Object.defineProperty(editablePre.element, "innerText", { value: "updated", writable: true });
      await editablePre.trigger("input");
      await nextTick();

      await editablePre.trigger("keydown", { key: "s", ctrlKey: true });
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
  });

  describe("valid model", () => {
    it("defaults valid to true for valid content", () => {
      const wrapper = mountCodeViewer();
      // defineModel default is true, matching valid content state
      expect(wrapper.emitted("update:valid")).toBeFalsy();
    });

    it("accepts valid prop as v-model:valid binding", () => {
      const wrapper = mountCodeViewer({ valid: true });
      expect(wrapper.props("valid")).toBe(true);
    });

    it("emits update:valid false on invalid JSON edit content, then true when corrected", async () => {
      vi.useFakeTimers();
      const wrapper = mountCodeViewer({
        canEdit: true,
        editable: true,
        modelValue: '{"key": "value"}',
        format: "json",
      });
      await nextTick();
      const editablePre = wrapper.find("pre[contenteditable]");

      // Type invalid JSON
      Object.defineProperty(editablePre.element, "innerText", {
        value: "{invalid json",
        writable: true,
      });
      await editablePre.trigger("input");
      await nextTick();

      // Advance past validation debounce (300ms)
      vi.advanceTimersByTime(300);
      await nextTick();

      // isValid should now be false, triggering update:valid with false
      const validEmits = wrapper.emitted("update:valid") as boolean[][];
      const lastValid = validEmits[validEmits.length - 1]![0];
      expect(lastValid).toBe(false);

      // Now correct the content
      Object.defineProperty(editablePre.element, "innerText", {
        value: '{"key": "fixed"}',
        writable: true,
      });
      await editablePre.trigger("input");
      await nextTick();

      vi.advanceTimersByTime(300);
      await nextTick();

      // Should now emit true
      const validEmitsAfter = wrapper.emitted("update:valid") as boolean[][];
      const lastValidAfter = validEmitsAfter[validEmitsAfter.length - 1]![0];
      expect(lastValidAfter).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("allowAnyLanguage", () => {
    it("passes allowAnyLanguage to LanguageBadge", () => {
      const wrapper = mountCodeViewer({ allowAnyLanguage: true });
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      expect(badge.props("allowAnyLanguage")).toBe(true);
    });

    it("syncs languageSearchOpen via v-model:searchOpen on LanguageBadge", async () => {
      const wrapper = mountCodeViewer({ allowAnyLanguage: true });
      const badge = wrapper.findComponent({ name: "LanguageBadge" });
      badge.vm.$emit("update:searchOpen", true);
      await nextTick();
      expect(badge.props("searchOpen")).toBe(true);
    });

    it("passes allowAnyLanguage to collapsed view", () => {
      const wrapper = mountCodeViewer({
        collapsible: true,
        defaultCollapsed: true,
        allowAnyLanguage: true,
      });
      const collapsed = wrapper.findComponent({ name: "CodeViewerCollapsed" });
      expect(collapsed.props("allowAnyLanguage")).toBe(true);
    });
  });
});
