# Tailwind CSS v4 Rules

## CSS-First Configuration

Tailwind v4 uses CSS-first configuration. **No `tailwind.config.js` file.**

### `@theme` Directive

Register design tokens directly in CSS:

```css
@theme {
  --color-primary: oklch(0.7 0.15 240);
  --spacing-dialog: 2rem;
  --radius-dialog: 0.5rem;
}
```

### When to Use `@theme`

- Primitive tokens (colors, spacing, radii)
- Values that should be available as Tailwind utilities
- Values referenced in multiple components

### When NOT to Use `@theme`

- Component-specific tokens (use CSS custom properties directly)
- One-off values that won't be reused

## Three-Tier Token System

### Tier 1: Primitive Tokens

Raw values without semantic meaning:

```css
@theme {
  --color-gray-900: oklch(0.15 0 0);
  --color-gray-100: oklch(0.95 0 0);
  --spacing-4: 1rem;
}
```

### Tier 2: Semantic Tokens

Purpose-driven references to primitives:

```css
:root {
  --color-surface: var(--color-gray-100);
  --color-on-surface: var(--color-gray-900);
}

.dark {
  --color-surface: var(--color-gray-900);
  --color-on-surface: var(--color-gray-100);
}
```

### Tier 3: Component Tokens

Component-specific tokens referencing semantic tokens:

```css
.dialog {
  --dx-dialog-bg: var(--color-surface);
  --dx-dialog-text: var(--color-on-surface);
}
```

## Dark Mode Implementation

### Dark Mode Lives on Semantic Layer ONLY

```css
/* CORRECT - Dark mode on semantic layer */
:root {
  --color-surface: var(--color-gray-100);
}
.dark {
  --color-surface: var(--color-gray-900);
}

/* WRONG - Dark mode on component layer */
.dialog {
  --dx-dialog-bg: var(--color-gray-100);
}
.dark .dialog {
  --dx-dialog-bg: var(--color-gray-900);
}
```

### Why This Matters

- Single source of truth for theme switching
- Components automatically adapt
- No duplication of dark mode logic

## Animation with `@starting-style`

Use native CSS for entry animations:

```css
.dialog-panel {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.2s, transform 0.2s;
}

@starting-style {
  .dialog-panel {
    opacity: 0;
    transform: translateY(1rem);
  }
}
```

### Benefits

- No JavaScript animation libraries
- GPU-accelerated
- Works with `v-if` mounting

## CSS Nesting Required

**ALWAYS use native CSS nesting. Flat repeated-parent selectors are forbidden.**

- Descendant selectors nest implicitly (`.child {}` inside `.parent {}`)
- Use `&` for pseudo-classes, pseudo-elements, and compound modifier classes (e.g., `&:hover`, `&.is-active`)
- **NEVER use `&` for BEM suffix concatenation** (e.g., `&--modifier`, `&__element`) — Lightning CSS produces invalid selectors. BEM modifiers must be top-level blocks.
- Exceptions: token-only files (`:root`, `.dark`, `@theme`) that are flat by nature

```css
/* CORRECT - Nested with top-level BEM modifiers */
.parent {
  color: red;

  .child { color: blue; }
  &:hover { color: green; }
  &.is-active { color: white; }
}

.parent--variant {
  color: orange;

  &:hover { color: yellow; }
}

/* WRONG - &--suffix concatenation (broken in Lightning CSS) */
.parent {
  &--variant { color: orange; }
}

/* WRONG - Flat repeated-parent */
.parent { color: red; }
.parent .child { color: blue; }
.parent:hover { color: green; }
.parent.is-active { color: white; }
```

## Forbidden Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| `tailwind.config.js` | Outdated | Use CSS `@theme` directive |
| `@apply` in components | Specificity issues | Use Tailwind classes or CSS properties |
| Dark mode in components | Duplication | Put dark mode in semantic layer |
| JavaScript animations | Bundle size | Use CSS `@starting-style` |
| Inline styles | Specificity | Use CSS tokens |
| Flat repeated-parent selectors | Repetitive, hard to scan | Use native CSS nesting |
| `&--suffix` BEM concatenation | Lightning CSS produces invalid selectors | Top-level BEM modifier blocks |

## Differences from Tailwind v3

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | CSS `@theme` directive |
| `theme.extend.colors` | `@theme { --color-name: value }` |
| `darkMode: 'class'` | Built-in `.dark` class support |
| PostCSS config required | Vite plugin handles it |
