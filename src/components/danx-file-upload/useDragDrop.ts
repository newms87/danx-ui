/**
 * useDragDrop - Composable for drag-and-drop file handling
 *
 * Manages drag depth counting (to handle nested elements) and
 * isDragging state. Delegates dropped files to the provided onDrop callback.
 *
 * @param options.onDrop - Callback receiving the dropped FileList
 *
 * @returns
 *   isDragging: Ref<boolean> - Whether a drag is active over the drop zone
 *   handleDragEnter: () => void - Increment drag depth
 *   handleDragLeave: () => void - Decrement drag depth
 *   handleDrop: (event: DragEvent) => void - Extract files and call onDrop
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

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}
