# DanxFileUpload

File upload component with drag-and-drop, progress tracking, validation, and thumbnail rendering via DanxFile.

## Setup

Configure the global upload handler once at app startup:

```ts
import { setFileUploadHandler } from "danx-ui";

setFileUploadHandler(async (file, onProgress, signal) => {
  // Get a presigned URL from your API
  const { uploadUrl, fileRecord } = await api.getUploadUrl(file.name);

  // Upload with progress tracking
  await uploadFileToUrl(file, uploadUrl, { onProgress, signal });

  // Return the server file record
  return fileRecord;
});
```

## Basic Usage

### Single File

```vue
<script setup>
import { ref } from "vue";
import { DanxFileUpload } from "danx-ui";

const files = ref([]);
</script>

<template>
  <DanxFileUpload v-model="files" label="Avatar" accept="image/*" />
</template>
```

### Multiple Files

```vue
<DanxFileUpload v-model="files" multiple :max-files="10" label="Attachments" />
```

## Validation

| Prop | Description |
|------|-------------|
| `accept` | MIME types or extensions (e.g. `"image/*,.pdf"`) |
| `maxFileSize` | Maximum bytes per file |
| `maxFiles` | Maximum number of files (multi mode) |

Rejected files appear with inline error messages. No upload is attempted.

## Custom Upload Handler

Override per-instance with the `uploadFn` prop:

```vue
<DanxFileUpload v-model="files" :upload-fn="myCustomHandler" />
```

### Using uploadFileToUrl

The `uploadFileToUrl` utility handles XHR upload with progress:

```ts
import { uploadFileToUrl } from "danx-ui";

async function myHandler(file, onProgress, signal) {
  const url = await getPresignedUrl(file.name);
  const xhr = await uploadFileToUrl(file, url, {
    method: "PUT",
    headers: { "X-Custom": "value" },
    onProgress,
    signal,
  });
  return JSON.parse(xhr.response);
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `PreviewFile[]` | `[]` | v-model file array |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `accept` | `string` | — | Accepted MIME types |
| `maxFiles` | `number` | — | Max files (multi mode) |
| `maxFileSize` | `number` | — | Max bytes per file |
| `fileSize` | `DanxFileSize` | `"md"` | Thumbnail size |
| `showFilename` | `boolean` | `false` | Show filenames |
| `showFileSize` | `boolean` | `false` | Show file sizes |
| `uploadFn` | `FileUploadHandler` | — | Per-instance handler |
| `label` | `string` | — | Field label |
| `error` | `string \| boolean` | — | Error state |
| `helperText` | `string` | — | Helper text |
| `disabled` | `boolean` | `false` | Disable uploads |
| `readonly` | `boolean` | `false` | Read-only mode |
| `required` | `boolean` | `false` | Required field |

## CSS Tokens

| Token | Description |
|-------|-------------|
| `--dx-file-upload-gap` | Grid gap |
| `--dx-file-upload-add-bg` | Add card background |
| `--dx-file-upload-add-border` | Dashed border |
| `--dx-file-upload-add-border-hover` | Hover border |
| `--dx-file-upload-add-border-active` | Drag active border |
| `--dx-file-upload-add-color` | Icon/text color |
| `--dx-file-upload-add-radius` | Corner radius |
| `--dx-file-upload-dropzone-active-bg` | Drag overlay |

## Slots

| Slot | Description |
|------|-------------|
| `empty` | Custom content for the add button |
