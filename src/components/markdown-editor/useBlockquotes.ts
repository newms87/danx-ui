import { Ref } from "vue";

/**
 * Options for useBlockquotes composable
 */
export interface UseBlockquotesOptions {
	contentRef: Ref<HTMLElement | null>;
	onContentChange: () => void;
}

/**
 * Return type for useBlockquotes composable
 */
export interface UseBlockquotesReturn {
	/** Toggle blockquote on the current block */
	toggleBlockquote: () => void;
	/** Check if cursor is inside a blockquote */
	isInBlockquote: () => boolean;
}

/**
 * Block-level tags that can be wrapped in or unwrapped from blockquotes
 */
const BLOCK_TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"];

/**
 * Find the nearest block-level element containing the cursor
 */
function findCurrentBlock(node: Node | null, contentRef: HTMLElement): Element | null {
	if (!node) return null;

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE) {
			const element = current as Element;
			if (BLOCK_TAGS.includes(element.tagName) || element.tagName === "BLOCKQUOTE") {
				return element;
			}
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Find the blockquote ancestor if one exists
 */
function findBlockquoteAncestor(node: Node | null, contentRef: HTMLElement): HTMLQuoteElement | null {
	if (!node) return null;

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === "BLOCKQUOTE") {
			return current as HTMLQuoteElement;
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Get the cursor offset within a block element's text content
 */
function getCursorOffset(element: HTMLElement): number {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return 0;

	const range = selection.getRangeAt(0);
	const preCaretRange = document.createRange();
	preCaretRange.selectNodeContents(element);
	preCaretRange.setEnd(range.startContainer, range.startOffset);

	return preCaretRange.toString().length;
}

/**
 * Set cursor to a specific offset within an element's text content
 */
function setCursorOffset(element: HTMLElement, targetOffset: number): void {
	const selection = window.getSelection();
	if (!selection) return;

	let currentOffset = 0;
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();

	while (node) {
		const nodeLength = node.textContent?.length || 0;
		if (currentOffset + nodeLength >= targetOffset) {
			const range = document.createRange();
			range.setStart(node, targetOffset - currentOffset);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
			return;
		}
		currentOffset += nodeLength;
		node = walker.nextNode();
	}

	// If offset not found, place cursor at end
	const range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Composable for blockquote operations in markdown editor
 */
export function useBlockquotes(options: UseBlockquotesOptions): UseBlockquotesReturn {
	const { contentRef, onContentChange } = options;

	/**
	 * Check if the cursor is currently inside a blockquote
	 */
	function isInBlockquote(): boolean {
		if (!contentRef.value) return false;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return false;

		const range = selection.getRangeAt(0);
		return findBlockquoteAncestor(range.startContainer, contentRef.value) !== null;
	}

	/**
	 * Toggle blockquote on the current block
	 *
	 * Behavior:
	 * - If cursor is inside a blockquote: unwrap the block from the blockquote
	 * - If cursor is not in a blockquote: wrap the current block in a blockquote
	 * - Preserves cursor position after transformation
	 */
	function toggleBlockquote(): void {
		if (!contentRef.value) return;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		const range = selection.getRangeAt(0);

		// Check if selection is within our content area
		if (!contentRef.value.contains(range.startContainer)) return;

		const blockquote = findBlockquoteAncestor(range.startContainer, contentRef.value);

		if (blockquote) {
			unwrapBlockquote(blockquote);
		} else {
			wrapInBlockquote();
		}

		onContentChange();
	}

	/**
	 * Unwrap content from a blockquote
	 */
	function unwrapBlockquote(blockquote: HTMLQuoteElement): void {
		const parent = blockquote.parentNode;
		if (!parent) return;

		// Save cursor position
		const selection = window.getSelection();
		let cursorOffset = 0;
		let targetBlock: Element | null = null;

		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const currentBlock = findCurrentBlock(range.startContainer, contentRef.value!);

			// If the current block is inside the blockquote, get its offset
			if (currentBlock && blockquote.contains(currentBlock)) {
				targetBlock = currentBlock;
				cursorOffset = getCursorOffset(currentBlock as HTMLElement);
			} else if (currentBlock === blockquote) {
				// Cursor is directly in blockquote text node
				cursorOffset = getCursorOffset(blockquote);
			}
		}

		// Move all children out of the blockquote
		const children = Array.from(blockquote.childNodes);
		let firstMovedElement: Element | null = null;

		for (const child of children) {
			const insertedNode = parent.insertBefore(child, blockquote);
			if (!firstMovedElement && insertedNode.nodeType === Node.ELEMENT_NODE) {
				firstMovedElement = insertedNode as Element;
			}
		}

		// Remove the empty blockquote
		parent.removeChild(blockquote);

		// Restore cursor position
		if (targetBlock && parent.contains(targetBlock)) {
			setCursorOffset(targetBlock as HTMLElement, cursorOffset);
		} else if (firstMovedElement) {
			setCursorOffset(firstMovedElement as HTMLElement, cursorOffset);
		}
	}

	/**
	 * Wrap the current block in a blockquote
	 */
	function wrapInBlockquote(): void {
		if (!contentRef.value) return;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const currentBlock = findCurrentBlock(range.startContainer, contentRef.value);

		if (!currentBlock) return;

		// Don't wrap if already in a blockquote
		if (currentBlock.tagName === "BLOCKQUOTE") return;

		// Save cursor position
		const cursorOffset = getCursorOffset(currentBlock as HTMLElement);

		// Create blockquote and wrap the block
		const blockquote = document.createElement("blockquote");

		// Insert blockquote before the current block
		const parent = currentBlock.parentNode;
		if (!parent) return;

		parent.insertBefore(blockquote, currentBlock);

		// Move the block into the blockquote
		blockquote.appendChild(currentBlock);

		// Restore cursor position
		setCursorOffset(currentBlock as HTMLElement, cursorOffset);
	}

	return {
		toggleBlockquote,
		isInBlockquote
	};
}
