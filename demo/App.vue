<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";

const isDark = ref(false);

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
}
</script>

<template>
  <div class="demo-app" :class="{ dark: isDark }">
    <!-- Sidebar -->
    <nav class="demo-sidebar">
      <div class="demo-sidebar__header">
        <h1>danx-ui</h1>
        <span class="demo-sidebar__version">v0.1.0</span>
      </div>

      <ul class="demo-sidebar__nav">
        <li>
          <RouterLink to="/" class="demo-sidebar__link">Home</RouterLink>
        </li>
        <li>
          <span class="demo-sidebar__section">Components</span>
          <ul>
            <li>
              <RouterLink to="/dialog" class="demo-sidebar__link">Dialog</RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <div class="demo-sidebar__footer">
        <button class="demo-theme-toggle" @click="toggleDarkMode">
          {{ isDark ? "☀️ Light" : "🌙 Dark" }}
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="demo-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Demo App Layout */
.demo-app {
  display: flex;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.demo-app.dark {
  background: #1a1a2e;
  color: #e8e8e8;
}

/* Sidebar */
.demo-sidebar {
  width: 240px;
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.dark .demo-sidebar {
  background: #16213e;
  border-color: #0f3460;
}

.demo-sidebar__header {
  margin-bottom: 2rem;
}

.demo-sidebar__header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.demo-sidebar__version {
  font-size: 0.75rem;
  color: #888;
}

.demo-sidebar__nav {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.demo-sidebar__nav ul {
  list-style: none;
  padding-left: 1rem;
  margin: 0;
}

.demo-sidebar__section {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #888;
  margin-top: 1rem;
  display: block;
}

.demo-sidebar__link {
  display: block;
  padding: 0.5rem;
  color: inherit;
  text-decoration: none;
  border-radius: 4px;
}

.demo-sidebar__link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .demo-sidebar__link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.demo-sidebar__link.router-link-active {
  background: #0077cc;
  color: white;
}

.demo-sidebar__footer {
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.dark .demo-sidebar__footer {
  border-color: #0f3460;
}

.demo-theme-toggle {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  color: inherit;
}

.demo-theme-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .demo-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Main Content */
.demo-main {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}
</style>
