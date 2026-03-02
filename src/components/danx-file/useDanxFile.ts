/**
 * useDanxFile - Computed state composable for DanxFile
 *
 * Encapsulates URL resolution, visibility flags, text content fetching,
 * and derived display state. Extracted from DanxFile.vue to keep the
 * component focused on template composition.
 *
 * @param props - Reactive DanxFile props (from withDefaults)
 *
 * @returns All computed state needed by DanxFile's template and sub-components
 */

import { computed, type ComputedRef, ref, type Ref, watch } from "vue";
import { isImage, isVideo, isAudio, isText, fileTypeIcon } from "./file-mime-helpers";
import { formatFileSize, isInProgress } from "./file-helpers";
import type { DanxFileProps } from "./types";

/**
 * Resolved props after withDefaults — all optional fields are guaranteed present.
 * This is the type that `withDefaults(defineProps<DanxFileProps>(), { ... })` returns.
 */
type ResolvedDanxFileProps = Required<DanxFileProps>;

export interface UseDanxFileReturn {
  /** CSS class for the current size preset */
  sizeClass: ComputedRef<string>;
  /** Whether the size is "xs" (compact progress) */
  isXsSize: ComputedRef<boolean>;
  /** Whether the size is xs/sm/md (compact error overlay) */
  isCompactDisplay: ComputedRef<boolean>;
  /** Whether mode is "preview". Exposed for external consumers; not used by the DanxFile template. */
  isPreviewMode: ComputedRef<boolean>;
  /** Best available original URL (url > blobUrl) */
  originalUrl: ComputedRef<string>;
  /** Preview mode image URL (optimized > original for images) */
  previewImageUrl: ComputedRef<string>;
  /** Thumb mode image URL (thumb > optimized > original for images) */
  thumbImageUrl: ComputedRef<string>;
  /** Show <video> player in preview mode */
  showPreviewVideo: ComputedRef<boolean>;
  /** Show full-size <img> in preview mode */
  showPreviewImage: ComputedRef<boolean>;
  /** Show <audio> player (both modes) */
  showAudio: ComputedRef<boolean>;
  /** Show text/markdown content in preview mode */
  showPreviewText: ComputedRef<boolean>;
  /** Resolved text content (from meta.content or fetched) */
  textContent: Ref<string>;
  /** Show thumbnail <img> in thumb mode */
  showThumbImage: ComputedRef<boolean>;
  /** Show play icon overlay on video thumbnails */
  showThumbPlayIcon: ComputedRef<boolean>;
  /** Show file-type icon (no visual content available) */
  showTypeIcon: ComputedRef<boolean>;
  /** Show progress overlay */
  showProgress: ComputedRef<boolean>;
  /** Show error overlay */
  showError: ComputedRef<boolean>;
  /** MIME-based icon name for file-type display */
  iconName: ComputedRef<string>;
  /** Formatted file size string */
  fileSizeText: ComputedRef<string>;
  /** Whether to show the footer (filename/filesize) */
  showFooter: ComputedRef<boolean>;
  /** Inline style object for --dx-file-thumb-fit */
  fitStyle: ComputedRef<Record<string, string>>;
}

/**
 * Encapsulates text content resolution for text files.
 * Resolves from meta.content (sync) or fetches from URL (async fallback).
 */
function useTextContent(props: ResolvedDanxFileProps): Ref<string> {
  const textContent = ref("");
  watch(
    () => props.file,
    async (file) => {
      if (!isText(file)) {
        textContent.value = "";
        return;
      }
      if (typeof file.meta?.content === "string" && file.meta.content) {
        textContent.value = file.meta.content;
        return;
      }
      const url = file.url || file.blobUrl || "";
      if (url) {
        try {
          const response = await fetch(url);
          textContent.value = await response.text();
        } catch {
          textContent.value = "";
        }
      } else {
        textContent.value = "";
      }
    },
    { immediate: true }
  );
  return textContent;
}

export function useDanxFile(props: ResolvedDanxFileProps): UseDanxFileReturn {
  const sizeClass = computed(() => `danx-file--${props.size}`);
  const isXsSize = computed(() => props.size === "xs");
  const isCompactDisplay = computed(
    () => props.size === "xs" || props.size === "sm" || props.size === "md"
  );

  const isPreviewMode = computed(() => props.mode === "preview");
  const originalUrl = computed(() => props.file.url || props.file.blobUrl || "");

  const previewImageUrl = computed(() => {
    if (isVideo(props.file) || isAudio(props.file)) return "";
    if (props.file.optimized?.url) return props.file.optimized.url;
    if (isImage(props.file)) return originalUrl.value;
    return "";
  });

  const thumbImageUrl = computed(() => {
    if (props.file.thumb?.url) return props.file.thumb.url;
    if (props.file.optimized?.url) return props.file.optimized.url;
    if (isImage(props.file)) return originalUrl.value;
    return "";
  });

  const showPreviewVideo = computed(
    () => isPreviewMode.value && isVideo(props.file) && !!originalUrl.value
  );
  const showPreviewImage = computed(() => isPreviewMode.value && !!previewImageUrl.value);
  const showAudio = computed(() => isAudio(props.file) && !!originalUrl.value);

  const textContent = useTextContent(props);
  const showPreviewText = computed(
    () => isPreviewMode.value && isText(props.file) && !!textContent.value
  );

  const showThumbImage = computed(() => !isPreviewMode.value && !!thumbImageUrl.value);
  const showThumbPlayIcon = computed(
    () => !isPreviewMode.value && isVideo(props.file) && !!thumbImageUrl.value
  );

  const showTypeIcon = computed(() => {
    if (showAudio.value) return false;
    if (showPreviewText.value) return false;
    if (isPreviewMode.value) return !showPreviewVideo.value && !showPreviewImage.value;
    return !showThumbImage.value;
  });

  const showProgress = computed(() => !props.file.error && isInProgress(props.file));
  const showError = computed(() => !!props.file.error);
  const iconName = computed(() => fileTypeIcon(props.file));

  const fileSizeText = computed(() =>
    props.showFileSize && props.file.size != null ? formatFileSize(props.file.size) : ""
  );
  const showFooter = computed(() => props.showFilename || props.showFileSize);

  const fitStyle = computed(() => ({
    "--dx-file-thumb-fit": props.fit,
  }));

  return {
    sizeClass,
    isXsSize,
    isCompactDisplay,
    isPreviewMode,
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
  };
}
