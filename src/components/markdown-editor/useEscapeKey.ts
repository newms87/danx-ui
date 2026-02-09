/**
 * Shared Escape key handler composable for the markdown editor.
 *
 * Adds a document-level keydown listener for the Escape key on mount
 * and removes it on unmount. Used by LinkPopover, TablePopover, and
 * ContextMenu to avoid duplicating the same listener setup/teardown.
 */

import { onMounted, onUnmounted } from "vue";

/**
 * Register a document-level Escape key handler that is active
 * for the lifetime of the calling component.
 *
 * @param callback - Invoked when the Escape key is pressed
 */
export function useEscapeKey(callback: () => void): void {
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      callback();
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}
