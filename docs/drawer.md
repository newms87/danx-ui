# Drawer Component

A v-model-controlled slide-out overlay panel anchored to an edge of the viewport (left, right, top, or bottom). Built on the native `<dialog>` element, reusing `DanxDialog`'s overlay, ESC, backdrop-click, and focus-trap conventions.

## Features

- **Native `<dialog>`** — built-in focus trap and ESC handling
- **Edge-anchored** — left, right (default), top, or bottom
- **CSS-only Slide Animation** — reusable `@starting-style`-based slide transition
- **Body Scroll Lock** — reference-counted, safe with multiple open drawers
- **Focus Management** — focus moves into the drawer on open, restores to the trigger on close
- **Full Customization** — header/default/footer slots, CSS tokens for styling

## Basic Usage

```vue
<template>
  <button @click="show = true">Open</button>

  <DanxDrawer v-model="show" title="Filters">
    <p>Drawer content here.</p>
  </DanxDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxDrawer } from 'danx-ui';

const show = ref(false);
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls visibility via v-model |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Edge to slide in from |
| `title` | `string` | - | Header title text |
| `size` | `number \| string` | - | Size along the sliding axis (number=vw/vh, string=as-is) |
| `persistent` | `boolean` | `false` | Prevent ESC/backdrop close |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update |
| `close` | - | Drawer closed via internal trigger (ESC, backdrop, close button) |

## Slots

| Slot | Description |
|------|--------------|
| `default` | Main content area |
| `title` | Custom title content (replaces title prop) |
| `header` | Replace the entire header |
| `footer` | Footer/actions area |

## Sides

```vue
<DanxDrawer v-model="show" side="left" title="Navigation">...</DanxDrawer>
<DanxDrawer v-model="show" side="top" title="Notifications">...</DanxDrawer>
<DanxDrawer v-model="show" side="bottom" title="Details">...</DanxDrawer>
```

## Sizing

```vue
<!-- 30% of viewport width (left/right) -->
<DanxDrawer v-model="show" :size="30" />

<!-- Fixed size -->
<DanxDrawer v-model="show" size="480px" />
```

## Persistent Drawers

```vue
<DanxDrawer v-model="show" persistent>
  <p>ESC and backdrop click are disabled.</p>
</DanxDrawer>
```

## Focus & Scroll Behavior

- On open, focus moves into the drawer (native `<dialog>` `showModal()` behavior).
- On close, focus is restored to the element that was focused before the drawer opened.
- The body's scroll is locked while any `DanxDrawer` instance is open, and only unlocked once every open drawer has closed.

## CSS Tokens

Override these tokens to customize appearance:

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-drawer-bg` | `--color-surface-elevated` | Background color |
| `--dx-drawer-border-color` | `--color-border` | Border color |
| `--dx-drawer-shadow` | `--shadow-dialog` | Box shadow |
| `--dx-drawer-padding` | `--space-lg` | Content padding |
| `--dx-drawer-padding-mobile` | `--space-md` | Padding on mobile devices |
| `--dx-drawer-size` | `24rem` | Default drawer size |
| `--dx-drawer-header-bg` | `--color-surface-sunken` | Header background color |
| `--dx-drawer-header-border` | `--color-border` | Header bottom border color |
| `--dx-drawer-title-color` | `--color-text` | Title text color |
| `--dx-drawer-content-bg` | transparent | Content area background |
| `--dx-drawer-footer-bg` | `--color-surface-sunken` | Footer background color |
| `--dx-drawer-footer-border` | `--color-border-subtle` | Footer top border color |
| `--dx-drawer-backdrop` | `--color-backdrop` | Backdrop color |
| `--dx-drawer-backdrop-blur` | `4px` | Backdrop blur radius |
| `--dx-drawer-animation-duration` | `--duration-300` | Animation duration |

## Reusable Slide Transition

The slide-in animation is implemented as a standalone CSS partial (`slide-transition.css`) keyed off a `data-side` attribute, so it can be applied to any element by adding the `.dx-slide-transition` class and a `data-side` attribute — not just `DanxDrawer`'s own box.
