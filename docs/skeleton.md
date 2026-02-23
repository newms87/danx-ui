# DanxSkeleton

Content-shaped placeholder shown while data loads. Reduces perceived load time and prevents layout shift by reserving space with animated placeholder shapes.

## Installation

```vue
<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>
```

## Basic Usage

```vue
<!-- Rectangle (default) -->
<DanxSkeleton />

<!-- Circle avatar -->
<DanxSkeleton shape="circle" />

<!-- Rounded card -->
<DanxSkeleton shape="rounded" />

<!-- Multi-line text -->
<DanxSkeleton shape="text" :lines="4" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shape` | `"rectangle" \| "circle" \| "text" \| "rounded"` | `"rectangle"` | Geometry of the placeholder |
| `animation` | `"pulse" \| "wave"` | `"pulse"` | Animation style |
| `lines` | `number` | `3` | Number of text lines (shape="text" only) |
| `ariaLabel` | `string` | `"Loading..."` | Screen reader label |

## Shapes

- **rectangle** — Sharp-cornered block. Default for images, banners, generic areas.
- **circle** — Perfect circle. For avatars and profile images.
- **text** — Multiple pill-shaped rows with gap, last line auto-shortened to 60%. For paragraph placeholders.
- **rounded** — Block with configurable border-radius. For cards and buttons.

## Animations

- **pulse** — Opacity oscillates between 1.0 and 0.4, ease-in-out, infinite loop. Simple and lightweight.
- **wave** — Gradient sweeps left-to-right via `::after` pseudo-element. More visually engaging.

## Composition

Combine multiple `DanxSkeleton` instances to create realistic loading states:

```vue
<div style="display: flex; gap: 0.75rem; align-items: center">
  <DanxSkeleton shape="circle" style="--dx-skeleton-circle-size: 2.5rem" />
  <DanxSkeleton shape="rounded" style="--dx-skeleton-width: 8rem; --dx-skeleton-height: 0.875rem" />
</div>
<DanxSkeleton shape="text" :lines="3" />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-skeleton-bg` | `var(--color-surface-placeholder)` | Background color |
| `--dx-skeleton-highlight` | `rgb(255 255 255 / 0.4)` | Wave gradient highlight |
| `--dx-skeleton-border-radius` | `var(--radius-component)` | Radius for "rounded" shape |
| `--dx-skeleton-width` | `100%` | Element width |
| `--dx-skeleton-height` | `1rem` | Element height |
| `--dx-skeleton-circle-size` | `3rem` | Circle diameter |
| `--dx-skeleton-text-line-height` | `0.75rem` | Each text line height |
| `--dx-skeleton-text-gap` | `var(--space-sm)` | Gap between text lines |
| `--dx-skeleton-text-last-width` | `60%` | Last text line width |
| `--dx-skeleton-pulse-duration` | `1.5s` | Pulse cycle duration |
| `--dx-skeleton-wave-duration` | `1.8s` | Wave sweep duration |

```vue
<!-- Custom sizing -->
<DanxSkeleton style="--dx-skeleton-width: 200px; --dx-skeleton-height: 120px" />

<!-- Custom colors -->
<DanxSkeleton style="--dx-skeleton-bg: oklch(0.8 0.1 240)" />

<!-- Faster animation -->
<DanxSkeleton style="--dx-skeleton-pulse-duration: 0.8s" />
```

## Accessibility

- `role="status"` and `aria-busy="true"` on root element
- Visually hidden `<span>` with configurable label text for screen readers
- Custom label via `ariaLabel` prop

```vue
<DanxSkeleton ariaLabel="Loading user profile" />
```

## Dark Mode

Automatic via semantic token references. The `--dx-skeleton-bg` token references `--color-surface-sunken`, which changes automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
