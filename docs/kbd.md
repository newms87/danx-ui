# Kbd Component

A generic, presentation-only keyboard-shortcut display primitive. Renders one or more key
names as styled key-cap badges, with OS-aware modifier labels (Mac glyphs vs word labels).

## Features

- **Key-cap Badges** - Renders one or more keys as `<kbd>` elements
- **OS-aware Labels** - Auto-detects Mac vs other platforms and shows the right modifier
  symbols/labels (`⌘ ⌥ ⇧ ^` on Mac, `Win Alt Shift Ctrl` elsewhere), overridable via the `os` prop
- **Standalone** - No dependency on any hotkey/composable system; purely presentational
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - No external icon library or hotkey system required

## Basic Usage

```vue
<template>
  <DanxKbd :keys="['ctrl', 'k']" />
</template>

<script setup lang="ts">
import { DanxKbd } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string[]` | - | Key names to render, e.g. `['ctrl', 'k']` |
| `os` | `"mac" \| "other"` | auto-detected | Overrides OS-aware label mode |
| `separator` | `string` | `"+"` | Separator rendered between combo key-caps |

## OS-aware Key Labels

Recognized modifier names (`ctrl`/`control`, `alt`/`option`, `shift`, `meta`/`cmd`/`command`) are
mapped to platform-specific labels. Any other key name is upper-cased and rendered as-is (e.g.
`"k"` becomes `"K"`).

| Key | Mac | Other |
|-----|-----|-------|
| `ctrl` / `control` | `^` | `Ctrl` |
| `alt` / `option` | `⌥` | `Alt` |
| `shift` | `⇧` | `Shift` |
| `meta` / `cmd` / `command` | `⌘` | `Win` |

Platform is auto-detected from `navigator.platform` (falling back to `navigator.userAgent`), but
can be forced with the `os` prop:

```vue
<DanxKbd :keys="['meta', 's']" os="mac" />
<DanxKbd :keys="['meta', 's']" os="other" />
```

## CSS Tokens

DanxKbd ships its own component tokens (not the markdown-editor's private `--dx-mde-kbd-*`
tokens), matching the same visual look.

| Token | Default | Description |
|-------|---------|--------------|
| `--dx-kbd-bg` | `#f1f5f9` | Key-cap background color |
| `--dx-kbd-border` | `#cbd5e1` | Key-cap border color |
| `--dx-kbd-text` | `#64748b` | Key-cap text color |
| `--dx-kbd-font-family` | `"Consolas", "Monaco", monospace` | Key-cap font |
| `--dx-kbd-font-size` | `0.75rem` | Key-cap font size |
| `--dx-kbd-border-radius` | `0.25rem` | Key-cap corner radius |
| `--dx-kbd-padding-x` | `0.5rem` | Key-cap horizontal padding |
| `--dx-kbd-padding-y` | `0.25rem` | Key-cap vertical padding |
| `--dx-kbd-gap` | `0.25rem` | Gap between key-cap and separator |

Dark mode overrides `--dx-kbd-bg`, `--dx-kbd-border`, and `--dx-kbd-text` under the `.dark` class.

### Example Override

```css
.my-kbd {
  --dx-kbd-bg: oklch(0.9 0.1 200);
  --dx-kbd-border-radius: 0.5rem;
}
```

## Accessibility

- Key labels render inside native `<kbd>` elements, which assistive technology recognizes as
  keyboard input semantics
- Purely presentational - no interactive behavior, so no focus/keyboard handling is required
