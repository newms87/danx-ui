# Theming Guide

danx-ui uses a three-tier CSS token system that makes theming intuitive and powerful.

## The Three Tiers

### Tier 1: Primitives

Raw values with no semantic meaning. These define the available palette.

```css
--color-slate-700: #334155;
--color-blue-600: #2563eb;
--spacing-4: 1rem;
--radius-lg: 0.5rem;
```

Primitives are rarely overridden directly. They define what colors, sizes, and values exist.

### Tier 2: Semantics

Contextual meaning that references primitives. These define what values are used for what purpose.

```css
--color-surface: var(--color-white);
--color-text: var(--color-slate-900);
--color-interactive: var(--color-blue-600);
```

Override semantic tokens to change system-wide behavior.

### Tier 3: Component

Per-component tokens that reference semantic tokens.

```css
--dx-dialog-bg: var(--color-surface);
--dx-dialog-title-color: var(--color-text);
```

Override component tokens for surgical, component-specific changes.

## Customization Levels

### Tweak (Component Token)

Change one aspect of one component:

```css
/* Make dialog backgrounds slightly gray */
.my-app {
  --dx-dialog-bg: #f8f8f8;
}
```

### Customize (Semantic Token)

Change system-wide behavior:

```css
/* Use purple as the interactive color throughout */
:root {
  --color-interactive: #7c3aed;
  --color-interactive-hover: #6d28d9;
}
```

### Replace (New Primitives)

Create an entirely new theme:

```css
:root {
  /* Custom brand colors */
  --color-brand-50: #fef2f2;
  --color-brand-500: #dc2626;
  --color-brand-600: #b91c1c;

  /* Point semantics to new primitives */
  --color-interactive: var(--color-brand-600);
  --color-interactive-hover: var(--color-brand-500);
}
```

## Dark Mode

Dark mode only redefines the semantic layer. Primitives stay the same, component tokens stay the same.

Built-in dark mode is activated with the `.dark` class:

```html
<html class="dark">
```

The dark theme overrides semantic tokens:

```css
.dark {
  --color-surface: var(--color-slate-900);
  --color-text: var(--color-slate-100);
  --color-border: var(--color-slate-700);
}
```

### Custom Dark Theme

Override the built-in dark semantics:

```css
.dark {
  /* Darker background */
  --color-surface: var(--color-black);

  /* Warmer text */
  --color-text: var(--color-amber-100);
}
```

## Available Tokens

### Semantic Tokens

| Token | Light Default | Description |
|-------|---------------|-------------|
| `--color-surface` | white | Primary background |
| `--color-surface-elevated` | white | Elevated surfaces (cards, dialogs) |
| `--color-surface-sunken` | slate-50 | Recessed areas |
| `--color-text` | slate-900 | Primary text |
| `--color-text-muted` | slate-600 | Secondary text |
| `--color-text-subtle` | slate-400 | Tertiary text |
| `--color-border` | slate-200 | Default borders |
| `--color-border-strong` | slate-300 | Emphasized borders |
| `--color-interactive` | blue-600 | Primary action color |
| `--color-interactive-hover` | blue-700 | Hover state |
| `--color-danger` | red-600 | Destructive actions |
| `--color-success` | green-600 | Success states |
| `--color-warning` | amber-500 | Warning states |
| `--color-backdrop` | black/50% | Modal backdrops |

### Dialog Component Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-dialog-bg` | `--color-surface` | Background |
| `--dx-dialog-border-color` | `--color-border` | Border color |
| `--dx-dialog-border-radius` | `--radius-dialog` | Corner radius |
| `--dx-dialog-shadow` | `--shadow-dialog` | Box shadow |
| `--dx-dialog-padding` | `--space-lg` | Content padding |
| `--dx-dialog-title-color` | `--color-text` | Title color |
| `--dx-dialog-title-size` | `--text-xl` | Title font size |
| `--dx-dialog-subtitle-color` | `--color-text-muted` | Subtitle color |
| `--dx-dialog-backdrop` | `--color-backdrop` | Backdrop color |

## Importing Tokens Only

To use the token system without any component styles:

```typescript
import 'danx-ui/shared/tokens';
```

This gives you the primitives, semantics, and dark mode definitions to use in your own styles.
