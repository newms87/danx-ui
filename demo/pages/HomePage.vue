<script setup lang="ts">
/**
 * HomePage
 *
 * Landing page with getting started information.
 */
</script>

<template>
  <div class="home-page">
    <h1>danx-ui</h1>
    <p class="home-page__tagline">
      Zero-dependency Vue 3 + Tailwind CSS v4 component library with three-tier theming
    </p>

    <section class="home-page__section">
      <h2>Getting Started</h2>
      <pre class="home-page__code">npm install danx-ui</pre>
    </section>

    <section class="home-page__section">
      <h2>Usage</h2>
      <pre class="home-page__code">import { DanxDialog, useDialog } from 'danx-ui';
import 'danx-ui/styles';</pre>
    </section>

    <section class="home-page__section">
      <h2>Features</h2>
      <ul class="home-page__features">
        <li>🎨 Three-tier theming (base, semantic, component tokens)</li>
        <li>🚀 Zero dependencies (just Vue 3)</li>
        <li>♿ Accessible by default (native dialog, ARIA)</li>
        <li>🌙 Dark mode ready</li>
        <li>📦 Tree-shakeable exports</li>
      </ul>
    </section>

    <section class="home-page__section">
      <h2>Components</h2>
      <ul class="home-page__components">
        <li>
          <RouterLink to="/dialog">Dialog</RouterLink>
          - Fully declarative modal dialog
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 800px;
}

.home-page h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
}

.home-page__tagline {
  font-size: 1.125rem;
  color: #666;
  margin: 0 0 2rem;
}

:global(.dark) .home-page__tagline {
  color: #aaa;
}

.home-page__section {
  margin: 2rem 0;
}

.home-page__section h2 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

:global(.dark) .home-page__section h2 {
  border-color: #0f3460;
}

.home-page__code {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.875rem;
}

:global(.dark) .home-page__code {
  background: #1a1a2e;
}

.home-page__features,
.home-page__components {
  list-style: none;
  padding: 0;
  margin: 0;
}

.home-page__features li,
.home-page__components li {
  padding: 0.5rem 0;
}

.home-page__components a {
  color: #0077cc;
  font-weight: 600;
}

.home-page__components a:hover {
  text-decoration: underline;
}
</style>
