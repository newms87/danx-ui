<script setup lang="ts">
/**
 * Demo App
 *
 * Root component for the danx-ui demo environment.
 * Includes theme selector with localStorage persistence.
 */
import { ref, onMounted, watch } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { DanxScroll } from "../src";
import { version } from "../package.json";

type Theme = "light" | "dark";

const STORAGE_KEY = "danx-ui-theme";

const theme = ref<Theme>("light");

function applyTheme(newTheme: Theme) {
  document.documentElement.classList.toggle("dark", newTheme === "dark");
  document.body.style.colorScheme = newTheme;
}

function handleThemeChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  theme.value = select.value as Theme;
}

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && ["light", "dark"].includes(stored)) {
    theme.value = stored;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme.value = "dark";
  }
  applyTheme(theme.value);
});

watch(theme, (newTheme) => {
  localStorage.setItem(STORAGE_KEY, newTheme);
  applyTheme(newTheme);
});
</script>

<template>
  <div class="demo-app">
    <!-- Sidebar -->
    <nav class="demo-sidebar">
      <div class="demo-sidebar__header">
        <h1>danx-ui</h1>
        <span class="demo-sidebar__version">v{{ version }}</span>
      </div>

      <DanxScroll class="demo-sidebar__scroll">
        <ul class="demo-sidebar__nav">
          <li>
            <RouterLink to="/" class="demo-sidebar__link">Home</RouterLink>
          </li>
          <li>
            <span class="demo-sidebar__section">Design System</span>
            <ul>
              <li>
                <RouterLink to="/design/colors" class="demo-sidebar__link">Colors</RouterLink>
              </li>
              <li>
                <RouterLink to="/design/typography" class="demo-sidebar__link"
                  >Typography</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/design/spacing" class="demo-sidebar__link"
                  >Spacing &amp; Layout</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/design/shadows" class="demo-sidebar__link"
                  >Shadows &amp; Effects</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/design/theming" class="demo-sidebar__link"
                  >Theming Guide</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/design/variants" class="demo-sidebar__link">Variants</RouterLink>
              </li>
            </ul>
          </li>
          <li>
            <span class="demo-sidebar__section">Components</span>
            <ul>
              <li>
                <RouterLink to="/badge" class="demo-sidebar__link">Badge</RouterLink>
              </li>
              <li>
                <RouterLink to="/button" class="demo-sidebar__link">Button</RouterLink>
              </li>
              <li>
                <RouterLink to="/action-button" class="demo-sidebar__link"
                  >Action Button</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/button-group" class="demo-sidebar__link">Button Group</RouterLink>
              </li>
              <li>
                <RouterLink to="/chip" class="demo-sidebar__link">Chip</RouterLink>
              </li>
              <li>
                <RouterLink to="/code-viewer" class="demo-sidebar__link">Code Viewer</RouterLink>
              </li>
              <li>
                <RouterLink to="/context-menu" class="demo-sidebar__link">Context Menu</RouterLink>
              </li>
              <li>
                <RouterLink to="/dialog" class="demo-sidebar__link">Dialog</RouterLink>
              </li>
              <li>
                <RouterLink to="/icon" class="demo-sidebar__link">Icon</RouterLink>
              </li>
              <li>
                <RouterLink to="/popover" class="demo-sidebar__link">Popover</RouterLink>
              </li>
              <li>
                <RouterLink to="/markdown-editor" class="demo-sidebar__link"
                  >Markdown Editor</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/tabs" class="demo-sidebar__link">Tabs</RouterLink>
              </li>
              <li>
                <RouterLink to="/progress-bar" class="demo-sidebar__link">Progress Bar</RouterLink>
              </li>
              <li>
                <RouterLink to="/split-panel" class="demo-sidebar__link">Split Panel</RouterLink>
              </li>
              <li>
                <RouterLink to="/tooltip" class="demo-sidebar__link">Tooltip</RouterLink>
              </li>
              <li>
                <RouterLink to="/danx-file" class="demo-sidebar__link">File</RouterLink>
              </li>
              <li>
                <RouterLink to="/danx-file-viewer" class="demo-sidebar__link"
                  >File Viewer</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/scroll" class="demo-sidebar__link">Scroll</RouterLink>
              </li>
              <li>
                <RouterLink to="/skeleton" class="demo-sidebar__link">Skeleton</RouterLink>
              </li>
            </ul>
          </li>
          <li>
            <span class="demo-sidebar__section">Utilities</span>
            <ul>
              <li>
                <RouterLink to="/formatters" class="demo-sidebar__link">Formatters</RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </DanxScroll>

      <div class="demo-sidebar__footer">
        <label class="demo-theme-selector">
          <span class="demo-theme-selector__label">Theme</span>
          <select class="demo-theme-selector__select" :value="theme" @change="handleThemeChange">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
    </nav>

    <!-- Main Content -->
    <DanxScroll tag="main" class="demo-main">
      <RouterView />
    </DanxScroll>
  </div>
</template>

<style>
/* Demo App Layout */
.demo-app {
  display: flex;
  height: 100vh;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  background: var(--color-surface);
  color: var(--color-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Sidebar */
.demo-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 260px;
  background: var(--color-surface-sunken);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.demo-sidebar__header {
  margin-bottom: 2rem;
}

.demo-sidebar__header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.demo-sidebar__version {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-left: 0.25rem;
}

.demo-sidebar__scroll {
  flex: 1;
  min-height: 0;
}

.demo-sidebar__nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.demo-sidebar__nav ul {
  list-style: none;
  padding-left: 0.75rem;
  margin: 0.25rem 0 0;
}

.demo-sidebar__section {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-subtle);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
  font-weight: 600;
}

.demo-sidebar__link {
  display: block;
  padding: 0.625rem 0.75rem;
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.demo-sidebar__link:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.demo-sidebar__link.router-link-active {
  background: var(--gradient-accent);
  color: white;
  box-shadow: 0 2px 8px rgb(37 99 235 / 0.25);
}

.demo-sidebar__footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Theme Selector */
.demo-theme-selector {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.demo-theme-selector__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.demo-theme-selector__select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

.demo-theme-selector__select:hover {
  border-color: var(--color-border-strong);
}

.demo-theme-selector__select:focus {
  outline: none;
  border-color: var(--color-interactive);
  box-shadow: 0 0 0 3px var(--color-interactive-subtle);
}

/* Main Content */
.demo-main {
  flex: 1;
  min-height: 0;
  padding: 2rem;
  background: var(--color-surface);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .demo-app {
    flex-direction: column;
  }

  .demo-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
  }

  .demo-sidebar__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .demo-sidebar__nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .demo-sidebar__nav ul {
    display: flex;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
  }

  .demo-sidebar__section {
    display: none;
  }

  .demo-sidebar__footer {
    padding-top: 0.75rem;
  }

  .demo-main {
    padding: 1rem;
  }
}
</style>
