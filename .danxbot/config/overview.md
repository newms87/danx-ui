# Danx UI — Architecture Overview

`@thehammer/danx-ui` — a zero-dependency Vue 3 + Tailwind CSS v4 component
library with three-tier theming. Published to npm; consumed by gpt-manager
and other repos.

## Tech Stack

- **Vue 3.5+** — Composition API only, `<script setup>`
- **TypeScript** — strict mode, no `any`
- **Tailwind CSS v4** — `@theme` directive, CSS-first config
- **Vite 6** — library-mode build
- **Vitest** — 100% test coverage required

## Component Architecture Rules

- 100% declarative — no `defineExpose` for imperative methods
- All v-model bindings use `defineModel()`
- `v-if` for dialog mounting (never `v-show`)
- Three-tier design tokens: Primitive → Semantic → Component
- No styling props — CSS variable overrides only
- Named exports only (tree-shaking; no default exports)
- Every `.vue` file carries a comprehensive comment block (purpose, props,
  events, slots, CSS tokens, usage examples)

## Project Structure

```
src/
  components/   — library components (.vue)
  composables/  — shared composition functions
  types/        — TypeScript interfaces
```

## Authoritative Rules

`CLAUDE.md` at the repo root is the source of truth for project conventions.
