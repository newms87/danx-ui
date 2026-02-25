<!--
/**
 * DanxFile - Universal File Renderer
 *
 * Renders files in two modes:
 * - **thumb** (default): Thumbnail card with preview image, play icon overlay
 *   for video, file-type icons, progress bar, and error state.
 * - **preview**: Full-size interactive content — video with controls, embedded
 *   PDF, audio player, or full-size image with object-fit: contain.
 *
 * Visual states are rendered in priority order:
 * 1. Error (file.error) — red overlay with warning icon and message
 * 2. Progress (file.progress non-null and < 100) — progress bar overlay
 * 3. Preview mode: video → `<video controls>`, PDF → `<object>`, image → full-size `<img>`
 * 4. Thumb mode: image/video → thumbnail `<img>`, video adds play icon overlay
 * 5. Audio — `<audio controls>` in both modes
 * 6. File-type icon (non-previewable) — MIME-based icon + filename
 * 7. Empty (no URL, no thumb, no progress) — generic document icon
 *
 * Progress and error overlays render ON TOP of the content in both modes.
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
 *   click(file) - Thumbnail clicked (parent uses this to open navigator, etc.)
 *   download(event) - Download button clicked (preventable via event.preventDefault())
 *   remove(file) - Remove confirmed after 2-step confirmation
 *
 * @slots
 *   actions - Custom action buttons in the hover overlay (top-right)
 *
 * @tokens
 *   --dx-file-thumb-bg - Background color (default: var(--color-surface-sunken))
 *   --dx-file-thumb-border-radius - Corner radius (default: var(--radius-component))
 *   --dx-file-thumb-overlay-bg - Hover overlay background
 *   --dx-file-thumb-action-color - Action button icon color
 *   --dx-file-thumb-action-bg-hover - Action button hover background
 *   --dx-file-thumb-action-download-bg - Download button background
 *   --dx-file-thumb-action-download-bg-hover - Download button hover background
 *   --dx-file-thumb-action-remove-bg - Remove button background
 *   --dx-file-thumb-action-remove-bg-hover - Remove button hover background
 *   --dx-file-thumb-play-size - Play icon size for video thumbs
 *   --dx-file-thumb-progress-track - Progress overlay background
 *   --dx-file-thumb-progress-text - Progress text color
 *   --dx-file-thumb-error-bg - Error overlay background
 *   --dx-file-thumb-error-color - Error text/icon color
 *   --dx-file-thumb-icon-color - File-type icon color
 *   --dx-file-thumb-fit - Image object-fit (set via fit prop)
 *   --dx-file-thumb-filename-color - Filename text color
 *   --dx-file-thumb-filesize-color - File size text color
 *   --dx-file-size-xs through --dx-file-size-xxl - Size preset dimensions
 *
 * @example
 *   <DanxFile :file="photo" downloadable @click="openPreview" />
 *   <DanxFile :file="photo" size="lg" show-filename />
 *   <DanxFile :file="uploadingFile" />
 *   <DanxFile :file="doc" removable @remove="deleteFile" />
 *   <DanxFile :file="video" mode="preview" size="auto" />
 *   <DanxFile :file="pdf" mode="preview" size="auto" />
 */
-->

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { DanxIcon } from "../icon";
import { DanxPopover } from "../popover";
import { DanxTooltip } from "../tooltip";
import { DanxProgressBar } from "../progress-bar";
import { DanxSkeleton } from "../skeleton";
import {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isAudio,
  isPdf,
  isInProgress,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
} from "./file-helpers";
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

const sizeClass = computed(() => `danx-file--${props.size}`);
const isCompactSize = computed(() => props.size === "xs");
/** Compact display: xs/sm/md use icon-only overlays with hover popovers for details */
const isCompactDisplay = computed(
  () => props.size === "xs" || props.size === "sm" || props.size === "md"
);

// --- Computed state ---

const isPreviewMode = computed(() => props.mode === "preview");
const fileUrl = computed(() => resolveFileUrl(props.file));
const thumbUrl = computed(() => resolveThumbUrl(props.file));
const hasThumb = computed(() => !!thumbUrl.value);
const hasFileUrl = computed(() => !!fileUrl.value);

// Preview mode: render full-size interactive elements
const showPreviewVideo = computed(
  () => isPreviewMode.value && isVideo(props.file) && hasFileUrl.value
);
const showPreviewPdf = computed(() => isPreviewMode.value && isPdf(props.file) && hasFileUrl.value);
const showPreviewImage = computed(
  () => isPreviewMode.value && isImage(props.file) && hasFileUrl.value
);

// Thumb mode: render thumbnail images.
// Images can use any resolved URL as a thumb. Videos need an explicit thumb/optimized
// URL — the raw video URL is not a valid image source.
const hasVideoThumb = computed(() => !!(props.file.thumb?.url || props.file.optimized?.url));
const showThumbImage = computed(() => {
  if (isPreviewMode.value) return false;
  if (isImage(props.file)) return hasThumb.value;
  if (isVideo(props.file)) return hasVideoThumb.value;
  return false;
});
const showThumbPlayIcon = computed(
  () => !isPreviewMode.value && isVideo(props.file) && hasVideoThumb.value
);

const showAudio = computed(() => isAudio(props.file));

// Type icon: shown when no visual content renders in the current mode
const showTypeIcon = computed(() => {
  if (showAudio.value) return false;
  if (isPreviewMode.value) {
    return !showPreviewVideo.value && !showPreviewPdf.value && !showPreviewImage.value;
  }
  return !showThumbImage.value;
});
const showProgress = computed(() => !props.file.error && isInProgress(props.file));
const showError = computed(() => !!props.file.error);
const iconName = computed(() => fileTypeIcon(props.file));

const progressText = computed(() => {
  if (props.file.statusMessage) return props.file.statusMessage;
  return `Uploading... ${props.file.progress ?? 0}%`;
});

const fileSizeText = computed(() =>
  props.showFileSize && props.file.size != null ? formatFileSize(props.file.size) : ""
);
const showFooter = computed(() => props.showFilename || props.showFileSize);

const fitStyle = computed(() => ({
  "--dx-file-thumb-fit": props.fit,
}));

// --- Remove confirmation ---

const REMOVE_CONFIRM_TIMEOUT_MS = 3000;

const removeArmed = ref(false);
let removeTimer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(removeTimer));

function onRemoveClick() {
  if (!removeArmed.value) {
    removeArmed.value = true;
    removeTimer = setTimeout(() => {
      removeArmed.value = false;
    }, REMOVE_CONFIRM_TIMEOUT_MS);
    return;
  }
  clearTimeout(removeTimer);
  removeArmed.value = false;
  emit("remove", props.file);
}

// --- Event handlers ---

function onClick() {
  if (!props.disabled) {
    emit("click", props.file);
  }
}

function onDownload() {
  const event = createDownloadEvent(props.file);
  emit("download", event);
  if (!event.prevented) {
    triggerFileDownload(props.file);
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
      <video v-else-if="showPreviewVideo" class="danx-file__video" controls :src="fileUrl" />

      <!-- Preview mode: PDF embed -->
      <object
        v-else-if="showPreviewPdf"
        class="danx-file__pdf"
        type="application/pdf"
        :data="fileUrl"
      >
        <a :href="fileUrl" target="_blank" rel="noopener">Download PDF</a>
      </object>

      <!-- Preview mode: Full-size image -->
      <img
        v-else-if="showPreviewImage"
        class="danx-file__image danx-file__image--preview"
        :src="fileUrl"
        :alt="file.name"
      />

      <!-- Thumb mode: Thumbnail image (for images and videos) -->
      <img
        v-else-if="showThumbImage"
        class="danx-file__image"
        :src="thumbUrl"
        :alt="file.name"
        loading="lazy"
      />

      <!-- Audio preview (both modes) -->
      <audio v-else-if="showAudio" class="danx-file__audio" controls :src="fileUrl" />

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
      <div
        v-if="showProgress"
        class="danx-file__progress"
        :class="{ 'danx-file__progress--compact': isCompactSize }"
      >
        <template v-if="isCompactSize">
          <DanxIcon icon="clock" />
          <DanxProgressBar :value="file.progress ?? 0" size="sm" :show-text="false" />
        </template>
        <template v-else>
          <span class="danx-file__progress-text">{{ progressText }}</span>
          <DanxProgressBar
            :value="file.progress ?? 0"
            size="sm"
            striped
            animate-stripes
            :show-text="false"
          />
        </template>
      </div>

      <!--
        Error overlay: compact sizes (xs/sm/md) show icon-only with hover popover.
        The popover trigger uses display:contents, so the error div's position:absolute
        resolves against .danx-file__preview (the nearest positioned ancestor).
      -->
      <template v-if="showError && isCompactDisplay">
        <DanxPopover
          trigger="hover"
          placement="top"
          variant="danger"
          class="danx-file__error-popover"
        >
          <template #trigger>
            <div class="danx-file__error danx-file__error--compact">
              <DanxIcon icon="warning-triangle" />
            </div>
          </template>
          {{ file.error }}
        </DanxPopover>
      </template>
      <div v-else-if="showError" class="danx-file__error">
        <DanxIcon icon="warning-triangle" />
        <span class="danx-file__error-text">{{ file.error }}</span>
      </div>

      <!-- Hover actions -->
      <div
        v-if="downloadable || removable || $slots.actions"
        class="danx-file__actions"
        @click.stop
      >
        <slot name="actions" />

        <DanxTooltip v-if="downloadable" tooltip="Download" placement="top">
          <template #trigger>
            <button
              class="danx-file__action-btn danx-file__action-btn--download"
              @click="onDownload"
            >
              <DanxIcon icon="download" />
            </button>
          </template>
        </DanxTooltip>

        <DanxTooltip
          v-if="removable"
          :tooltip="removeArmed ? 'Click again to confirm' : 'Remove'"
          placement="top"
        >
          <template #trigger>
            <button
              class="danx-file__action-btn danx-file__action-btn--remove"
              :class="{ 'danx-file__action-btn--armed': removeArmed }"
              @click="onRemoveClick"
            >
              <DanxIcon :icon="removeArmed ? 'confirm' : 'trash'" />
            </button>
          </template>
        </DanxTooltip>
      </div>
    </div>

    <!-- Footer: filename and/or file size below preview -->
    <div v-if="showFooter && !showProgress && !showError" class="danx-file__footer">
      <span v-if="showFilename" class="danx-file__filename">{{ file.name }}</span>
      <span v-if="fileSizeText" class="danx-file__filesize">{{ fileSizeText }}</span>
    </div>
  </div>
</template>
