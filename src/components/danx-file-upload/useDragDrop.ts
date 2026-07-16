/**
 * useDragDrop - Composable for drag-and-drop + paste file handling
 *
 * Manages drag depth counting (to handle nested elements) and
 * isDragging state. Delegates dropped/pasted files to the provided onDrop callback.
 *
 * @param options.onDrop - Callback receiving the dropped/pasted FileList
 *
 * @returns
 *   isDragging: Ref<boolean> - Whether a drag is active over the drop zone
 *   handleDragEnter: () => void - Increment drag depth
 *   handleDragLeave: () => void - Decrement drag depth
 *   handleDrop: (event: DragEvent) => void - Extract files and call onDrop
 *   handlePaste: (event: ClipboardEvent) => void - Extract pasted files and call onDrop
 */

import { ref, type Ref } from "vue";

export interface UseDragDropOptions {
  onDrop: (files: FileList) => void;
}

export interface UseDragDropReturn {
  /** Whether a drag is active over the drop zone */
  isDragging: Ref<boolean>;
  /** Increment drag depth counter */
  handleDragEnter: () => void;
  /** Decrement drag depth counter */
  handleDragLeave: () => void;
  /** Extract files from drop event and call onDrop */
  handleDrop: (event: DragEvent) => void;
  /** Extract files from paste event and call onDrop */
  handlePaste: (event: ClipboardEvent) => void;
}

export function useDragDrop(options: UseDragDropOptions): UseDragDropReturn {
  const { onDrop } = options;
  const isDragging = ref(false);
  let _dragDepth = 0;

  function handleDragEnter() {
    _dragDepth++;
    isDragging.value = true;
  }

  function handleDragLeave() {
    _dragDepth--;
    if (_dragDepth <= 0) {
      _dragDepth = 0;
      isDragging.value = false;
    }
  }

  function handleDrop(event: DragEvent) {
    _dragDepth = 0;
    isDragging.value = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      onDrop(files);
    }
  }

  // DXUI-161: clipboardData.files only carries actual file attachments (e.g. screenshots);
  // pasted plain text yields an empty FileList, so no accept/size validation is skipped.
  function handlePaste(event: ClipboardEvent) {
    const files = event.clipboardData?.files;
    if (files && files.length > 0) {
      onDrop(files);
    }
  }

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handlePaste,
  };
}
