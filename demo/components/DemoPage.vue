<script setup lang="ts">
/**
 * DemoPage - Layout wrapper for demo pages
 *
 * Provides consistent structure for all demo pages: title, description,
 * and a tabbed interface for Examples (live demos) and Documentation
 * (rendered markdown via MarkdownEditor in readonly mode).
 *
 * If no docs prop is provided, the tab bar is hidden and only examples are shown.
 *
 * @props
 *   title: string - Page heading (h1)
 *   description: string - Description paragraph below heading
 *   docs?: string - Raw markdown for the Documentation tab (default: "")
 *
 * @slots
 *   default - DemoSection elements for the Examples tab
 *
 * @example
 *   <DemoPage title="Button" description="A button component." :docs="buttonDocs">
 *     <DemoSection title="Basic" :code="basicCode" />
 *   </DemoPage>
 */
import { ref, onMounted, onUnmounted, computed } from "vue";
import { MarkdownEditor } from "danx-ui";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    docs?: string;
  }>(),
  { docs: "" }
);

type Tab = "examples" | "docs";
const activeTab = ref<Tab>("examples");

const hasDocs = computed(() => props.docs.length > 0);

const isDark = ref(document.documentElement.classList.contains("dark"));
let observer: MutationObserver | null = null;

onMounted(() => {
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark");
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

const isLightTheme = computed(() => !isDark.value);
</script>

<template>
  <div class="demo-page">
    <h1>{{ title }}</h1>
    <p class="demo-page__description">{{ description }}</p>

    <div v-if="hasDocs" class="demo-page__tabs">
      <button
        class="demo-page__tab"
        :class="{ 'demo-page__tab--active': activeTab === 'examples' }"
        @click="activeTab = 'examples'"
      >
        Examples
      </button>
      <button
        class="demo-page__tab"
        :class="{ 'demo-page__tab--active': activeTab === 'docs' }"
        @click="activeTab = 'docs'"
      >
        Documentation
      </button>
    </div>

    <div v-show="activeTab === 'examples'">
      <slot />
    </div>

    <div v-if="hasDocs && activeTab === 'docs'" class="demo-page__docs">
      <MarkdownEditor
        :model-value="docs"
        readonly
        hide-footer
        :class="{ 'theme-light': isLightTheme }"
      />
    </div>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 900px;
}

.demo-page h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.demo-page__description {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  font-size: 1.125rem;
  line-height: 1.6;
}

.demo-page__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.demo-page__tab {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.demo-page__tab:hover {
  color: var(--color-text);
}

.demo-page__tab--active {
  color: var(--color-interactive);
  border-bottom-color: var(--color-interactive);
}

.demo-page__docs {
  margin-top: 1rem;
}
</style>
