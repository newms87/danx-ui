/**
 * Language Search Composable
 *
 * Encapsulates the searchable language selection panel logic used by LanguageBadge.
 * Manages search query state, filtered results, keyboard navigation (Arrow Up/Down,
 * Enter, Escape), click-outside-to-close behavior, and panel open/close lifecycle.
 */

import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";

/** All languages available in the search panel, sorted alphabetically. */
export const ALL_LANGUAGES = [
  "bash",
  "c",
  "cpp",
  "css",
  "dockerfile",
  "go",
  "graphql",
  "html",
  "java",
  "javascript",
  "json",
  "kotlin",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scss",
  "sql",
  "swift",
  "text",
  "typescript",
  "xml",
  "yaml",
];

export interface UseLanguageSearchOptions {
  /** Controls visibility of the search panel (v-model from parent). */
  showSearchPanel: Ref<boolean>;
  /** Ref to the search input element (for auto-focus on open). */
  searchInputRef: Ref<HTMLInputElement | null>;
  /** Ref to the scrollable list container (for scroll-into-view on navigate). */
  searchListRef: Ref<HTMLElement | null>;
  /** Ref to the panel root (for click-outside detection). */
  searchPanelRef: Ref<HTMLElement | null>;
  /** Called when a language is selected; the component should emit "change". */
  onSelect: (lang: string) => void;
}

export interface UseLanguageSearchReturn {
  searchQuery: Ref<string>;
  selectedIndex: Ref<number>;
  filteredLanguages: Ref<string[]>;
  onSearchQueryChange: () => void;
  navigateDown: () => void;
  navigateUp: () => void;
  selectCurrentItem: () => void;
  selectLanguage: (lang: string) => void;
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
}

export function useLanguageSearch(options: UseLanguageSearchOptions): UseLanguageSearchReturn {
  const { showSearchPanel, searchInputRef, searchListRef, searchPanelRef, onSelect } = options;

  const searchQuery = ref("");
  const selectedIndex = ref(0);

  const filteredLanguages = computed(() => {
    if (!searchQuery.value) {
      return ALL_LANGUAGES;
    }
    const query = searchQuery.value.toLowerCase();
    return ALL_LANGUAGES.filter((lang) => lang.toLowerCase().includes(query));
  });

  function onSearchQueryChange(): void {
    selectedIndex.value = 0;
  }

  function navigateDown(): void {
    if (filteredLanguages.value.length === 0) return;
    selectedIndex.value = (selectedIndex.value + 1) % filteredLanguages.value.length;
    scrollSelectedIntoView();
  }

  function navigateUp(): void {
    if (filteredLanguages.value.length === 0) return;
    selectedIndex.value =
      selectedIndex.value === 0 ? filteredLanguages.value.length - 1 : selectedIndex.value - 1;
    scrollSelectedIntoView();
  }

  function selectCurrentItem(): void {
    const lang = filteredLanguages.value[selectedIndex.value];
    if (lang) {
      selectLanguage(lang);
    }
  }

  function scrollSelectedIntoView(): void {
    nextTick(() => {
      const selected = searchListRef.value?.querySelector(".is-selected");
      selected?.scrollIntoView({ block: "nearest" });
    });
  }

  function openSearchPanel(): void {
    showSearchPanel.value = true;
  }

  function closeSearchPanel(): void {
    showSearchPanel.value = false;
    searchQuery.value = "";
  }

  function selectLanguage(lang: string): void {
    onSelect(lang);
    closeSearchPanel();
  }

  function handleClickOutside(event: MouseEvent): void {
    if (showSearchPanel.value) {
      const target = event.target as HTMLElement;
      if (searchPanelRef.value && !searchPanelRef.value.contains(target)) {
        closeSearchPanel();
      }
    }
  }

  watch(showSearchPanel, (isOpen) => {
    if (isOpen) {
      searchQuery.value = "";
      selectedIndex.value = 0;
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    }
  });

  onMounted(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });

  return {
    searchQuery,
    selectedIndex,
    filteredLanguages,
    onSearchQueryChange,
    navigateDown,
    navigateUp,
    selectCurrentItem,
    selectLanguage,
    openSearchPanel,
    closeSearchPanel,
  };
}
