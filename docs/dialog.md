# Dialog Component

A fully declarative dialog component built on the native `<dialog>` element.

## Features

- **Native `<dialog>`** - Built-in focus trap, ESC handling, ARIA support
- **100% Declarative** - Controlled via v-model, no imperative methods
- **CSS-only Animation** - Smooth fade + scale using `@starting-style`
- **Flexible Sizing** - Number (viewport units) or string (any CSS value)
- **Optional Buttons** - Clean slate by default, opt-in close/confirm
- **Full Customization** - Slots for every section, CSS tokens for styling

## Basic Usage

```vue
<template>
  <button @click="show = true">Open</button>

  <DanxDialog v-model="show" title="Hello World">
    <p>Dialog content here.</p>
  </DanxDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxDialog } from 'danx-ui';

const show = ref(false);
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls visibility via v-model |
| `title` | `string` | - | Header title text |
| `subtitle` | `string` | - | Header subtitle text |
| `width` | `number \| string` | - | Width (number=vw, string=as-is) |
| `height` | `number \| string` | - | Height (number=vh, string=as-is) |
| `persistent` | `boolean` | `false` | Prevent ESC/backdrop close |
| `closeButton` | `boolean \| string` | `false` | Show close button |
| `confirmButton` | `boolean \| string` | `false` | Show confirm button |
| `isSaving` | `boolean` | `false` | Loading state for confirm |
| `disabled` | `boolean` | `false` | Disable confirm button |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update |
| `close` | - | Dialog closed via internal trigger |
| `confirm` | - | Confirm button clicked |

### Close Event Behavior

- **Internal close** (ESC, backdrop click, close button): Emits both `close` and `update:modelValue(false)`
- **External close** (parent sets v-model to false): No events emitted

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main content area |
| `title` | Custom title (replaces title prop) |
| `subtitle` | Custom subtitle (replaces subtitle prop) |
| `actions` | Replace entire footer |
| `close-button` | Replace close button only |
| `confirm-button` | Replace confirm button only |

## Sizing

### Viewport-Relative (Number)

Numbers are converted to viewport units:

```vue
<!-- 80vw × 60vh -->
<DanxDialog :width="80" :height="60" />

<!-- Full screen -->
<DanxDialog :width="100" :height="100" />
```

### Fixed Size (String)

Strings are used as-is:

```vue
<!-- Fixed pixels -->
<DanxDialog width="400px" height="300px" />

<!-- rem units -->
<DanxDialog width="30rem" />
```

## Button Patterns

### No Buttons (Default)

```vue
<DanxDialog v-model="show" title="Info">
  <p>Just information, no actions needed.</p>
</DanxDialog>
```

### Close Only

```vue
<DanxDialog v-model="show" title="Notice" close-button>
  <p>Click Close to dismiss.</p>
</DanxDialog>
```

### Confirm Dialog

```vue
<DanxDialog
  v-model="show"
  title="Confirm Action"
  close-button="Cancel"
  confirm-button="Delete"
  @confirm="handleDelete"
>
  <p>Are you sure you want to delete this item?</p>
</DanxDialog>
```

### With Loading State

```vue
<DanxDialog
  v-model="show"
  title="Save Changes"
  close-button
  confirm-button="Save"
  :is-saving="isSaving"
  @confirm="save"
>
  <p>Your changes will be saved.</p>
</DanxDialog>
```

## Persistent Mode

Prevent closing via ESC or backdrop click:

```vue
<DanxDialog v-model="show" title="Important" persistent close-button>
  <p>You must click the button to close this.</p>
</DanxDialog>
```

## Custom Content

### Using Slots

```vue
<DanxDialog v-model="show">
  <template #title>
    <div class="flex items-center gap-2">
      <Icon name="warning" />
      <span>Warning</span>
    </div>
  </template>

  <p>Custom title with icon.</p>

  <template #actions>
    <button @click="show = false">Custom Close</button>
  </template>
</DanxDialog>
```

## Styling

### CSS Token Overrides

```css
/* Global override */
:root {
  --dialog-bg: #fafafa;
  --dialog-border-radius: 1rem;
}

/* Scoped override */
.my-dialog {
  --dialog-title-color: #7c3aed;
  --dialog-button-primary-bg: #7c3aed;
}
```

### Available Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dialog-bg` | `--color-surface` | Background |
| `--dialog-border-color` | `--color-border` | Border color |
| `--dialog-border-radius` | `--radius-dialog` | Corner radius |
| `--dialog-shadow` | `--shadow-dialog` | Box shadow |
| `--dialog-padding` | `--space-lg` | Content padding |
| `--dialog-gap` | `--space-md` | Header/content/footer gap |
| `--dialog-title-color` | `--color-text` | Title color |
| `--dialog-title-size` | `--text-xl` | Title font size |
| `--dialog-subtitle-color` | `--color-text-muted` | Subtitle color |
| `--dialog-backdrop` | `--color-backdrop` | Backdrop color |
| `--dialog-button-primary-bg` | `--color-interactive` | Confirm button bg |
| `--dialog-button-secondary-bg` | transparent | Close button bg |

## useDialog Composable

For managing dialog state separately:

```typescript
import { useDialog } from 'danx-ui';

const { isOpen, open, close, toggle } = useDialog();
```

```vue
<template>
  <button @click="open">Open</button>
  <DanxDialog v-model="isOpen" title="Managed">
    <button @click="close">Close</button>
  </DanxDialog>
</template>
```

The composable can also be used with native `<dialog>` elements for custom implementations.
