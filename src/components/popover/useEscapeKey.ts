/**
 * useEscapeKey - Closes a popover when the Escape key is pressed
 *
 * Adds a document-level keydown listener that fires a callback when Escape
 * is pressed. Automatically manages listener lifecycle based on an isActive
 * ref and cleans up on scope disposal.
 *
 * @param callback - Function to call when Escape is pressed
 * @param isActive - Ref controlling whether the listener is active
 */
import { onScopeDispose, type Ref, watch } from "vue";

export function useEscapeKey(callback: () => void, isActive: Ref<boolean>): void {
  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      callback();
    }
  }

  let listening = false;

  function addListener(): void {
    if (!listening) {
      document.addEventListener("keydown", onKeydown);
      listening = true;
    }
  }

  function removeListener(): void {
    if (listening) {
      document.removeEventListener("keydown", onKeydown);
      listening = false;
    }
  }

  watch(
    isActive,
    (active) => {
      if (active) {
        addListener();
      } else {
        removeListener();
      }
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    removeListener();
  });
}
