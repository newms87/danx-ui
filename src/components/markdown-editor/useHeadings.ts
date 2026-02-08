import { Ref } from "vue";
import { UseMarkdownSelectionReturn } from "./useMarkdownSelection";
import { detectHeadingPattern } from "../../shared/markdown";

/**
 * Options for useHeadings composable
 */
export interface UseHeadingsOptions {
	contentRef: Ref<HTMLElement | null>;
	selection: UseMarkdownSelectionReturn;
	onContentChange: () => void;
}

/**
 * Return type for useHeadings composable
 */
export interface UseHeadingsReturn {
	/** Set heading level (0 = paragraph, 1-6 = h1-h6) */
	setHeadingLevel: (level: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
	/** Increase heading level (P -> H6 -> H5 -> ... -> H1) */
	increaseHeadingLevel: () => void;
	/** Decrease heading level (H1 -> H2 -> ... -> H6 -> P) */
	decreaseHeadingLevel: () => void;
	/** Get current heading level (0 for paragraph) */
	getCurrentHeadingLevel: () => number;
	/** Check for heading pattern (e.g., "# ") and convert if matched */
	checkAndConvertHeadingPattern: () => boolean;
}

/**
 * Heading level hierarchy
 * Level 0 = paragraph (P)
 * Level 1-6 = H1-H6
 */
type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Map tag names to heading levels
 */
const TAG_TO_LEVEL: Record<string, HeadingLevel> = {
	P: 0,
	DIV: 0, // Browsers often create DIV instead of P when pressing Enter
	H1: 1,
	H2: 2,
	H3: 3,
	H4: 4,
	H5: 5,
	H6: 6
};

/**
 * Map heading levels to tag names
 */
const LEVEL_TO_TAG: Record<HeadingLevel, string> = {
	0: "P",
	1: "H1",
	2: "H2",
	3: "H3",
	4: "H4",
	5: "H5",
	6: "H6"
};

/**
 * Convert a block element to a different heading level
 * Preserves the element's content and attributes
 */
function convertElement(element: Element, newTagName: string): Element {
	const newElement = document.createElement(newTagName);

	// Copy all child nodes
	while (element.firstChild) {
		newElement.appendChild(element.firstChild);
	}

	// Copy attributes (except structural ones)
	for (const attr of Array.from(element.attributes)) {
		if (attr.name !== "id") {
			newElement.setAttribute(attr.name, attr.value);
		}
	}

	// Replace in DOM
	element.parentNode?.replaceChild(newElement, element);

	return newElement;
}

/**
 * Get the heading/paragraph element containing the cursor
 */
function getTargetBlock(contentRef: Ref<HTMLElement | null>, selection: UseMarkdownSelectionReturn): Element | null {
	const currentBlock = selection.getCurrentBlock();
	if (!currentBlock) return null;

	// Only operate on headings and paragraphs
	const tagName = currentBlock.tagName;
	if (tagName in TAG_TO_LEVEL) {
		return currentBlock;
	}

	// If in a list item or other block, find if there's a parent heading/paragraph
	// or try to get the direct child of contentRef
	if (!contentRef.value) return null;

	// Walk up to find a heading/paragraph or the direct child of contentRef
	let current: Element | null = currentBlock;
	while (current && current.parentElement !== contentRef.value) {
		current = current.parentElement;
	}

	// Check if this direct child is a heading/paragraph
	if (current && current.tagName in TAG_TO_LEVEL) {
		return current;
	}

	return null;
}

/**
 * Composable for heading-specific operations in markdown editor
 */
export function useHeadings(options: UseHeadingsOptions): UseHeadingsReturn {
	const { contentRef, selection, onContentChange } = options;

	/**
	 * Get the current heading level of the block containing the cursor
	 * Returns 0 for paragraph, 1-6 for h1-h6, -1 if not in a heading/paragraph
	 */
	function getCurrentHeadingLevel(): number {
		const block = getTargetBlock(contentRef, selection);
		if (!block) return -1;

		return TAG_TO_LEVEL[block.tagName] ?? -1;
	}

	/**
	 * Set the heading level of the current block
	 * @param level 0 = paragraph, 1-6 = h1-h6
	 */
	function setHeadingLevel(level: HeadingLevel): void {
		const block = getTargetBlock(contentRef, selection);
		if (!block) return;

		const currentLevel = TAG_TO_LEVEL[block.tagName];
		if (currentLevel === level) return; // Already at target level

		// Save cursor position
		const cursorPos = selection.saveCursorPosition();

		// Convert the element
		const newTagName = LEVEL_TO_TAG[level];
		convertElement(block, newTagName);

		// Restore cursor position
		if (cursorPos) {
			// After conversion, we need to recalculate since the element changed
			// The block index should remain the same
			selection.restoreCursorPosition(cursorPos);
		}

		// Notify of content change
		onContentChange();
	}

	/**
	 * Increase heading level (make heading more prominent)
	 * P -> H6 -> H5 -> H4 -> H3 -> H2 -> H1
	 */
	function increaseHeadingLevel(): void {
		const currentLevel = getCurrentHeadingLevel();
		if (currentLevel === -1) return;

		let newLevel: HeadingLevel;
		if (currentLevel === 0) {
			// Paragraph -> H6
			newLevel = 6;
		} else if (currentLevel === 1) {
			// H1 stays at H1 (most prominent)
			return;
		} else {
			// H6 -> H5 -> ... -> H1
			newLevel = (currentLevel - 1) as HeadingLevel;
		}

		setHeadingLevel(newLevel);
	}

	/**
	 * Decrease heading level (make heading less prominent)
	 * H1 -> H2 -> H3 -> H4 -> H5 -> H6 -> P
	 */
	function decreaseHeadingLevel(): void {
		const currentLevel = getCurrentHeadingLevel();
		if (currentLevel === -1) return;

		let newLevel: HeadingLevel;
		if (currentLevel === 0) {
			// Paragraph stays at paragraph (least prominent)
			return;
		} else if (currentLevel === 6) {
			// H6 -> Paragraph
			newLevel = 0;
		} else {
			// H1 -> H2 -> ... -> H6
			newLevel = (currentLevel + 1) as HeadingLevel;
		}

		setHeadingLevel(newLevel);
	}

	/**
	 * Check if the current block contains a heading pattern (e.g., "# ", "## ")
	 * and convert it to the appropriate heading if detected.
	 * Only converts if:
	 * - The current block is a paragraph (not already a heading)
	 * - The pattern is at the start of the block
	 * - The pattern includes the trailing space
	 * @returns true if a pattern was detected and converted, false otherwise
	 */
	function checkAndConvertHeadingPattern(): boolean {
		const block = getTargetBlock(contentRef, selection);
		if (!block) return false;

		// Only convert paragraphs or divs - don't re-convert headings
		if (block.tagName !== "P" && block.tagName !== "DIV") return false;

		// Get the text content of the block
		const textContent = block.textContent || "";

		// Check for heading pattern
		const pattern = detectHeadingPattern(textContent);
		if (!pattern) return false;

		// Pattern detected - convert to heading
		const level = pattern.level as HeadingLevel;
		const remainingContent = pattern.content;

		// Create the new heading element
		const newTagName = LEVEL_TO_TAG[level];
		const newElement = document.createElement(newTagName);

		// Set the content without the "# " prefix
		newElement.textContent = remainingContent;

		// Copy attributes (except structural ones)
		for (const attr of Array.from(block.attributes)) {
			if (attr.name !== "id") {
				newElement.setAttribute(attr.name, attr.value);
			}
		}

		// Replace in DOM
		block.parentNode?.replaceChild(newElement, block);

		// Position cursor at the end of the content (synchronously)
		const sel = window.getSelection();
		if (sel && newElement.firstChild) {
			const range = document.createRange();
			const textNode = newElement.firstChild;

			if (textNode.nodeType === Node.TEXT_NODE) {
				// Position cursor at the end of the text content
				const offset = textNode.textContent?.length || 0;
				range.setStart(textNode, offset);
				range.collapse(true);
			} else {
				// Fallback: select end of element
				range.selectNodeContents(newElement);
				range.collapse(false);
			}

			sel.removeAllRanges();
			sel.addRange(range);
		}

		// Notify of content change
		onContentChange();

		return true;
	}

	return {
		setHeadingLevel,
		increaseHeadingLevel,
		decreaseHeadingLevel,
		getCurrentHeadingLevel,
		checkAndConvertHeadingPattern
	};
}
