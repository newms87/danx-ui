<!--
/**
 * LanguageBadge Component
 *
 * Displays the current code format/language as a badge in the top-right corner
 * of the CodeViewer. On hover, shows alternative format options for quick switching.
 * When allowAnyLanguage is true, includes a searchable language selection panel
 * with keyboard navigation (Arrow Up/Down, Enter, Escape).
 *
 * Features:
 * - Hover-to-reveal format options (e.g., JSON / YAML)
 * - Keyboard-navigable search panel for all supported languages
 * - Click-outside-to-close for the search panel
 * - Slide and fade animations for smooth transitions
 *
 * @props
 *   format: string - Current format/language being displayed
 *   availableFormats?: string[] - Formats available for quick switching on hover (default: [])
 *   toggleable?: boolean - Whether format switching is enabled (default: true)
 *   allowAnyLanguage?: boolean - Whether to show a search panel for selecting any language (default: false)
 *
 * @model
 *   searchOpen: boolean - Controls visibility of the language search panel (default: false)
 *
 * @emits
 *   change(format: string) - Fired when a different language is selected
 *
 * @tokens
 *   --dx-code-viewer-badge-bg - Badge background color
 *   --dx-code-viewer-badge-text - Badge text color
 *   --dx-code-viewer-badge-font-size - Badge font size
 *   --dx-code-viewer-badge-active-radius - Border radius when options are visible
 *
 * @example
 *   <LanguageBadge
 *     format="json"
 *     :available-formats="['json', 'yaml']"
 *     allow-any-language
 *     @change="onFormatChange"
 *   />
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { searchSvg } from "./icons";
import type { LanguageBadgeProps } from "./types";

const props = withDefaults(defineProps<LanguageBadgeProps>(), {
  availableFormats: () => [],
  toggleable: true,
  allowAnyLanguage: false,
});

const emit = defineEmits<{
  change: [format: string];
}>();

const showSearchPanel = defineModel<boolean>("searchOpen", { default: false });

const ALL_LANGUAGES = [
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

const showOptions = ref(false);
const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchListRef = ref<HTMLElement | null>(null);
const searchPanelRef = ref<HTMLElement | null>(null);
const selectedIndex = ref(0);

const otherFormats = computed(() => {
  return props.availableFormats.filter((f) => f !== props.format);
});

const filteredLanguages = computed(() => {
  if (!searchQuery.value) {
    return ALL_LANGUAGES;
  }
  const query = searchQuery.value.toLowerCase();
  return ALL_LANGUAGES.filter((lang) => lang.toLowerCase().includes(query));
});

function onSearchQueryChange() {
  selectedIndex.value = 0;
}

function navigateDown() {
  if (filteredLanguages.value.length === 0) return;
  selectedIndex.value = (selectedIndex.value + 1) % filteredLanguages.value.length;
  scrollSelectedIntoView();
}

function navigateUp() {
  if (filteredLanguages.value.length === 0) return;
  selectedIndex.value =
    selectedIndex.value === 0 ? filteredLanguages.value.length - 1 : selectedIndex.value - 1;
  scrollSelectedIntoView();
}

function selectCurrentItem() {
  const lang = filteredLanguages.value[selectedIndex.value];
  if (lang) {
    selectLanguage(lang);
  }
}

function scrollSelectedIntoView() {
  nextTick(() => {
    const selected = searchListRef.value?.querySelector(".is-selected");
    selected?.scrollIntoView({ block: "nearest" });
  });
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

function openSearchPanel() {
  showSearchPanel.value = true;
}

function closeSearchPanel() {
  showSearchPanel.value = false;
  searchQuery.value = "";
}

function selectLanguage(lang: string) {
  emit("change", lang);
  closeSearchPanel();
}

function onMouseLeave() {
  showOptions.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (showSearchPanel.value) {
    const target = event.target as HTMLElement;
    if (searchPanelRef.value && !searchPanelRef.value.contains(target)) {
      closeSearchPanel();
    }
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<template>
  <div
    class="dx-language-badge-container"
    :class="{ 'is-toggleable': toggleable && availableFormats.length > 1 }"
    @mouseenter="showOptions = true"
    @mouseleave="onMouseLeave"
  >
    <!-- Search icon (when allowAnyLanguage is true) -->
    <transition name="slide-left">
      <div
        v-if="showOptions && allowAnyLanguage"
        class="dx-language-option dx-language-search-trigger"
        @click.stop="openSearchPanel"
      >
        <span v-html="searchSvg" />
      </div>
    </transition>

    <!-- Other format options (slide out to the left) -->
    <transition name="slide-left">
      <div v-if="showOptions && toggleable && otherFormats.length > 0" class="dx-language-options">
        <div
          v-for="fmt in otherFormats"
          :key="fmt"
          class="dx-language-option"
          @click.stop="$emit('change', fmt)"
        >
          {{ fmt.toUpperCase() }}
        </div>
      </div>
    </transition>

    <!-- Current format badge -->
    <div
      class="dx-language-badge"
      :class="{ 'is-active': showOptions && (otherFormats.length > 0 || allowAnyLanguage) }"
    >
      {{ format.toUpperCase() }}
    </div>

    <!-- Search dropdown panel -->
    <transition name="fade">
      <div v-if="showSearchPanel" ref="searchPanelRef" class="dx-language-search-panel" @click.stop>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="dx-language-search-input"
          placeholder="Search languages..."
          @input="onSearchQueryChange"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectCurrentItem"
          @keydown.escape="closeSearchPanel"
        />
        <div ref="searchListRef" class="dx-language-search-list">
          <div
            v-for="(lang, index) in filteredLanguages"
            :key="lang"
            class="dx-language-search-item"
            :class="{ 'is-selected': index === selectedIndex }"
            @click="selectLanguage(lang)"
            @mouseenter="selectedIndex = index"
          >
            {{ lang.toUpperCase() }}
          </div>
          <div v-if="filteredLanguages.length === 0" class="dx-language-search-empty">
            No languages found
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
