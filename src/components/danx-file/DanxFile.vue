<!--
/**
 * DanxFile - Universal File Renderer
 *
 * Renders files in two modes:
 * - **thumb** (default): Thumbnail card with preview image, play icon overlay
 *   for video, file-type icons, progress bar, and error state.
 * - **preview**: Full-size interactive content — video with controls,
 *   audio player, text/markdown rendered via MarkdownEditor, or
 *   full-size image with object-fit: contain.
 *
 * Visual states are rendered in priority order:
 * 1. Error (file.error) — red overlay with warning icon and message
 * 2. Progress (file.progress non-null and < 100) — progress bar overlay
 * 3. Preview mode: video → `<video controls>`, image → full-size `<img>`,
 *    text → MarkdownEditor readonly
 * 4. Thumb mode: thumbnail `<img>`, video adds play icon overlay
 * 5. Audio — `<audio controls>` in both modes
 * 6. File-type icon — MIME-based icon + filename (no renderable URL)
 *
 * Computed state (URL resolution, visibility flags, text content) is
 * managed by the `useDanxFile` composable. Overlay sections (progress,
 * error, actions) are delegated to internal sub-components.
 *
 * @props
 *   file: PreviewFile - The file to display (required)
 *   mode?: DanxFileMode - Display mode: "thumb" or "preview" (default: "thumb")
 *   size?: DanxFileSize - Named size preset (default: "md")
 *   fit?: ImageFit - Image object-fit (default: "cover")
 *   showFilename?: boolean - Show filename overlay at bottom (default: false)
 *   showFileSize?: boolean - Show file size beside filename (default: false)
 *   downloadable?: boolean - Show download button on hover (default: false)
 *   removable?: boolean - Show remove button on hover (default: false)
 *   disabled?: boolean - Suppress click event (default: false)
 *   loading?: boolean - Show pulsing skeleton placeholder (default: false)
 *
 * @emits
 *   click(file) - Thumbnail clicked
 *   download(event) - Download button clicked (preventable)
 *   remove(file) - Remove confirmed after 2-step confirmation
 *
 * @slots
 *   actions - Custom action buttons in the hover overlay (top-right)
 *
 * @tokens
 *   --dx-file-thumb-bg, --dx-file-thumb-border-radius,
 *   --dx-file-thumb-overlay-bg, --dx-file-thumb-action-color,
 *   --dx-file-thumb-action-bg-hover, --dx-file-thumb-action-download-bg,
 *   --dx-file-thumb-action-download-bg-hover, --dx-file-thumb-action-remove-bg,
 *   --dx-file-thumb-action-remove-bg-hover, --dx-file-thumb-play-size,
 *   --dx-file-thumb-progress-track, --dx-file-thumb-progress-text,
 *   --dx-file-thumb-error-bg, --dx-file-thumb-error-color,
 *   --dx-file-thumb-icon-color, --dx-file-thumb-fit,
 *   --dx-file-thumb-filename-color, --dx-file-thumb-filesize-color,
 *   --dx-file-size-xs through --dx-file-size-xxl
 *
 * @example
 *   <DanxFile :file="photo" downloadable @click="openPreview" />
 *   <DanxFile :file="uploadingFile" />
 *   <DanxFile :file="video" mode="preview" size="auto" />
 */
-->

<script setup lang="ts">
import { DanxIcon } from "../icon";
import { DanxSkeleton } from "../skeleton";
import { MarkdownEditor } from "../markdown-editor";
import DanxFileActions from "./DanxFileActions.vue";
import DanxFileError from "./DanxFileError.vue";
import DanxFileProgress from "./DanxFileProgress.vue";
import { useDanxFile } from "./useDanxFile";
import type { DanxFileEmits, DanxFileProps, DanxFileSlots } from "./types";

const props = withDefaults(defineProps<DanxFileProps>(), {
  mode: "thumb",
  size: "md",
  fit: "cover",
  showFilename: false,
  showFileSize: false,
  downloadable: false,
  removable: false,
  disabled: false,
  loading: false,
});

const emit = defineEmits<DanxFileEmits>();

defineSlots<DanxFileSlots>();

const {
  sizeClass,
  isXsSize,
  isCompactDisplay,
  originalUrl,
  previewImageUrl,
  thumbImageUrl,
  showPreviewVideo,
  showPreviewImage,
  showAudio,
  showPreviewText,
  textContent,
  showThumbImage,
  showThumbPlayIcon,
  showTypeIcon,
  showProgress,
  showError,
  iconName,
  fileSizeText,
  showFooter,
  fitStyle,
} = useDanxFile(props);

function onClick() {
  if (!props.disabled) {
    emit("click", props.file);
  }
}
</script>

<template>
  <div
    class="danx-file"
    :class="[sizeClass, { 'danx-file--disabled': disabled }]"
    :style="fitStyle"
    role="button"
    :tabindex="disabled ? -1 : 0"
    @click="onClick"
    @keydown.enter="onClick"
  >
    <!-- Preview wrapper: holds all visual content and absolute overlays -->
    <div class="danx-file__preview">
      <!-- Loading skeleton -->
      <DanxSkeleton
        v-if="loading"
        animation="wave"
        aria-label="Loading file"
        style="--dx-skeleton-height: 100%"
      />

      <!-- Preview mode: Video player -->
      <video v-else-if="showPreviewVideo" class="danx-file__video" controls :src="originalUrl" />

      <!-- Preview mode: Full-size image (optimized > original for images) -->
      <img
        v-else-if="showPreviewImage"
        class="danx-file__image danx-file__image--preview"
        :src="previewImageUrl"
        :alt="file.name"
      />

      <!-- Preview mode: Text/markdown content -->
      <div v-else-if="showPreviewText" class="danx-file__text-preview">
        <MarkdownEditor :model-value="textContent" readonly hide-footer class="h-full" />
      </div>

      <!-- Thumb mode: Thumbnail image (thumb > optimized > original for images) -->
      <img
        v-else-if="showThumbImage"
        class="danx-file__image"
        :src="thumbImageUrl"
        :alt="file.name"
        loading="lazy"
      />

      <!-- Audio preview (both modes) -->
      <audio v-else-if="showAudio" class="danx-file__audio" controls :src="originalUrl" />

      <!-- Thumb mode: Video play icon overlay -->
      <div v-if="showThumbPlayIcon && !showProgress && !showError" class="danx-file__play-icon">
        <DanxIcon icon="play" />
      </div>

      <!-- File-type icon for non-previewable files -->
      <div v-if="showTypeIcon && !loading" class="danx-file__type-icon">
        <DanxIcon :icon="iconName" />
        <span v-if="!isCompactDisplay" class="danx-file__type-icon-name">{{ file.name }}</span>
      </div>

      <!-- Progress overlay -->
      <DanxFileProgress v-if="showProgress" :file="file" :is-xs-size="isXsSize" />

      <!-- Error overlay -->
      <DanxFileError v-if="showError" :file="file" :is-compact-display="isCompactDisplay" />

      <!-- Hover actions -->
      <DanxFileActions
        v-if="downloadable || removable || $slots.actions"
        :file="file"
        :downloadable="downloadable"
        :removable="removable"
        @download="emit('download', $event)"
        @remove="emit('remove', $event)"
      >
        <template v-if="$slots.actions" #actions>
          <slot name="actions" />
        </template>
      </DanxFileActions>
    </div>

    <!-- Footer: filename and/or file size below preview -->
    <div v-if="showFooter && !showProgress && !showError" class="danx-file__footer">
      <span v-if="showFilename" class="danx-file__filename">{{ file.name }}</span>
      <span v-if="fileSizeText" class="danx-file__filesize">{{ fileSizeText }}</span>
    </div>
  </div>
</template>
