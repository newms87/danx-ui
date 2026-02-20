<!--
/**
 * DanxFile - File Thumbnail Component
 *
 * A pure thumbnail card for a file. Shows preview image, progress bar,
 * error state, file-type icons, and hover actions. No dialog, no navigator —
 * just the thumbnail. The parent decides what happens on click.
 *
 * Visual states are rendered in priority order:
 * 1. Error (file.error) — red overlay with warning icon and message
 * 2. Progress (file.progress non-null and < 100) — progress bar overlay
 * 3. Image (image MIME + thumb/url) — img with object-fit
 * 4. Video (video MIME + thumb/url) — img with play icon overlay
 * 5. File-type icon (non-previewable) — MIME-based icon + filename
 * 6. Empty (no URL, no thumb, no progress) — generic document icon
 *
 * Progress and error overlays render ON TOP of the thumbnail when available.
 *
 * @props
 *   file: PreviewFile - The file to display (required)
 *   fit?: ImageFit - Image object-fit (default: "cover")
 *   showFilename?: boolean - Show filename overlay at bottom (default: false)
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
 *   --dx-file-thumb-action-color - Action button color
 *   --dx-file-thumb-action-bg-hover - Action button hover background
 *   --dx-file-thumb-play-size - Play icon size for video thumbs
 *   --dx-file-thumb-progress-bg - Progress bar fill color
 *   --dx-file-thumb-progress-track - Progress bar track color
 *   --dx-file-thumb-progress-text - Progress text color
 *   --dx-file-thumb-error-bg - Error overlay background
 *   --dx-file-thumb-error-color - Error text/icon color
 *   --dx-file-thumb-icon-color - File-type icon color
 *   --dx-file-thumb-fit - Image object-fit (set via fit prop)
 *   --dx-file-thumb-filename-bg - Filename overlay background
 *   --dx-file-thumb-skeleton-bg - Skeleton placeholder background
 *   --dx-file-thumb-skeleton-shine - Skeleton shimmer highlight color
 *
 * @example
 *   <DanxFile :file="photo" downloadable @click="openPreview" />
 *   <DanxFile :file="uploadingFile" />
 *   <DanxFile :file="doc" removable @remove="deleteFile" />
 */
-->

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { DanxIcon } from "../icon";
import {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isAudio,
  isPreviewable,
  isInProgress,
  fileTypeIcon,
  createDownloadEvent,
  triggerFileDownload,
} from "./file-helpers";
import type { DanxFileEmits, DanxFileProps, DanxFileSlots } from "./types";

const props = withDefaults(defineProps<DanxFileProps>(), {
  fit: "cover",
  showFilename: false,
  downloadable: false,
  removable: false,
  disabled: false,
  loading: false,
});

const emit = defineEmits<DanxFileEmits>();

defineSlots<DanxFileSlots>();

// --- Computed state ---

const thumbUrl = computed(() => resolveThumbUrl(props.file));
const hasThumb = computed(() => !!thumbUrl.value);
const showImage = computed(() => isImage(props.file) && hasThumb.value);
const showVideo = computed(() => isVideo(props.file) && hasThumb.value);
const showAudio = computed(() => isAudio(props.file));
const showTypeIcon = computed(
  () => !showAudio.value && (!isPreviewable(props.file) || !hasThumb.value)
);
const showProgress = computed(() => !props.file.error && isInProgress(props.file));
const showError = computed(() => !!props.file.error);
const iconName = computed(() => fileTypeIcon(props.file));

const progressText = computed(() => {
  if (props.file.statusMessage) return props.file.statusMessage;
  return `Uploading... ${props.file.progress ?? 0}%`;
});

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
    :class="{ 'danx-file--disabled': disabled }"
    :style="fitStyle"
    role="button"
    :tabindex="disabled ? -1 : 0"
    @click="onClick"
    @keydown.enter="onClick"
  >
    <!-- Loading skeleton -->
    <div v-if="loading" class="danx-file__skeleton" />

    <!-- Preview: Image -->
    <img
      v-else-if="showImage || showVideo"
      class="danx-file__image"
      :src="thumbUrl"
      :alt="file.name"
      loading="lazy"
    />

    <!-- Audio preview -->
    <audio v-else-if="showAudio" class="danx-file__audio" controls :src="resolveFileUrl(file)" />

    <!-- Video play icon overlay -->
    <div v-if="showVideo && !showProgress && !showError" class="danx-file__play-icon">
      <DanxIcon icon="play" />
    </div>

    <!-- File-type icon for non-previewable files -->
    <div v-if="showTypeIcon && !showImage && !showVideo && !loading" class="danx-file__type-icon">
      <DanxIcon :icon="iconName" />
      <span class="danx-file__type-icon-name">{{ file.name }}</span>
    </div>

    <!-- Progress overlay -->
    <div v-if="showProgress" class="danx-file__progress">
      <span class="danx-file__progress-text">{{ progressText }}</span>
      <div class="danx-file__progress-bar">
        <div class="danx-file__progress-fill" :style="{ width: (file.progress ?? 0) + '%' }" />
      </div>
    </div>

    <!-- Error overlay -->
    <div v-if="showError" class="danx-file__error" :title="file.error">
      <DanxIcon icon="warning-triangle" />
      <span class="danx-file__error-text">{{ file.error }}</span>
    </div>

    <!-- Filename overlay -->
    <div v-if="showFilename && !showProgress && !showError" class="danx-file__filename">
      {{ file.name }}
    </div>

    <!-- Hover actions -->
    <div v-if="downloadable || removable || $slots.actions" class="danx-file__actions" @click.stop>
      <slot name="actions" />

      <button
        v-if="downloadable"
        class="danx-file__action-btn"
        title="Download"
        @click="onDownload"
      >
        <DanxIcon icon="download" />
      </button>

      <button
        v-if="removable"
        class="danx-file__action-btn"
        :class="{ 'danx-file__action-btn--armed': removeArmed }"
        :title="removeArmed ? 'Click again to confirm' : 'Remove'"
        @click="onRemoveClick"
      >
        <DanxIcon :icon="removeArmed ? 'confirm' : 'trash'" />
      </button>
    </div>
  </div>
</template>
