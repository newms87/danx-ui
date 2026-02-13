import { describe, it, expect, vi, afterEach } from "vitest";
import { nextTick, ref } from "vue";
import { ALL_LANGUAGES, useLanguageSearch } from "../useLanguageSearch";
import type { UseLanguageSearchOptions } from "../useLanguageSearch";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

/** Mount a wrapper component so lifecycle hooks (onMounted/onBeforeUnmount) fire. */
function mountWithSearch(overrides: Partial<UseLanguageSearchOptions> = {}) {
  const onSelect = vi.fn();
  const showSearchPanel = ref(false);
  const searchInputRef = ref<HTMLInputElement | null>(null);
  const searchListRef = ref<HTMLElement | null>(null);
  const searchPanelRef = ref<HTMLElement | null>(null);

  const opts: UseLanguageSearchOptions = {
    showSearchPanel,
    searchInputRef,
    searchListRef,
    searchPanelRef,
    onSelect,
    ...overrides,
  };

  let result!: ReturnType<typeof useLanguageSearch>;

  const wrapper = mount(
    defineComponent({
      setup() {
        result = useLanguageSearch(opts);
        return {};
      },
      render() {
        return null;
      },
    }),
    { attachTo: document.body }
  );

  return {
    wrapper,
    result,
    onSelect,
    showSearchPanel,
    searchInputRef,
    searchListRef,
    searchPanelRef,
  };
}

describe("useLanguageSearch", () => {
  let cleanup: (() => void) | null = null;

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  describe("ALL_LANGUAGES", () => {
    it("is a sorted array of language strings", () => {
      expect(ALL_LANGUAGES.length).toBeGreaterThan(0);
      const sorted = [...ALL_LANGUAGES].sort();
      expect(ALL_LANGUAGES).toEqual(sorted);
    });
  });

  describe("filteredLanguages", () => {
    it("returns all languages when searchQuery is empty", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      expect(result.filteredLanguages.value).toEqual(ALL_LANGUAGES);
    });

    it("filters languages by query", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "py";
      expect(result.filteredLanguages.value).toEqual(["python"]);
    });

    it("is case-insensitive", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "JSON";
      expect(result.filteredLanguages.value).toEqual(["json"]);
    });

    it("returns empty array when nothing matches", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "zzzzz";
      expect(result.filteredLanguages.value).toEqual([]);
    });
  });

  describe("onSearchQueryChange", () => {
    it("resets selectedIndex to 0", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.selectedIndex.value = 5;
      result.onSearchQueryChange();
      expect(result.selectedIndex.value).toBe(0);
    });
  });

  describe("navigateDown", () => {
    it("increments selectedIndex", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      expect(result.selectedIndex.value).toBe(0);
      result.navigateDown();
      expect(result.selectedIndex.value).toBe(1);
    });

    it("wraps around to 0 at the end of the list", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "bash";
      expect(result.filteredLanguages.value).toHaveLength(1);
      result.navigateDown();
      expect(result.selectedIndex.value).toBe(0);
    });

    it("does nothing when filtered list is empty", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "zzzzz";
      result.navigateDown();
      expect(result.selectedIndex.value).toBe(0);
    });
  });

  describe("navigateUp", () => {
    it("decrements selectedIndex", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.selectedIndex.value = 2;
      result.navigateUp();
      expect(result.selectedIndex.value).toBe(1);
    });

    it("wraps to last item when at 0", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.navigateUp();
      expect(result.selectedIndex.value).toBe(ALL_LANGUAGES.length - 1);
    });

    it("does nothing when filtered list is empty", () => {
      const { wrapper, result } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "zzzzz";
      result.navigateUp();
      expect(result.selectedIndex.value).toBe(0);
    });
  });

  describe("selectCurrentItem", () => {
    it("calls onSelect with the selected language", () => {
      const { wrapper, result, onSelect } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.selectedIndex.value = 0;
      result.selectCurrentItem();
      expect(onSelect).toHaveBeenCalledWith(ALL_LANGUAGES[0]);
    });

    it("does nothing when filtered list is empty", () => {
      const { wrapper, result, onSelect } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "zzzzz";
      result.selectCurrentItem();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("closes the search panel after selecting", () => {
      const { wrapper, result, showSearchPanel } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      showSearchPanel.value = true;
      result.selectCurrentItem();
      expect(showSearchPanel.value).toBe(false);
    });
  });

  describe("openSearchPanel / closeSearchPanel", () => {
    it("openSearchPanel sets showSearchPanel to true", () => {
      const { wrapper, result, showSearchPanel } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.openSearchPanel();
      expect(showSearchPanel.value).toBe(true);
    });

    it("closeSearchPanel sets showSearchPanel to false and clears query", () => {
      const { wrapper, result, showSearchPanel } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      showSearchPanel.value = true;
      result.searchQuery.value = "test";
      result.closeSearchPanel();
      expect(showSearchPanel.value).toBe(false);
      expect(result.searchQuery.value).toBe("");
    });
  });

  describe("watch showSearchPanel", () => {
    it("resets query and selectedIndex when panel opens", async () => {
      const { wrapper, result, showSearchPanel } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      result.searchQuery.value = "old";
      result.selectedIndex.value = 5;
      showSearchPanel.value = true;
      await nextTick();
      expect(result.searchQuery.value).toBe("");
      expect(result.selectedIndex.value).toBe(0);
    });

    it("focuses search input when panel opens", async () => {
      const { wrapper, showSearchPanel, searchInputRef } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      const input = document.createElement("input");
      document.body.appendChild(input);
      searchInputRef.value = input;
      const focusSpy = vi.spyOn(input, "focus");
      showSearchPanel.value = true;
      await nextTick();
      await nextTick();
      expect(focusSpy).toHaveBeenCalled();
      document.body.removeChild(input);
    });
  });

  describe("click-outside handling", () => {
    it("closes panel on mousedown outside the panel", async () => {
      const { wrapper, showSearchPanel, searchPanelRef } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      const panel = document.createElement("div");
      document.body.appendChild(panel);
      searchPanelRef.value = panel;
      showSearchPanel.value = true;
      await nextTick();

      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      expect(showSearchPanel.value).toBe(false);
      document.body.removeChild(panel);
    });

    it("does not close panel on mousedown inside the panel", async () => {
      const { wrapper, showSearchPanel, searchPanelRef } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      const panel = document.createElement("div");
      document.body.appendChild(panel);
      searchPanelRef.value = panel;
      showSearchPanel.value = true;
      await nextTick();

      panel.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      expect(showSearchPanel.value).toBe(true);
      document.body.removeChild(panel);
    });

    it("does nothing when panel is not open", async () => {
      const { wrapper, showSearchPanel } = mountWithSearch();
      cleanup = () => wrapper.unmount();
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await nextTick();
      expect(showSearchPanel.value).toBe(false);
    });

    it("removes listener on unmount", () => {
      const spy = vi.spyOn(document, "removeEventListener");
      const { wrapper } = mountWithSearch();
      wrapper.unmount();
      expect(spy).toHaveBeenCalledWith("mousedown", expect.any(Function));
      spy.mockRestore();
    });
  });
});
