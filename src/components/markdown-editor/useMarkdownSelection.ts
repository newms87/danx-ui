import { Ref } from "vue";

/**
 * Cursor position tracking for markdown editor
 */
export interface CursorPosition {
	/** Index of the block element containing the cursor */
	blockIndex: number;
	/** Character offset within the block */
	charOffset: number;
}

/**
 * Return type for useMarkdownSelection composable
 */
export interface UseMarkdownSelectionReturn {
	saveCursorPosition: () => CursorPosition | null;
	restoreCursorPosition: (position: CursorPosition) => void;
	getCurrentBlock: () => Element | null;
	getBlockIndex: () => number;
}

/**
 * Get cursor offset in plain text within a contenteditable element
 * Adapted from useCodeViewerEditor.ts
 */
function getCursorOffset(element: HTMLElement | null): number {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount || !element) return 0;

	const range = selection.getRangeAt(0);
	const preCaretRange = document.createRange();
	preCaretRange.selectNodeContents(element);
	preCaretRange.setEnd(range.startContainer, range.startOffset);

	// Count characters by walking text nodes
	let offset = 0;
	const walker = document.createTreeWalker(preCaretRange.commonAncestorContainer, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	while (node) {
		if (preCaretRange.intersectsNode(node)) {
			const nodeRange = document.createRange();
			nodeRange.selectNodeContents(node);
			if (preCaretRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0) {
				offset += node.textContent?.length || 0;
			} else {
				// Partial node - cursor is in this node
				offset += range.startOffset;
				break;
			}
		}
		node = walker.nextNode();
	}
	return offset;
}

/**
 * Set cursor to offset in plain text within a contenteditable element
 * Adapted from useCodeViewerEditor.ts
 */
function setCursorOffset(element: HTMLElement | null, targetOffset: number): void {
	if (!element) return;

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

	// If offset not found, place at end
	const range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Get the block-level parent element (p, h1-h6, li, blockquote, etc.) containing the cursor
 */
function findBlockParent(node: Node | null, contentRef: HTMLElement): Element | null {
	if (!node) return null;

	const blockTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "PRE", "DIV"];

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE) {
			const element = current as Element;
			if (blockTags.includes(element.tagName)) {
				return element;
			}
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Get all direct block children of the content element
 */
function getBlockElements(contentRef: HTMLElement): Element[] {
	const blocks: Element[] = [];
	const blockTags = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "PRE", "DIV", "TABLE", "HR"];

	for (const child of Array.from(contentRef.children)) {
		if (blockTags.includes(child.tagName)) {
			blocks.push(child);
		}
	}

	return blocks;
}

/**
 * Composable for cursor and selection management in markdown editor
 */
export function useMarkdownSelection(contentRef: Ref<HTMLElement | null>): UseMarkdownSelectionReturn {
	/**
	 * Get the current block element containing the cursor
	 */
	function getCurrentBlock(): Element | null {
		if (!contentRef.value) return null;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return null;

		const range = selection.getRangeAt(0);
		return findBlockParent(range.startContainer, contentRef.value);
	}

	/**
	 * Get the index of the current block within the content element
	 */
	function getBlockIndex(): number {
		if (!contentRef.value) return -1;

		const currentBlock = getCurrentBlock();
		if (!currentBlock) return -1;

		const blocks = getBlockElements(contentRef.value);
		return blocks.indexOf(currentBlock);
	}

	/**
	 * Save current cursor position as block index + character offset
	 */
	function saveCursorPosition(): CursorPosition | null {
		if (!contentRef.value) return null;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return null;

		const currentBlock = getCurrentBlock();
		if (!currentBlock) {
			// Cursor is not in a block, save position relative to content root
			return {
				blockIndex: -1,
				charOffset: getCursorOffset(contentRef.value)
			};
		}

		const blocks = getBlockElements(contentRef.value);
		const blockIndex = blocks.indexOf(currentBlock);
		const charOffset = getCursorOffset(currentBlock as HTMLElement);

		return { blockIndex, charOffset };
	}

	/**
	 * Restore cursor position from saved state
	 */
	function restoreCursorPosition(position: CursorPosition): void {
		if (!contentRef.value) return;

		if (position.blockIndex === -1) {
			// Restore to content root level
			setCursorOffset(contentRef.value, position.charOffset);
			return;
		}

		const blocks = getBlockElements(contentRef.value);
		if (position.blockIndex >= 0 && position.blockIndex < blocks.length) {
			const block = blocks[position.blockIndex] as HTMLElement;
			setCursorOffset(block, position.charOffset);
		} else {
			// Block no longer exists, place cursor at end
			const range = document.createRange();
			range.selectNodeContents(contentRef.value);
			range.collapse(false);
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}

	return {
		saveCursorPosition,
		restoreCursorPosition,
		getCurrentBlock,
		getBlockIndex
	};
}
