import { computed, ref, type ComputedRef, type Ref } from "vue";
import { getFileUploadHandler, useFileUpload } from "../danx-file-upload";
import type { FileUploadHandler } from "../danx-file-upload";
import { usePasteFiles } from "../../shared/composables/usePasteFiles";
import type { ChatAttachment } from "./types";

export interface UseChatAttachmentsOptions {
  /**
   * Per-instance upload handler. Falls back to the app-wide handler set with
   * `setFileUploadHandler`. With neither, attachments are switched off
   * entirely rather than accepted and quietly dropped.
   */
  uploadHandler?: FileUploadHandler;
  /** MIME filter, `accept`-attribute semantics (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Largest attachment accepted, in bytes. */
  maxFileSize?: number;
  /** Characters above which a pasted blob becomes a file instead of message text. */
  largePasteThreshold?: number;
}

export interface UseChatAttachmentsReturn {
  /** Files staged for the next message, uploading in place. */
  pending: Ref<ChatAttachment[]>;
  /** False when no upload handler exists — the UI must offer no attach affordance. */
  enabled: ComputedRef<boolean>;
  /** True while any staged file is still uploading. */
  isUploading: ComputedRef<boolean>;
  /** Add browser Files (from a picker, a drop, or a paste). */
  add: (files: File[]) => void;
  /** Handle a paste. Returns true when it consumed the event. */
  handlePaste: (event: ClipboardEvent) => boolean;
  /** Drop a staged file before it is sent. */
  remove: (id: string) => void;
  /** Take the staged files and clear the tray — call when the message is sent. */
  take: () => ChatAttachment[];
}

/**
 * useChatAttachments Composable
 *
 * Staging area for files travelling with the next message. Owns nothing that
 * already exists elsewhere in the library: uploads run through
 * `useFileUpload` (the same orchestration `DanxFileUpload` uses, so progress,
 * per-file errors and retry come for free) and clipboard extraction runs
 * through `usePasteFiles`.
 *
 * Attachments switch off entirely when no upload handler is configured.
 * Accepting a file with nowhere to put it would strand it on a message that
 * can never carry it — better to offer nothing than to offer something that
 * silently fails.
 */
export function useChatAttachments(
  options: UseChatAttachmentsOptions = {}
): UseChatAttachmentsReturn {
  const { uploadHandler, accept, maxFileSize, largePasteThreshold } = options;

  const pending = ref<ChatAttachment[]>([]);

  const enabled = computed(() => !!uploadHandler || !!getFileUploadHandler());

  const upload = useFileUpload({
    model: pending,
    multiple: true,
    accept,
    maxFileSize,
    uploadFn: uploadHandler,
  });

  const { extractFiles } = usePasteFiles({ accept, maxFileSize, largePasteThreshold });

  const isUploading = computed(() =>
    pending.value.some((file) => file.progress != null && file.progress < 100)
  );

  function add(files: File[]) {
    if (!enabled.value || !files.length) return;
    upload.addFiles(files);
  }

  /**
   * A paste is consumed ONLY when it produced files. Anything else — ordinary
   * text, an empty clipboard, a file the filters rejected — falls through so
   * the editor's own paste handling still runs.
   */
  function handlePaste(event: ClipboardEvent): boolean {
    if (!enabled.value) return false;
    const result = extractFiles(event);
    if (!result.handled) return false;
    event.preventDefault();
    add(result.files);
    return true;
  }

  function remove(id: string) {
    pending.value = pending.value.filter((file) => file.id !== id);
  }

  function take(): ChatAttachment[] {
    const files = pending.value;
    pending.value = [];
    return files;
  }

  return { pending, enabled, isUploading, add, handlePaste, remove, take };
}
