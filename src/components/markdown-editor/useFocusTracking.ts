import { onUnmounted, Ref, ref, watch } from "vue";

/**
 * Options for useFocusTracking composable
 */
export interface UseFocusTrackingOptions {
  /** Reference to the main content element */
  contentRef: Ref<HTMLElement | null>;
}

/**
 * Return type for useFocusTracking composable
 */
export interface UseFocusTrackingReturn {
  /** Whether the editor content area currently has focus */
  isEditorFocused: Ref<boolean>;
}

/**
 * Composable for tracking focus state within a contenteditable editor
 *
 * This handles:
 * - Focus in/out tracking for the content area
 * - Proper listener cleanup on unmount
 */
export function useFocusTracking(options: UseFocusTrackingOptions): UseFocusTrackingReturn {
  const { contentRef } = options;

  // Track whether the editor has focus
  const isEditorFocused = ref(false);

  // Track which element has listeners attached (for cleanup)
  let boundContentEl: HTMLElement | null = null;

  /**
   * Handle focus entering the content area
   */
  function handleFocusIn(event: FocusEvent): void {
    const contentEl = contentRef.value;
    if (contentEl && contentEl.contains(event.target as Node)) {
      isEditorFocused.value = true;
    }
  }

  /**
   * Handle focus leaving the content area
   */
  function handleFocusOut(event: FocusEvent): void {
    const contentEl = contentRef.value;
    const relatedTarget = event.relatedTarget as Node | null;

    // Check if focus is moving outside the content area
    if (contentEl && !contentEl.contains(relatedTarget)) {
      isEditorFocused.value = false;
    }
  }

  /**
   * Setup or cleanup focus listeners on content element
   */
  function setupContentListeners(el: HTMLElement | null): void {
    // Cleanup previous listeners if element changed
    if (boundContentEl && boundContentEl !== el) {
      boundContentEl.removeEventListener("focusin", handleFocusIn);
      boundContentEl.removeEventListener("focusout", handleFocusOut);
      boundContentEl = null;
    }

    // Setup new listeners
    if (el && el !== boundContentEl) {
      el.addEventListener("focusin", handleFocusIn);
      el.addEventListener("focusout", handleFocusOut);
      boundContentEl = el;
    }
  }

  // Watch for content element to become available
  watch(
    contentRef,
    (newEl) => {
      setupContentListeners(newEl);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    // Cleanup content listeners
    setupContentListeners(null);
  });

  return {
    isEditorFocused,
  };
}
