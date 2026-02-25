# DanxFileViewer Component

A responsive standalone file viewer with carousel navigation, metadata panel, and keyboard support. Fills its container and can be embedded anywhere.

## Features

- **Virtual carousel** - Renders current ±2 slides with opacity transitions for smooth navigation
- **Responsive layout** - CSS container queries adapt to container size
- **Carousel navigation** - Arrow buttons, keyboard (ArrowLeft/Right), thumbnail strip
- **Standalone close button** - 4rem absolute top-right button (z-30) when `closable` is true
- **Metadata panel** - YAML-formatted metadata with overlay and docked modes (40% width, 300-600px range)
- **Metadata badge** - Info count badge next to the metadata button
- **Children menu** - Popover listing child files (transcodes, PDF pages)
- **Raw image thumbnails** - Strip uses `<img>` directly for performance (no DanxFile overhead)
- **Download** - Auto-downloads via browser utility and emits event
- **Keyboard navigation** - ArrowLeft/Right on focused container
- **Completely independent** - No dependency on DanxFile; parent wires them together

## Basic Usage

```vue
<template>
  <div style="width: 600px; height: 400px">
    <DanxFileViewer :file="mainFile" downloadable />
  </div>
</template>

<script setup lang="ts">
import { DanxFileViewer } from 'danx-ui';
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
    <DanxFileViewer
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
| `closable` | `boolean` | `false` | Show standalone close button (top-right) |

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

### useDanxFileViewer

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
} = useDanxFileViewer({ file, relatedFiles, onNavigate });
```

### useDanxFileMetadata

Metadata display state with localStorage-persisted mode.

```typescript
const {
  mode,           // Ref<MetadataMode> - "overlay" | "docked"
  setMode,        // (mode: MetadataMode) => void
  formatMeta,     // (file: PreviewFile) => Record<string, unknown>
  metaCount,      // (file: PreviewFile) => number
  formatExif,     // (file: PreviewFile) => Record<string, unknown>
  exifCount,      // (file: PreviewFile) => number
  hasAnyInfo,     // (file: PreviewFile) => boolean
} = useDanxFileMetadata();
```

### useVirtualCarousel

Virtual slide buffer for smooth carousel transitions. Renders current ±2 slides.

```typescript
const { visibleSlides } = useVirtualCarousel(files, currentIndex);
// visibleSlides: Ref<VirtualSlide[]>
// Each slide: { file: PreviewFile, index: number, isActive: boolean }
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-file-viewer-bg` | `var(--color-surface)` | Viewer background |
| `--dx-file-viewer-header-bg` | `var(--color-surface-sunken)` | Header background |
| `--dx-file-viewer-header-color` | `var(--color-text)` | Header text |
| `--dx-file-viewer-header-opacity` | `0.9` | Header resting opacity |
| `--dx-file-viewer-header-padding` | `1rem` | Header horizontal padding |
| `--dx-file-viewer-close-btn-size` | `4rem` | Standalone close button size |
| `--dx-file-viewer-slide-transition` | `300ms` | Slide opacity transition |
| `--dx-file-viewer-arrow-size` | `2rem` | Arrow icon size |
| `--dx-file-viewer-arrow-color` | `white` | Arrow icon color |
| `--dx-file-viewer-arrow-bg` | `rgb(0 0 0 / 0.4)` | Arrow background |
| `--dx-file-viewer-arrow-bg-hover` | `rgb(0 0 0 / 0.6)` | Arrow hover bg |
| `--dx-file-viewer-counter-color` | `var(--color-text-muted)` | Counter text |
| `--dx-file-strip-gap` | `0.5rem` | Strip thumbnail gap |
| `--dx-file-strip-thumb-size` | `4rem` | Strip thumbnail size |
| `--dx-file-strip-active-border` | `var(--color-interactive)` | Active border |
| `--dx-file-strip-bg` | `var(--color-surface-sunken)` | Strip background |
| `--dx-file-strip-inactive-opacity` | `0.6` | Inactive thumb opacity |
| `--dx-file-strip-active-scale` | `1.1` | Active thumb scale |
| `--dx-file-meta-bg` | `var(--color-surface-sunken)` | Metadata background |
| `--dx-file-meta-width` | `40%` | Metadata panel width |
| `--dx-file-meta-max-width` | `37.5rem` | Metadata max width |
| `--dx-file-meta-min-width` | `18.75rem` | Metadata min width |
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
