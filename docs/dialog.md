# Dialog Component

A fully declarative dialog component built on the native `<dialog>` element.

## Features

- **Native `<dialog>`** - Built-in focus trap, ESC handling, ARIA support
- **100% Declarative** - Controlled via v-model, no imperative methods
- **CSS-only Animation** - Smooth fade + scale using `@starting-style`
- **Animated Size Changes** - Smooth transitions when content changes size
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
| `independent` | `boolean` | `false` | Opt out of dialog stacking |
| `returnOnClose` | `boolean` | `true` | Reveal previous dialog on close |

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
  --dx-dialog-bg: #fafafa;
  --dx-dialog-border-radius: 1rem;
}

/* Scoped override */
.my-dialog {
  --dx-dialog-title-color: #7c3aed;
  --dx-dialog-button-primary-bg: #7c3aed;
}
```

### Available Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-dialog-bg` | `--color-surface` | Background |
| `--dx-dialog-border-color` | `--color-border` | Border color |
| `--dx-dialog-border-radius` | `--radius-dialog` | Corner radius |
| `--dx-dialog-shadow` | `--shadow-dialog` | Box shadow |
| `--dx-dialog-padding` | `--space-lg` | Content padding |
| `--dx-dialog-gap` | `--space-md` | Header/content/footer gap |
| `--dx-dialog-title-color` | `--color-text` | Title color |
| `--dx-dialog-title-size` | `--text-xl` | Title font size |
| `--dx-dialog-subtitle-color` | `--color-text-muted` | Subtitle color |
| `--dx-dialog-backdrop` | `--color-backdrop` | Backdrop color |
| `--dx-dialog-backdrop-blur` | `4px` | Backdrop blur radius |
| `--dx-dialog-button-primary-bg` | `--color-interactive` | Confirm button bg |
| `--dx-dialog-button-secondary-bg` | transparent | Close button bg |

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

## Dialog Navigation Stack

When content inside a dialog needs to open another dialog, stacking dialogs creates UX problems (multiple backdrops, different sizes, z-index wars). DanxDialog includes a built-in navigation stack that reuses the same visual space with breadcrumb navigation.

### How It Works

1. When a titled DanxDialog opens while another is already open, it registers on a global stack
2. Only the top-of-stack dialog is visible; others are hidden (preserving scroll position and form state)
3. Breadcrumbs appear in the header showing all stacked dialog titles
4. Clicking a breadcrumb navigates to that dialog, closing all above it
5. Closing the active dialog reveals the previous one

### Basic Stacking

```vue
<template>
  <DanxDialog v-model="showFirst" title="First Dialog">
    <p>Content here</p>
    <button @click="showSecond = true">Open Second</button>
  </DanxDialog>

  <DanxDialog v-model="showSecond" title="Second Dialog">
    <p>Breadcrumbs automatically appear showing: First Dialog / Second Dialog</p>
  </DanxDialog>
</template>
```

### Independent Dialogs

Use `independent` to opt a dialog out of the stack entirely:

```vue
<DanxDialog v-model="show" title="Not Stacked" independent>
  <p>This dialog won't participate in the navigation stack.</p>
</DanxDialog>
```

Dialogs without a `title` prop are automatically independent (no breadcrumb label possible).

### Close Behavior

By default, closing a stacked dialog reveals the previous one. Set `return-on-close` to `false` to tear down the entire stack when closing:

```vue
<DanxDialog v-model="show" title="Final Step" :return-on-close="false">
  <p>Closing this dialog closes all stacked dialogs.</p>
</DanxDialog>
```

### useDialogStack Composable

For programmatic access to the stack:

```typescript
import { useDialogStack } from 'danx-ui';

const { stack, stackSize, navigateTo, reset } = useDialogStack();
```

### Breadcrumb Styling

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-dialog-breadcrumb-color` | `--color-text-muted` | Inactive breadcrumb text |
| `--dx-dialog-breadcrumb-active-color` | `--color-text` | Active breadcrumb text |
| `--dx-dialog-breadcrumb-hover-color` | `--color-text` | Hover state |
| `--dx-dialog-breadcrumb-separator-color` | `--color-text-muted` | Separator color |
