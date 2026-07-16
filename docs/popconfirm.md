# Popconfirm Component

A lightweight inline confirmation popover — wraps `DanxPopover` with a title/message and
confirm/cancel buttons. A packaged alternative to a full `DanxDialog` confirm for common
destructive-action patterns.

## Features

- **Anchored Trigger** - Opens on click of the slotted trigger, no manual v-model wiring required
- **Title & Message** - Optional title and message content
- **Semantic Buttons** - Confirm/cancel buttons with configurable variants (danger by default)
- **Async Confirm** - When the confirm handler returns a promise, shows a loading spinner on the
  confirm button and keeps the panel open until the promise settles
- **Dismissal** - Closes on cancel button, Escape key, and outside-click (inherited from
  `DanxPopover`)

## Basic Usage

```vue
<script setup lang="ts">
import { DanxButton, DanxPopconfirm } from 'danx-ui';

function remove() {
  // delete the item
}
</script>

<template>
  <DanxPopconfirm title="Delete item?" message="This action cannot be undone." @confirm="remove">
    <template #trigger>
      <DanxButton variant="danger" icon="trash">Delete</DanxButton>
    </template>
  </DanxPopconfirm>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls visibility via v-model (optional — the trigger toggles it on click) |
| `title` | `string` | - | Title shown above the message |
| `message` | `string` | - | Confirmation body text |
| `confirmText` | `string` | `"Confirm"` | Confirm button label |
| `cancelText` | `string` | `"Cancel"` | Cancel button label |
| `confirmVariant` | `VariantType` | `"danger"` | Confirm button variant |
| `cancelVariant` | `VariantType` | `""` | Cancel button variant |
| `placement` | `PopoverPlacement` | `"bottom"` | Panel placement relative to trigger |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `confirm` | none | Fired when the confirm button is clicked. May return a promise (see Async Confirm below). |
| `cancel` | none | Fired on cancel button click, Escape, or outside-click. |

## Slots

| Slot | Description |
|------|-------------|
| `trigger` | Inline anchor element the panel positions against |

## Async Confirm

Bind `@confirm` to an async function that returns a promise. While the promise is pending, the
confirm button shows a loading spinner (and the cancel button is disabled). The panel stays open
until the promise settles: on success it closes automatically; on rejection it stays open (the
error propagates) so the user can retry.

```vue
<script setup lang="ts">
import { DanxButton, DanxPopconfirm } from 'danx-ui';

async function publish() {
  await fetch('/api/publish', { method: 'POST' });
}
</script>

<template>
  <DanxPopconfirm message="Publish these changes?" confirm-text="Publish" confirm-variant="success" @confirm="publish">
    <template #trigger>
      <DanxButton variant="success">Publish</DanxButton>
    </template>
  </DanxPopconfirm>
</template>
```

## Dismissal

The panel closes — firing `cancel` — when:

- The cancel button is clicked
- The Escape key is pressed
- A click occurs outside the trigger and panel

Confirming (including a pending async confirm that later resolves) does not fire `cancel`.

## Styling

### CSS Token Overrides

```css
.my-popconfirm {
  --dx-popconfirm-padding: 1.5rem;
  --dx-popconfirm-width: 20rem;
}
```

```vue
<DanxPopconfirm class="my-popconfirm" message="Are you sure?" @confirm="handleConfirm">
  <template #trigger><button>Open</button></template>
</DanxPopconfirm>
```

### Available Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-popconfirm-padding` | `--space-md` | Panel content padding |
| `--dx-popconfirm-gap` | `--space-sm` | Vertical gap between title/message/actions |
| `--dx-popconfirm-width` | `16rem` | Panel max width |
| `--dx-popconfirm-title-weight` | `--font-semibold` | Title font weight |
| `--dx-popconfirm-message-color` | `--color-text-muted` | Message text color |

Panel appearance (background, border, shadow) comes from the underlying `DanxPopover` tokens
(`--dx-popover-*`).
