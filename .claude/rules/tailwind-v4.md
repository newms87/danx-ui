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

### CRITICAL: Component Token Files NEVER Contain Raw Values

**Component token files (`*-tokens.css`) may ONLY contain `var()` references to semantic tokens.** Raw color values (`rgb()`, `oklch()`, hex, `white`, `black`) are FORBIDDEN in component token files — no exceptions.

If a semantic token doesn't exist for what you need, the correct action is to create one in the semantic layer — not to hardcode a value in the component layer.

**The ONLY exception:** Transparency overlays (`rgb(0 0 0 / 0.5)`) where the intent is purely "dim the background" with no semantic meaning. These are visual effects, not colors. If the value would change between light and dark mode, it MUST be a semantic token reference.

| Allowed in `*-tokens.css` | Forbidden in `*-tokens.css` |
|---|---|
| `var(--color-danger)` | `rgb(239 68 68 / 0.85)` |
| `var(--color-info)` | `#3b82f6` |
| `var(--color-text-inverted)` | `white` |
| `rgb(0 0 0 / 0.5)` (neutral dim) | `rgb(255 255 255 / 0.4)` (theme-dependent) |

**Test:** "Would this value need to change in dark mode?" If yes, it MUST be `var()`. If you're about to write a `.dark` block in a component token file, STOP — you're violating the tier system.

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

## Tailwind-First Styling

All template styling uses Tailwind utility classes. Inline `style=""` is only permitted for:

- Dynamic computed values (`:style` bindings with reactive data)
- CSS custom property token overrides (`--dx-*`)
- Values Tailwind genuinely cannot express

Static layout properties (`display: flex`, `gap: 1rem`, `padding: 0.5rem`, etc.) must always use Tailwind classes. This applies to source components, demo pages, and example code alike.

## Forbidden Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| `tailwind.config.js` | Outdated | Use CSS `@theme` directive |
| `@apply` in components | Specificity issues | Use Tailwind classes or CSS properties |
| Dark mode in components | Duplication | Put dark mode in semantic layer |
| JavaScript animations | Bundle size | Use CSS `@starting-style` |
| Inline styles | Specificity | Use CSS tokens |
| Hardcoded inline styles | Bypasses Tailwind | Use Tailwind utilities |
| Flat repeated-parent selectors | Repetitive, hard to scan | Use native CSS nesting |
| `&--suffix` BEM concatenation | Lightning CSS produces invalid selectors | Top-level BEM modifier blocks |

## Differences from Tailwind v3

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | CSS `@theme` directive |
| `theme.extend.colors` | `@theme { --color-name: value }` |
| `darkMode: 'class'` | Built-in `.dark` class support |
| PostCSS config required | Vite plugin handles it |
