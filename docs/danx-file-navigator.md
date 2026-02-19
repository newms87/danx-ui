# DanxFileNavigator Component

A responsive standalone file viewer with carousel navigation, metadata panel, and keyboard support. Fills its container and can be embedded anywhere.

## Features

- **Responsive layout** - CSS container queries adapt to container size
- **Carousel navigation** - Arrow buttons, keyboard (ArrowLeft/Right), thumbnail strip
- **Metadata panel** - YAML-formatted metadata with overlay and docked modes
- **Children menu** - Popover listing child files (transcodes, PDF pages)
- **Download** - Auto-downloads via browser utility and emits event
- **Keyboard navigation** - ArrowLeft/Right on focused container
- **Completely independent** - No dependency on DanxFile; parent wires them together

## Basic Usage

```vue
<template>
  <div style="width: 600px; height: 400px">
    <DanxFileNavigator :file="mainFile" downloadable />
  </div>
</template>

<script setup lang="ts">
import { DanxFileNavigator } from 'danx-ui';
import type { PreviewFile } from 'danx-ui';

const mainFile: PreviewFile = {
  id: '1',
  name: 'photo.jpg',
  size: 524288,
  type: 'image/jpeg',
  url: 'https://example.com/photo.jpg',
};
</script>
```

## With DanxFile in a Dialog

```vue
<template>
  <DanxFile :file="mainFile" @click="showNav = true" />

  <DanxDialog v-model="showNav" :width="90" :height="90">
    <DanxFileNavigator
      :file="mainFile"
      v-model:file-in-preview="activeFile"
      :related-files="relatedFiles"
      downloadable
      closable
      @close="showNav = false"
      @load-children="fetchChildren"
    />
  </DanxDialog>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `PreviewFile` | required | The main/anchor file |
| `relatedFiles` | `PreviewFile[]` | `[]` | Related files for carousel |
| `downloadable` | `boolean` | `false` | Show download button |
| `closable` | `boolean` | `false` | Show close button |

## Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `fileInPreview` | `PreviewFile \| null` | `null` | Currently active file |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:fileInPreview` | `PreviewFile \| null` | Active file changed |
| `download` | `PreviewFile` | Download clicked |
| `loadChildren` | `PreviewFile` | Children need loading |
| `close` | - | Close button clicked |

## Slots

| Slot | Description |
|------|-------------|
| `header-actions` | Extra buttons in the header bar |

## Composables

### useDanxFileNavigator

Navigation state management for the file viewer.

```typescript
const {
  currentFile,    // Ref<PreviewFile> - currently displayed file
  currentIndex,   // Ref<number> - index in allFiles
  allFiles,       // Ref<PreviewFile[]> - deduplicated file + relatedFiles
  hasNext,        // Ref<boolean>
  hasPrev,        // Ref<boolean>
  slideLabel,     // Ref<string> - e.g. "1 / 3"
  next,           // () => void
  prev,           // () => void
  goTo,           // (file: PreviewFile) => void
  childStack,     // Ref<PreviewFile[]> - parent file stack
  diveIntoChild,  // (child: PreviewFile) => void
  backFromChild,  // () => void
  hasParent,      // Ref<boolean>
  reset,          // () => void
} = useDanxFileNavigator({ file, relatedFiles, onNavigate });
```

### useDanxFileMetadata

Metadata display state with localStorage-persisted mode.

```typescript
const {
  mode,           // Ref<MetadataMode> - "overlay" | "docked"
  setMode,        // (mode: MetadataMode) => void
  formatMeta,     // (file: PreviewFile) => Record<string, unknown>
  metaCount,      // (file: PreviewFile) => number
} = useDanxFileMetadata();
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-file-nav-bg` | `var(--color-surface)` | Viewer background |
| `--dx-file-nav-header-bg` | `var(--color-surface-sunken)` | Header background |
| `--dx-file-nav-header-color` | `var(--color-text)` | Header text |
| `--dx-file-nav-arrow-size` | `2rem` | Arrow button size |
| `--dx-file-nav-arrow-color` | `white` | Arrow icon color |
| `--dx-file-nav-arrow-bg` | `rgb(0 0 0 / 0.4)` | Arrow background |
| `--dx-file-nav-counter-color` | `var(--color-text-muted)` | Counter text |
| `--dx-file-strip-gap` | `0.5rem` | Strip thumbnail gap |
| `--dx-file-strip-thumb-size` | `3rem` | Strip thumbnail size |
| `--dx-file-strip-active-border` | `var(--color-interactive)` | Active border |
| `--dx-file-strip-bg` | `var(--color-surface-sunken)` | Strip background |
| `--dx-file-meta-bg` | `var(--color-surface-sunken)` | Metadata background |
| `--dx-file-meta-width` | `20rem` | Docked metadata width |
| `--dx-file-meta-border-color` | `var(--color-border)` | Metadata border |
| `--dx-file-children-bg` | `var(--color-surface-elevated)` | Children menu bg |
| `--dx-file-children-thumb-size` | `2.5rem` | Children thumbnail size |

## Responsive Behavior

The navigator uses CSS container queries to adapt:

| Container width | Behavior |
|----------------|----------|
| `< 480px` | Icon-only header buttons |
| `480px - 768px` | Compact header, strip visible |
| `> 768px` | Full header with all features |
