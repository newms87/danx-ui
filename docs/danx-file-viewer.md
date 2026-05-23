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
| `childrenLabel` | `string` | `"Children"` | Label for the children nav button |
| `defaultSidebar` | `boolean` | `false` | **SEED** — initial sidebar flag when no localStorage preference exists. User can override via the toolbar |
| `defaultContinuous` | `boolean` | `false` | **SEED** — initial continuous-scroll flag when no localStorage preference exists. User can override |
| `defaultZoom` | `number` | `100` | **SEED** — zoom percent when no localStorage preference exists |
| `sidebar` | `boolean` | `undefined` | **LOCKED** — pins the sidebar state. Bypasses localStorage, hides the sidebar toggle, and the `layoutToggles` watcher will not clear it |
| `continuous` | `boolean` | `undefined` | **LOCKED** — pins the continuous-scroll state. Bypasses localStorage, hides the continuous toggle, watcher will not clear it |
| `zoom` | `number` | `undefined` | **LOCKED** — pins the zoom percent. Bypasses localStorage, hides zoom controls and disables zoom gestures; Ctrl+drag free pan still works |
| `layoutToggles` | `LayoutToggle[]` | `[]` | Toggle buttons rendered in the toolbar — subset of `["sidebar", "continuous"]`. Empty hides the group. A locked layout is excluded automatically |
| `zoomable` | `boolean` | `true` | Enable Photoshop-style zoom + pan EVENTS (Ctrl+wheel / Ctrl+drag free pan / Ctrl+/-/0 / dblclick reset). On by default — pass `false` to opt out. Controls only the gestures, not the slider |
| `zoomControls` | `boolean` | `false` | Show the zoom slider toolbar. Gestures work regardless (they follow `zoomable`); this only toggles the visible slider. No effect when `zoom` is locked |
| `storageKey` | `string` | `"danx-file-viewer"` | localStorage namespace for sidebar / continuous / zoom / panel widths |
| `showToolbar` | `boolean` | auto | Override the auto-show toolbar (auto = on when any control is opted in) |

## Layout Toggles

`DanxFileViewer` exposes two independent boolean flags that compose into four visual modes — pick any combination:

| `sidebar` | `continuous` | Result |
|-----------|--------------|--------|
| off | off | Carousel slide with bottom thumbnail strip (default, original behavior) |
| on  | off | Carousel slide with left-hand vertical strip (PDF reader) |
| off | on  | Virtualized scrolling column with bottom strip |
| on  | on  | Virtualized scrolling column with left-hand vertical strip |

The toolbar renders them as a multi-select button group; only the toggles listed in `layoutToggles` appear. Preferences (each flag + zoom + panel widths) persist to `localStorage` under `storageKey`. Read order:

1. `localStorage[storageKey + "-sidebar"]` / `-continuous` / `-zoom`
2. `defaultSidebar` / `defaultContinuous` / `defaultZoom` props
3. Built-in defaults (`false` / `false` / `100`)

A stored flag that is no longer in `layoutToggles` is cleared on mount so the consumer can lock the viewer to a subset.

```vue
<DanxFileViewer
  :file="mainFile"
  :related-files="relatedFiles"
  :layout-toggles="['sidebar', 'continuous']"
  zoomable
  storage-key="my-document-viewer"
/>
```

### Seed vs Locked props

Two prop families control sidebar / continuous / zoom — choose by who owns the value:

| Family | Props | Semantics |
|--------|-------|-----------|
| **Seed** | `defaultSidebar`, `defaultContinuous`, `defaultZoom` | Starting value when localStorage is empty. The user can then flip it via the toolbar and the choice persists. |
| **Locked** | `sidebar`, `continuous`, `zoom` | Authoritative. When provided, the state is pinned to the prop — localStorage is bypassed (no read, no write), the toggle button / zoom controls are hidden, the `layoutToggles` watcher will not clear it, and the value reactively follows prop changes. |

A locked prop is the only way to **force** a layout on while hiding its toggle. `:layout-toggles="[]"` plus seed props is not enough — the watcher clears seed flags that are absent from `layoutToggles`. Locked props are exempt from that watcher.

```vue
<!-- Force a continuous PDF reader with a sidebar at 60% zoom — no toggles, no zoom controls. -->
<DanxFileViewer
  :file="mainFile"
  :related-files="relatedFiles"
  continuous
  sidebar
  :zoom="60"
  zoomable
  storage-key="my-document-viewer"
/>
```

## Zoom + Pan

Zoom + pan gestures are **on by default** (`zoomable`, pass `false` to opt out). In paged mode the active slide is wrapped in a `DanxZoomable`; in continuous mode each item is scaled and the column free-pans via CSS transform. Both expose:

| Gesture | Effect |
|---------|--------|
| Ctrl/Cmd + scroll wheel | Zoom in / out |
| Ctrl/Cmd + drag | Free pan (moves the content anywhere at any zoom — not clamped to bounds) |
| Ctrl/Cmd + `+` / `=` / `-` / `_` | Zoom step in / out |
| Ctrl/Cmd + `0` | Reset zoom to 100% |
| Dblclick | Reset zoom + pan |

The drag + modifier-key listeners run in the capture phase, so pan and the grab cursor work even inside containers that stop event propagation (e.g. `DanxDialog`).

The zoom slider toolbar is a **separate opt-in** (`zoomControls`, default off) — the gestures above work whether or not the slider is shown. When shown, it renders a slider + percent readout + reset button bound to the same zoom model. Zoom is preserved across slide changes; pan resets when the active file or layout changes (different content geometry).

`DanxZoomable` and `DanxZoomControls` are exported standalone — see `docs/zoomable.md`.

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
