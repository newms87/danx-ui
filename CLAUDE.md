# danx-ui

Zero-dependency Vue 3 + Tailwind CSS v4 component library with three-tier theming.

## Quick Reference

```bash
yarn dev           # Start Vite dev server
yarn build         # Build for production
yarn typecheck     # Run TypeScript type checking
yarn lint          # Run ESLint with auto-fix
yarn format        # Run Prettier
yarn test          # Run Vitest in watch mode
yarn test:run      # Run Vitest once
yarn test:coverage # Run with coverage report
```

## Core Principles

`SOLID / DRY / Zero-Debt / One-Way / Read-First / Flawless`

| Principle | Description |
|-----------|-------------|
| **Zero Tech Debt** | No legacy, backwards compat, dead code, or hacks |
| **SOLID** | Single responsibility, small files (<150 lines), small methods |
| **DRY** | Refactor duplication immediately |
| **One Way** | ONE correct pattern for everything |
| **Read First** | Read existing code before writing |
| **Flawless** | Every component perfectly documented, typed, styled, tested |

## Technology Stack

- **Vue 3.5+** - Composition API only, `<script setup>`
- **TypeScript** - Strict mode, no `any`
- **Tailwind CSS v4** - `@theme` directive, CSS-first config
- **Vite 6** - Library mode build
- **Vitest** - 100% test coverage required
- **Native HTML** - Use native elements where possible

## Component Architecture Rules

| Rule | Description |
|------|-------------|
| **100% Declarative** | No `defineExpose` for imperative methods |
| **defineModel()** | All v-model bindings use defineModel |
| **v-if Mounting** | Use v-if for dialogs (never v-show) |
| **Three-Tier Tokens** | Primitive → Semantic → Component |
| **No Styling Props** | CSS variable overrides only |
| **Named Exports** | No default exports (tree-shaking) |

## Documentation Requirements

Every `.vue` file MUST have comprehensive comment block:
- Purpose and usage
- All props with types and defaults
- All events emitted
- All slots available
- All CSS tokens for styling
- Usage examples in prose

## Feature Completion Checklist

**Every new feature MUST have all three:**

| Requirement | Description |
|-------------|-------------|
| **Tests** | 100% coverage - all props, events, edge cases |
| **Documentation** | Component comment block + `docs/*.md` if user-facing |
| **Demo** | Live example in `demo/pages/` showing the feature |

A feature is NOT complete until all three are done.

## Testing Requirements

**100% test coverage required.** All components and composables must be tested.

| What to Test | What NOT to Test |
|--------------|------------------|
| Prop rendering | Vue framework behavior |
| Event emissions | CSS styling |
| Slot rendering | Third-party libraries |
| State changes | TypeScript types |
| Edge cases | Index files |

## Tailwind v4 Rules

- Use `@theme` directive for token registration
- CSS-first configuration (no tailwind.config.js)
- Dark mode via `.dark` class on semantic layer only
- `@starting-style` for entry animations
- Never use `@apply` in component CSS

## Critical Gotchas

| Rule | Description |
|------|-------------|
| **ALWAYS use Write/Edit tools** | NEVER use bash commands (sed, awk, echo) to edit files |
| **Type files use `.ts`** | `.d.ts` is reserved for ambient declarations (e.g. `vite-env.d.ts`) |
| **NEVER use Options API** | Composition API with `<script setup>` only |
| **NEVER use default exports** | Named exports for tree-shaking |
| **NEVER add runtime dependencies** | Vue is peer dep only |
| **NEVER use styling props** | CSS tokens only |
| **NEVER use defineExpose** | Use v-model instead |
| **Relative paths only** | No `/home/...` paths in commands |
| **NEVER run yarn lint manually** | Hooks run ESLint after every Write/Edit. Running it manually is redundant. |
| **ALWAYS run yarn test:coverage** | Run as final verification for ANY task. Failing thresholds = blocking. |

## Project Structure

```
src/
├── components/
│   └── {component}/      # Feature-based organization
│       ├── Component.vue
│       ├── useComponent.ts
│       ├── component.css
│       ├── types.ts      # Type-only files use .ts (excluded from coverage by name)
│       ├── index.ts
│       └── __tests__/    # Component tests
docs/                     # User documentation
.claude/
├── rules/                # Detailed rules
├── skills/               # Invocable skills
└── agents/               # Specialized agents
```

## Agent Architecture

| Agent | Purpose | Can Edit? |
|-------|---------|-----------|
| `component-architect` | Plan new components, investigate bugs | No |
| `code-reviewer` | Analyze code quality, SOLID/DRY violations | No |
| `test-reviewer` | Audit test coverage, review test quality | No |

## Key Documentation

**Rules:**
- `.claude/rules/core-principles.md` - SOLID/DRY/Zero-Debt
- `.claude/rules/component-architecture.md` - Vue component patterns
- `.claude/rules/tailwind-v4.md` - Tailwind v4 specifics
- `.claude/rules/vue-patterns.md` - Vue 3 best practices
- `.claude/rules/testing.md` - Test coverage requirements
- `.claude/rules/tool-usage.md` - Write/Edit tool requirements

**User Docs:**
- `docs/getting-started.md` - Installation and setup
- `docs/theming.md` - Three-tier token system
- `docs/dialog.md` - Dialog component reference

## Forbidden Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| `defineExpose({ open, close })` | Imperative | Use v-model |
| `props.titleClass` | Inflexible | CSS tokens |
| Default exports | Tree-shaking | Named exports |
| Runtime dependencies | Bundle size | Vue peer dep only |
| `v-show` for dialogs | DOM pollution | Use v-if |
| `any` type | Type safety | Proper types |
| Options API | Outdated | Composition API |
| Bash file editing | Bypasses linting | Write/Edit tools |
| `types.d.ts` (project types) | Misleading — `.d.ts` is for ambient declarations | Use `types.ts` |
