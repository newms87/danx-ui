import { onMounted, onUnmounted, Ref, ref, watch } from "vue";

/**
 * Options for useFocusTracking composable
 */
export interface UseFocusTrackingOptions {
	/** Reference to the main content element */
	contentRef: Ref<HTMLElement | null>;
	/** Reference to the menu container (optional, for focus retention when clicking menu) */
	menuContainerRef?: Ref<HTMLElement | null>;
	/** Callback when selection changes in the document */
	onSelectionChange?: () => void;
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
 * - Optional focus retention when clicking associated UI elements (like menus)
 * - Document-level selection change monitoring
 * - Proper listener cleanup on unmount
 */
export function useFocusTracking(options: UseFocusTrackingOptions): UseFocusTrackingReturn {
	const { contentRef, menuContainerRef, onSelectionChange } = options;

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
			// Notify selection change callback if provided
			onSelectionChange?.();
		}
	}

	/**
	 * Handle focus leaving the content area
	 *
	 * Note: We check if focus is moving to the menu container to avoid
	 * prematurely marking the editor as unfocused when clicking menu items.
	 */
	function handleFocusOut(event: FocusEvent): void {
		const contentEl = contentRef.value;
		const menuEl = menuContainerRef?.value;
		const relatedTarget = event.relatedTarget as Node | null;

		// Check if focus is moving outside the editor
		if (contentEl && !contentEl.contains(relatedTarget)) {
			// Also check if focus is moving to the menu container (if provided)
			// Keep focused if moving to menu - allows clicking menu without losing focus state
			if (!menuEl || !menuEl.contains(relatedTarget)) {
				isEditorFocused.value = false;
			}
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
	watch(contentRef, (newEl) => {
		setupContentListeners(newEl);
	}, { immediate: true });

	// Listen for document-level selection changes
	onMounted(() => {
		if (onSelectionChange) {
			document.addEventListener("selectionchange", onSelectionChange);
		}
	});

	onUnmounted(() => {
		if (onSelectionChange) {
			document.removeEventListener("selectionchange", onSelectionChange);
		}
		// Cleanup content listeners
		setupContentListeners(null);
	});

	return {
		isEditorFocused
	};
}
