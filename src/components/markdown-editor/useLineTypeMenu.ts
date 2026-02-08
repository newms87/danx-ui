import { computed, ComputedRef, Ref, ref, watch } from "vue";
import { LineType } from "./types";
import { UseMarkdownEditorReturn } from "./useMarkdownEditor";

/**
 * Options for useLineTypeMenu composable
 */
export interface UseLineTypeMenuOptions {
	contentRef: Ref<HTMLElement | null>;
	editor: UseMarkdownEditorReturn;
	isEditorFocused: Ref<boolean>;
}

/**
 * Return type for useLineTypeMenu composable
 */
export interface UseLineTypeMenuReturn {
	currentLineType: ComputedRef<LineType>;
	menuStyle: ComputedRef<{ top: string; opacity: number; pointerEvents: "auto" | "none" }>;
	onLineTypeChange: (type: LineType) => void;
	updatePositionAndState: () => void;
	setupListeners: () => void;
	cleanupListeners: () => void;
}

// Map LineType to heading level (single source of truth for bidirectional mapping)
// Note: ul and ol are handled separately, not as heading levels
const LINE_TYPE_TO_LEVEL: Record<string, number> = {
	paragraph: 0,
	h1: 1,
	h2: 2,
	h3: 3,
	h4: 4,
	h5: 5,
	h6: 6
};

// Derive the inverse mapping from LINE_TYPE_TO_LEVEL
const LEVEL_TO_LINE_TYPE = Object.fromEntries(
	Object.entries(LINE_TYPE_TO_LEVEL).map(([type, level]) => [level, type as LineType])
) as Record<number, LineType>;

/**
 * Composable for managing the floating line type menu in the markdown editor.
 * Handles line type detection, menu positioning, and line type changes.
 */
export function useLineTypeMenu(options: UseLineTypeMenuOptions): UseLineTypeMenuReturn {
	const { contentRef, editor, isEditorFocused } = options;

	// Track current heading level for LineTypeMenu
	const currentHeadingLevel = ref(0);

	// Track the current block element's top position for floating menu
	const currentBlockTop = ref(0);

	// Track current list type for LineTypeMenu
	const currentListType = ref<"ul" | "ol" | null>(null);

	// Track if we're in a code block
	const isInCodeBlock = ref(false);

	// Computed current line type from heading level, list type, or code block
	const currentLineType = computed<LineType>(() => {
		// If we're in a code block, return "code"
		if (isInCodeBlock.value) {
			return "code";
		}
		// If we're in a list, return the list type
		if (currentListType.value) {
			return currentListType.value;
		}
		// Otherwise, return heading type based on level
		const level = currentHeadingLevel.value;
		return LEVEL_TO_LINE_TYPE[level] ?? "paragraph";
	});

	// Computed style for the floating line type menu
	const menuStyle = computed((): { top: string; opacity: number; pointerEvents: "auto" | "none" } => {
		return {
			top: `${currentBlockTop.value}px`,
			opacity: isEditorFocused.value ? 1 : 0,
			pointerEvents: isEditorFocused.value ? "auto" : "none"
		};
	});

	/**
	 * Find the block element containing the current selection
	 */
	function findCurrentBlockElement(): HTMLElement | null {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return null;

		let node: Node | null = selection.anchorNode;

		// Walk up to find a block element (P, H1-H6, DIV, etc.)
		while (node && node !== contentRef.value) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				const tagName = element.tagName.toUpperCase();
				if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV", "BLOCKQUOTE", "PRE", "UL", "OL", "LI"].includes(tagName)) {
					return element;
				}
			}
			node = node.parentNode;
		}

		return null;
	}

	/**
	 * Update the floating menu position based on current block
	 */
	function updateMenuPosition(): void {
		const contentEl = contentRef.value;
		if (!contentEl) return;

		const blockElement = findCurrentBlockElement();
		if (!blockElement) {
			// If no block found, position at top
			currentBlockTop.value = 0;
			return;
		}

		// Get the block's position relative to the content container
		// We need to account for the content's scroll position
		const contentRect = contentEl.getBoundingClientRect();
		const blockRect = blockElement.getBoundingClientRect();

		// Calculate top position relative to the content container, accounting for scroll
		const relativeTop = blockRect.top - contentRect.top + contentEl.scrollTop;
		currentBlockTop.value = relativeTop;
	}

	/**
	 * Update current heading level, list type, code block state, and menu position when selection changes
	 */
	function updatePositionAndState(): void {
		const level = editor.headings.getCurrentHeadingLevel();
		currentHeadingLevel.value = level;
		// Also check if we're in a list
		currentListType.value = editor.lists.getCurrentListType();
		// Also check if we're in a code block
		isInCodeBlock.value = editor.codeBlocks.isInCodeBlock();
		updateMenuPosition();
	}

	/**
	 * Handle line type change from menu
	 */
	function onLineTypeChange(type: LineType): void {
		// Handle code block type
		if (type === "code") {
			// If already in a code block, do nothing (or toggle off if that's desired)
			if (editor.codeBlocks.isInCodeBlock()) {
				return;
			}

			// If currently in a list, first convert the list item to paragraph
			const listType = editor.lists.getCurrentListType();
			if (listType) {
				editor.lists.convertCurrentListItemToParagraph();
			}

			// Now toggle to code block
			editor.codeBlocks.toggleCodeBlock();
			isInCodeBlock.value = true;
			currentListType.value = null;
			return;
		}

		// Handle list types
		if (type === "ul") {
			// If in code block, first convert to paragraph
			if (editor.codeBlocks.isInCodeBlock()) {
				editor.codeBlocks.toggleCodeBlock();
			}
			editor.lists.toggleUnorderedList();
			currentListType.value = editor.lists.getCurrentListType();
			isInCodeBlock.value = false;
			return;
		}
		if (type === "ol") {
			// If in code block, first convert to paragraph
			if (editor.codeBlocks.isInCodeBlock()) {
				editor.codeBlocks.toggleCodeBlock();
			}
			editor.lists.toggleOrderedList();
			currentListType.value = editor.lists.getCurrentListType();
			isInCodeBlock.value = false;
			return;
		}

		// Handle heading/paragraph types
		const level = LINE_TYPE_TO_LEVEL[type];
		if (level !== undefined) {
			// If currently in a code block, first convert to paragraph
			if (editor.codeBlocks.isInCodeBlock()) {
				editor.codeBlocks.toggleCodeBlock();
			}

			// If currently in a list, first convert the list item to paragraph
			const listType = editor.lists.getCurrentListType();
			if (listType) {
				editor.lists.convertCurrentListItemToParagraph();
			}

			// Now apply the heading level (0 = paragraph, 1-6 = heading)
			// Only set heading if level > 0 (paragraph is already the result of list conversion)
			if (level > 0) {
				editor.headings.setHeadingLevel(level as 1 | 2 | 3 | 4 | 5 | 6);
			}

			// Update the tracked level immediately
			currentHeadingLevel.value = level;
			currentListType.value = null;
			isInCodeBlock.value = false;
		}
	}

	// Track which element has listeners attached
	let boundContentEl: HTMLElement | null = null;

	/**
	 * Handle focus in event
	 */
	function handleFocusIn(event: FocusEvent): void {
		const contentEl = contentRef.value;
		if (contentEl && contentEl.contains(event.target as Node)) {
			// Note: isEditorFocused is managed externally, but we update menu position
			updateMenuPosition();
		}
	}

	/**
	 * Setup/cleanup focus and scroll listeners on content element
	 */
	function setupContentListeners(el: HTMLElement | null): void {
		// Cleanup previous listeners if element changed
		if (boundContentEl && boundContentEl !== el) {
			boundContentEl.removeEventListener("focusin", handleFocusIn);
			boundContentEl.removeEventListener("scroll", updateMenuPosition);
			boundContentEl = null;
		}

		// Setup new listeners
		if (el && el !== boundContentEl) {
			el.addEventListener("focusin", handleFocusIn);
			el.addEventListener("scroll", updateMenuPosition);
			boundContentEl = el;
		}
	}

	/**
	 * Setup all listeners (call from component's onMounted)
	 */
	function setupListeners(): void {
		// Setup content listeners
		setupContentListeners(contentRef.value);

		// Watch for content element to become available
		watch(contentRef, (newEl) => {
			setupContentListeners(newEl);
		}, { immediate: true });

		// Listen for selection changes
		document.addEventListener("selectionchange", updatePositionAndState);
	}

	/**
	 * Cleanup all listeners (call from component's onUnmounted)
	 */
	function cleanupListeners(): void {
		document.removeEventListener("selectionchange", updatePositionAndState);
		setupContentListeners(null);
	}

	return {
		currentLineType,
		menuStyle,
		onLineTypeChange,
		updatePositionAndState,
		setupListeners,
		cleanupListeners
	};
}
