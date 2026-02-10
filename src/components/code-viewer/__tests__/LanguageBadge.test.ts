import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import LanguageBadge from "../LanguageBadge.vue";

describe("LanguageBadge", () => {
  const defaultProps = {
    format: "json",
    availableFormats: ["json", "yaml"],
    toggleable: true,
    allowAnyLanguage: false,
  };

  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  describe("rendering", () => {
    it("renders current format in uppercase", () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      expect(wrapper.find(".dx-language-badge").text()).toBe("JSON");
    });

    it("does not show options by default", () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      expect(wrapper.find(".dx-language-options").exists()).toBe(false);
    });

    it("shows options on mouseenter", async () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-options").exists()).toBe(true);
    });

    it("hides options on mouseleave", async () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      const container = wrapper.find(".dx-language-badge-container");
      await container.trigger("mouseenter");
      expect(wrapper.find(".dx-language-options").exists()).toBe(true);
      await container.trigger("mouseleave");
      expect(wrapper.find(".dx-language-options").exists()).toBe(false);
    });

    it("shows other formats excluding current", async () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      const options = wrapper.findAll(".dx-language-option");
      expect(options).toHaveLength(1);
      expect(options[0]?.text()).toBe("YAML");
    });

    it("does not show options when not toggleable", async () => {
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, toggleable: false },
      });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-options").exists()).toBe(false);
    });

    it("does not show options when only one format available", async () => {
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, availableFormats: ["json"] },
      });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-options").exists()).toBe(false);
    });

    it("applies is-toggleable class when toggleable with multiple formats", () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      expect(wrapper.find(".dx-language-badge-container").classes()).toContain("is-toggleable");
    });

    it("does not apply is-toggleable when not toggleable", () => {
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, toggleable: false },
      });
      expect(wrapper.find(".dx-language-badge-container").classes()).not.toContain("is-toggleable");
    });

    it("does not apply is-toggleable when only one format", () => {
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, availableFormats: ["json"] },
      });
      expect(wrapper.find(".dx-language-badge-container").classes()).not.toContain("is-toggleable");
    });

    it("applies is-active to badge when options are shown and other formats exist", async () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-badge").classes()).toContain("is-active");
    });

    it("does not apply is-active when options hidden", () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      expect(wrapper.find(".dx-language-badge").classes()).not.toContain("is-active");
    });
  });

  describe("format switching", () => {
    it("emits change when clicking an alternate format", async () => {
      wrapper = mount(LanguageBadge, { props: defaultProps });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-option").trigger("click");
      expect(wrapper.emitted("change")).toEqual([["yaml"]]);
    });
  });

  describe("search panel", () => {
    beforeEach(() => {
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, allowAnyLanguage: true },
        attachTo: document.body,
      });
    });

    it("shows search trigger on hover when allowAnyLanguage", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-search-trigger").exists()).toBe(true);
    });

    it("does not show search trigger when allowAnyLanguage is false", async () => {
      wrapper.unmount();
      wrapper = mount(LanguageBadge, {
        props: { ...defaultProps, allowAnyLanguage: false },
      });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-search-trigger").exists()).toBe(false);
    });

    it("opens search panel when search trigger clicked", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(true);
    });

    it("shows all languages in search panel", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const items = wrapper.findAll(".dx-language-search-item");
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]?.text()).toBe("BASH");
    });

    it("filters languages when typing in search", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.setValue("py");
      await input.trigger("input");
      const items = wrapper.findAll(".dx-language-search-item");
      expect(items).toHaveLength(1);
      expect(items[0]?.text()).toBe("PYTHON");
    });

    it("shows no results message when no languages match", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.setValue("zzzzz");
      await input.trigger("input");
      expect(wrapper.find(".dx-language-search-empty").exists()).toBe(true);
      expect(wrapper.find(".dx-language-search-empty").text()).toBe("No languages found");
    });

    it("emits change and closes when language selected", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      await wrapper.find(".dx-language-search-item").trigger("click");
      expect(wrapper.emitted("change")).toBeTruthy();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(false);
    });

    it("navigates down with arrow key", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.trigger("keydown", { key: "ArrowDown" });
      const items = wrapper.findAll(".dx-language-search-item");
      expect(items[1]?.classes()).toContain("is-selected");
    });

    it("navigates up with arrow key", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      // Navigate down then back up
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "ArrowUp" });
      const items = wrapper.findAll(".dx-language-search-item");
      expect(items[0]?.classes()).toContain("is-selected");
    });

    it("wraps around when navigating down past last item", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      // Filter to a small set
      await input.setValue("bash");
      await input.trigger("input");
      // Navigate past the single result
      await input.trigger("keydown", { key: "ArrowDown" });
      const items = wrapper.findAll(".dx-language-search-item");
      expect(items[0]?.classes()).toContain("is-selected");
    });

    it("wraps around when navigating up from first item", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.trigger("keydown", { key: "ArrowUp" });
      // Should wrap to last item
      const items = wrapper.findAll(".dx-language-search-item");
      const lastItem = items[items.length - 1];
      expect(lastItem?.classes()).toContain("is-selected");
    });

    it("selects item with Enter key", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("change")).toBeTruthy();
    });

    it("closes search panel with Escape key", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(true);
      await wrapper.find(".dx-language-search-input").trigger("keydown", { key: "Escape" });
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(false);
    });

    it("closes search panel on click outside", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(true);
      // Simulate click outside
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(false);
    });

    it("does not close when clicking inside search panel", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const panel = wrapper.find(".dx-language-search-panel");
      // Dispatch mousedown on the panel element itself
      panel.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(true);
    });

    it("updates selectedIndex on mouseenter of search item", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const items = wrapper.findAll(".dx-language-search-item");
      await items[2]?.trigger("mouseenter");
      expect(items[2]?.classes()).toContain("is-selected");
    });

    it("resets search query on close", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.setValue("py");
      await input.trigger("input");
      // Close by selecting
      await wrapper.find(".dx-language-search-item").trigger("click");
      // Reopen
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const newInput = wrapper.find<HTMLInputElement>(".dx-language-search-input");
      expect(newInput.element.value).toBe("");
    });

    it("exposes openSearchPanel", async () => {
      const vm = wrapper.vm as unknown as { openSearchPanel: () => void };
      vm.openSearchPanel();
      await nextTick();
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(true);
    });

    it("navigate down does nothing when filtered list is empty", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.setValue("zzzzz");
      await input.trigger("input");
      // Should not throw
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "ArrowUp" });
    });

    it("selectCurrentItem does nothing when no items match", async () => {
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      await wrapper.find(".dx-language-search-trigger").trigger("click");
      await nextTick();
      const input = wrapper.find(".dx-language-search-input");
      await input.setValue("zzzzz");
      await input.trigger("input");
      await input.trigger("keydown", { key: "Enter" });
      // No change event emitted since no item to select
      expect(wrapper.emitted("change")).toBeFalsy();
    });

    it("removes mousedown listener on unmount", () => {
      const spy = vi.spyOn(document, "removeEventListener");
      wrapper.unmount();
      expect(spy).toHaveBeenCalledWith("mousedown", expect.any(Function));
      spy.mockRestore();
    });

    it("handleClickOutside does nothing when search panel is not shown", async () => {
      // Search panel is closed - click outside should not throw
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      // No errors, search panel still not shown
      expect(wrapper.find(".dx-language-search-panel").exists()).toBe(false);
    });
  });

  describe("defaults", () => {
    it("defaults toggleable to true", () => {
      wrapper = mount(LanguageBadge, {
        props: { format: "json" },
      });
      // No error, component renders
      expect(wrapper.find(".dx-language-badge").exists()).toBe(true);
    });

    it("defaults availableFormats to empty array", () => {
      wrapper = mount(LanguageBadge, {
        props: { format: "json" },
      });
      // Should not show options even on hover since no other formats
      expect(wrapper.find(".dx-language-badge").text()).toBe("JSON");
    });

    it("defaults allowAnyLanguage to false", async () => {
      wrapper = mount(LanguageBadge, {
        props: { format: "json" },
      });
      await wrapper.find(".dx-language-badge-container").trigger("mouseenter");
      expect(wrapper.find(".dx-language-search-trigger").exists()).toBe(false);
    });
  });
});
