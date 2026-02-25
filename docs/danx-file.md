# DanxFile Component

A pure thumbnail card for file preview. Shows images, videos, progress bars, error states, file-type icons, and hover actions.

## Features

- **Auto-detected states** - Progress bar appears when `file.progress` is set, error overlay when `file.error` is set
- **Image & video preview** - Renders `<img>` with configurable object-fit; video files show a play icon overlay
- **File-type icons** - Non-previewable files (PDF, ZIP, text) show MIME-based icons
- **Download action** - Auto-downloads via browser utility and emits `download` event
- **Remove with confirmation** - 2-step confirmation: click arms (3s timeout), click again confirms
- **Actions slot** - Custom action buttons in the hover overlay

## Basic Usage

```vue
<template>
  <DanxFile :file="photo" downloadable @click="openPreview" />
</template>

<script setup lang="ts">
import { DanxFile } from 'danx-ui';
import type { PreviewFile } from 'danx-ui';

const photo: PreviewFile = {
  id: '1',
  name: 'sunset.jpg',
  size: 245760,
  type: 'image/jpeg',
  url: 'https://example.com/sunset.jpg',
};
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `PreviewFile` | required | The file to display |
| `size` | `DanxFileSize` | `"md"` | Named size preset |
| `fit` | `ImageFit` | `"cover"` | Image object-fit mode |
| `showFilename` | `boolean` | `false` | Show filename below preview |
| `downloadable` | `boolean` | `false` | Show download button on hover |
| `removable` | `boolean` | `false` | Show remove button on hover |
| `disabled` | `boolean` | `false` | Suppress click event |
| `loading` | `boolean` | `false` | Show pulsing skeleton placeholder |

## Size Presets

| Size | Value | Use case |
|------|-------|----------|
| `xs` | 2rem | Inline icons, compact lists |
| `sm` | 4rem | Small list items |
| `md` | 6rem | Standard thumbnails (default) |
| `lg` | 10rem | Gallery views |
| `xl` | 16rem | Featured images |
| `xxl` | 24rem | Hero/spotlight |
| `auto` | 100% | Fill parent container |

Sizes are defined as CSS tokens (`--dx-file-size-xs` through `--dx-file-size-xxl`) and can be overridden globally or per-instance.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `PreviewFile` | Thumbnail clicked |
| `download` | `DanxFileDownloadEvent` | Download button clicked (call `preventDefault()` to suppress) |
| `remove` | `PreviewFile` | Remove confirmed (after 2-step) |

## Slots

| Slot | Description |
|------|-------------|
| `actions` | Custom action buttons in the hover overlay (top-right) |

## PreviewFile Type

```typescript
interface PreviewFile {
  id: string;
  name: string;
  size: number;
  type: string;                            // MIME type
  url: string;                             // File URL
  blobUrl?: string;                        // Temporary blob URL during upload
  progress?: number | null;                // 0-100. Non-null and < 100 = in progress
  thumb?: { url: string };                 // Thumbnail URL
  optimized?: { url: string };             // Optimized version URL
  children?: PreviewFile[];                // Child variants (transcodes, PDF pages)
  meta?: Record<string, unknown>;          // Application/business metadata
  exif?: Record<string, unknown>;          // Raw EXIF/camera data
  statusMessage?: string;                  // Override progress text
  error?: string;                          // Error message (shows error state)
}
```

## Visual States (Priority Order)

1. **Error** - `file.error` is set: red overlay with warning icon and message
2. **Progress** - `file.progress` non-null and < 100: progress bar with text
3. **Image** - Image MIME with thumb/url: `<img>` with object-fit
4. **Video** - Video MIME with thumb/url: `<img>` with play icon overlay
5. **File-type icon** - Non-previewable: MIME-based icon + filename
6. **Empty** - No URL, no thumb, no progress: generic document icon

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-file-thumb-bg` | `var(--color-surface-sunken)` | Background color |
| `--dx-file-thumb-border-radius` | `var(--radius-component)` | Corner radius |
| `--dx-file-thumb-overlay-bg` | `rgb(0 0 0 / 0.5)` | Hover overlay |
| `--dx-file-thumb-action-color` | `white` | Action button color |
| `--dx-file-thumb-play-size` | `2.5rem` | Play icon size |
| `--dx-file-thumb-progress-bg` | `var(--color-interactive)` | Progress bar fill |
| `--dx-file-thumb-progress-track` | `rgb(255 255 255 / 0.3)` | Progress track |
| `--dx-file-thumb-progress-text` | `white` | Progress text |
| `--dx-file-thumb-error-bg` | `rgb(239 68 68 / 0.85)` | Error overlay |
| `--dx-file-thumb-error-color` | `white` | Error text/icon |
| `--dx-file-thumb-icon-color` | `var(--color-text-muted)` | File-type icon |
| `--dx-file-size-xs` | `2rem` | Extra-small size |
| `--dx-file-size-sm` | `4rem` | Small size |
| `--dx-file-size-md` | `6rem` | Medium size |
| `--dx-file-size-lg` | `10rem` | Large size |
| `--dx-file-size-xl` | `16rem` | Extra-large size |
| `--dx-file-size-xxl` | `24rem` | Double extra-large |

## File Helpers

Exported pure functions for working with files:

| Function | Description |
|----------|-------------|
| `resolveFileUrl(file)` | Returns best URL: optimized > url > blobUrl |
| `resolveThumbUrl(file)` | Returns best thumbnail: thumb > optimized > url > blobUrl |
| `isImage(file)` | True if MIME starts with `image/` |
| `isVideo(file)` | True if MIME starts with `video/` |
| `isPdf(file)` | True if MIME is `application/pdf` |
| `isPreviewable(file)` | True if image or video |
| `isInProgress(file)` | True if progress is non-null and < 100 |
| `hasChildren(file)` | True if children array is non-empty |
| `fileTypeIcon(file)` | Returns icon name for file's MIME type |
| `formatFileSize(bytes)` | Human-readable size (e.g., "1.5 MiB") |
