<!--
/**
 * DanxFileUpload - File upload component with drag-and-drop
 *
 * Provides file selection (via click or drag-and-drop), upload progress
 * tracking, error display, and file management. Uses DanxFile for
 * rendering individual file thumbnails and DanxFieldWrapper for
 * form field integration (label, error, helper text).
 *
 * Supports single file (replaces on new selection) and multi file
 * (accumulates with optional maxFiles limit) modes.
 *
 * The actual upload is delegated to a FileUploadHandler — either set
 * globally via setFileUploadHandler() or per-instance via the uploadFn prop.
 *
 * @props
 *   label?: string - Label text above the field
 *   helperText?: string - Helper text below the field
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the field
 *   readonly?: boolean - Makes the field read-only
 *   required?: boolean - Marks as required
 *   size?: InputSize - Field size ("sm" | "md" | "lg")
 *   multiple?: boolean - Allow multiple file selection (default: false)
 *   accept?: string - Accepted MIME types (e.g. "image/*,.pdf")
 *   maxFiles?: number - Maximum number of files in multi mode
 *   maxFileSize?: number - Maximum file size in bytes
 *   fileSize?: DanxFileSize - DanxFile thumbnail size (default: "md")
 *   showFilename?: boolean - Show filename below thumbnails
 *   showFileSize?: boolean - Show file size below thumbnails
 *   uploadFn?: FileUploadHandler - Per-instance upload handler override
 *
 * @emits
 *   remove(file) - File removed from the model
 *
 * @slots
 *   empty - Custom empty state content for the add button area
 *
 * @tokens
 *   --dx-file-upload-gap - Grid gap between thumbnails
 *   --dx-file-upload-add-bg - Add card background
 *   --dx-file-upload-add-border - Dashed border color
 *   --dx-file-upload-add-border-hover - Hover border color
 *   --dx-file-upload-add-border-active - Drag active border color
 *   --dx-file-upload-add-color - Icon/text color
 *   --dx-file-upload-add-radius - Corner radius
 *   --dx-file-upload-dropzone-active-bg - Drag overlay tint
 *
 * @example
 *   Single file upload:
 *     <DanxFileUpload v-model="files" label="Avatar" accept="image/*" />
 *
 *   Multi file with limit:
 *     <DanxFileUpload v-model="files" multiple :max-files="5" label="Attachments" />
 *
 *   With validation:
 *     <DanxFileUpload v-model="files" :max-file-size="5242880" accept="image/*,.pdf" />
 */
-->

<script setup lang="ts">
import { useFormField } from "../../shared/composables/useFormField";
import { DanxFieldWrapper } from "../field-wrapper";
import { DanxFile } from "../danx-file";
import { DanxIcon } from "../icon";
import DanxFileUploadDropZone from "./DanxFileUploadDropZone.vue";
import { useFileUpload } from "./useFileUpload";
import type { PreviewFile } from "../danx-file";
import type { DanxFileUploadProps, DanxFileUploadEmits, DanxFileUploadSlots } from "./types";

const props = withDefaults(defineProps<DanxFileUploadProps>(), {
  fileSize: "md",
  showFilename: false,
  showFileSize: false,
  multiple: false,
});

const emit = defineEmits<DanxFileUploadEmits>();

const model = defineModel<PreviewFile[]>({ default: () => [] });

defineSlots<DanxFileUploadSlots>();

const { fieldId } = useFormField(props);

const {
  canAddMore,
  isDragging,
  inputRef,
  openFilePicker,
  addFiles,
  removeFile,
  getStableKey,
  handleDragEnter,
  handleDragLeave,
} = useFileUpload({
  model,
  multiple: props.multiple,
  accept: props.accept,
  maxFiles: props.maxFiles,
  maxFileSize: props.maxFileSize,
  uploadFn: props.uploadFn,
});

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    addFiles(input.files);
  }
  // Reset input so the same file can be re-selected
  input.value = "";
}

function onRemoveFile(file: PreviewFile) {
  removeFile(file);
  emit("remove", file);
}

function onDropZoneDrop(files: FileList) {
  isDragging.value = false;
  addFiles(files);
}
</script>

<template>
  <DanxFieldWrapper
    :label="label"
    :error="error"
    :helper-text="helperText"
    :field-id="fieldId"
    :required="required"
    :size="size"
    :disabled="disabled"
  >
    <DanxFileUploadDropZone
      :is-dragging="isDragging"
      :disabled="!!disabled || !!readonly"
      @drag-enter="handleDragEnter"
      @drag-leave="handleDragLeave"
      @drop="onDropZoneDrop"
    >
      <div class="danx-file-upload">
        <!-- Existing files -->
        <DanxFile
          v-for="file in model"
          :key="getStableKey(file)"
          :file="file"
          :size="fileSize"
          :show-filename="showFilename"
          :show-file-size="showFileSize"
          removable
          :disabled="!!disabled"
          @remove="onRemoveFile"
        />

        <!-- Add card -->
        <button
          v-if="canAddMore && !disabled && !readonly"
          type="button"
          class="danx-file-upload__add-card"
          :class="[`danx-file-upload__add-card--${fileSize}`]"
          @click="openFilePicker"
        >
          <slot name="empty">
            <DanxIcon icon="create" class="danx-file-upload__add-icon" />
            <span class="danx-file-upload__add-label">Upload</span>
          </slot>
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="inputRef"
        type="file"
        class="danx-file-upload__input"
        :accept="accept"
        :multiple="multiple"
        aria-hidden="true"
        tabindex="-1"
        @change="onInputChange"
      />
    </DanxFileUploadDropZone>
  </DanxFieldWrapper>
</template>
