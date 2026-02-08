import { Ref } from "vue";

/**
 * Options for useInlineFormatting composable
 */
export interface UseInlineFormattingOptions {
	contentRef: Ref<HTMLElement | null>;
	onContentChange: () => void;
}

/**
 * Return type for useInlineFormatting composable
 */
export interface UseInlineFormattingReturn {
	/** Toggle bold formatting on selection */
	toggleBold: () => void;
	/** Toggle italic formatting on selection */
	toggleItalic: () => void;
	/** Toggle strikethrough formatting on selection */
	toggleStrikethrough: () => void;
	/** Toggle inline code formatting on selection */
	toggleInlineCode: () => void;
	/** Toggle highlight formatting on selection */
	toggleHighlight: () => void;
	/** Toggle underline formatting on selection */
	toggleUnderline: () => void;
}

/**
 * Inline formatting tag mappings
 */
const FORMAT_TAGS = {
	bold: { tag: "STRONG", fallback: "B" },
	italic: { tag: "EM", fallback: "I" },
	strikethrough: { tag: "DEL", fallback: "S" },
	code: { tag: "CODE", fallback: null },
	highlight: { tag: "MARK", fallback: null },
	underline: { tag: "U", fallback: null }
} as const;

type FormatType = keyof typeof FORMAT_TAGS;

/**
 * Check if a node or its ancestors have a specific formatting tag
 */
function hasFormatting(node: Node | null, formatType: FormatType): Element | null {
	const { tag, fallback } = FORMAT_TAGS[formatType];

	let current: Node | null = node;
	while (current && current.nodeType !== Node.DOCUMENT_NODE) {
		if (current.nodeType === Node.ELEMENT_NODE) {
			const element = current as Element;
			const tagName = element.tagName.toUpperCase();
			if (tagName === tag || (fallback && tagName === fallback)) {
				return element;
			}
		}
		current = current.parentNode;
	}
	return null;
}

/**
 * Composable for inline formatting operations in markdown editor
 */
export function useInlineFormatting(options: UseInlineFormattingOptions): UseInlineFormattingReturn {
	const { contentRef, onContentChange } = options;

	/**
	 * Apply or remove inline formatting to the current selection
	 *
	 * Behavior:
	 * - With selection that matches entire formatted element: remove formatting
	 * - With selection inside formatted element: remove formatting from selection only
	 * - With selection (no existing format): wrap selection with formatting
	 * - No selection, cursor inside formatted text: move cursor after formatted element
	 * - No selection, cursor outside formatted text: insert formatted placeholder
	 */
	function toggleFormat(formatType: FormatType): void {
		if (!contentRef.value) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);

		// Check if selection is within our content area
		if (!contentRef.value.contains(range.commonAncestorContainer)) return;

		const { tag } = FORMAT_TAGS[formatType];

		// Check if the selection/cursor is inside formatted text
		const existingFormat = hasFormatting(range.commonAncestorContainer, formatType);

		if (!range.collapsed) {
			// There's a selection
			if (existingFormat && isSelectionEntireElement(range, existingFormat)) {
				// Selection matches the entire formatted element - remove formatting
				removeFormatting(existingFormat);
			} else if (existingFormat) {
				// Selection is partially inside formatted element - remove format from selection
				unwrapSelectionFromFormat(range, existingFormat, formatType);
			} else {
				// Selection has no formatting - wrap it
				wrapSelection(range, tag.toLowerCase());
			}
		} else {
			// No selection (cursor only)
			if (existingFormat) {
				// Cursor is inside formatted text - move cursor after the formatted element
				moveCursorAfterElement(existingFormat);
			} else {
				// Cursor is in unformatted area - insert formatted placeholder
				insertFormattedPlaceholder(range, tag.toLowerCase(), formatType);
			}
		}

		onContentChange();
	}

	/**
	 * Check if selection encompasses the entire element's content
	 */
	function isSelectionEntireElement(range: Range, element: Element): boolean {
		return range.toString() === element.textContent;
	}

	/**
	 * Move cursor to position immediately after an element by inserting a
	 * zero-width space to break out of the formatting context.
	 * The ZWS is cleaned up during HTML→markdown conversion.
	 */
	function moveCursorAfterElement(element: Element): void {
		const selection = window.getSelection();
		if (!selection) return;

		// Insert a zero-width space after the element to break out of formatting
		const zws = document.createTextNode("\u200B");
		element.parentNode?.insertBefore(zws, element.nextSibling);

		// Position cursor after the zero-width space
		const range = document.createRange();
		range.setStart(zws, 1);
		range.collapse(true);

		selection.removeAllRanges();
		selection.addRange(range);
	}

	/**
	 * Remove formatting from just the selected portion within a formatted element
	 */
	function unwrapSelectionFromFormat(range: Range, formatElement: Element, formatType: FormatType): void {
		const { tag } = FORMAT_TAGS[formatType];
		const tagLower = tag.toLowerCase();

		// Get the selected text
		const selectedText = range.toString();
		const fullText = formatElement.textContent || "";

		// Find where the selection is within the formatted element
		const beforeText = fullText.substring(0, fullText.indexOf(selectedText));
		const afterText = fullText.substring(fullText.indexOf(selectedText) + selectedText.length);

		const parent = formatElement.parentNode;
		if (!parent) return;

		// Create new structure: [before formatted] [unformatted selection] [after formatted]
		const fragment = document.createDocumentFragment();

		if (beforeText) {
			const beforeElement = document.createElement(tagLower);
			beforeElement.textContent = beforeText;
			fragment.appendChild(beforeElement);
		}

		// The unformatted selected text
		const unformattedText = document.createTextNode(selectedText);
		fragment.appendChild(unformattedText);

		if (afterText) {
			const afterElement = document.createElement(tagLower);
			afterElement.textContent = afterText;
			fragment.appendChild(afterElement);
		}

		// Replace the original formatted element
		parent.replaceChild(fragment, formatElement);

		// Select the unformatted text
		const newRange = document.createRange();
		newRange.selectNodeContents(unformattedText);
		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(newRange);
		}
	}

	/**
	 * Remove formatting from an element, keeping its content
	 */
	function removeFormatting(element: Element): void {
		const parent = element.parentNode;
		if (!parent) return;

		// Move all children out of the formatted element
		while (element.firstChild) {
			parent.insertBefore(element.firstChild, element);
		}

		// Remove the empty formatting element
		parent.removeChild(element);

		// Normalize to merge adjacent text nodes
		parent.normalize();
	}

	/**
	 * Unwrap all existing formatting elements of the same type within a node tree.
	 * This prevents nested formatting like <mark><mark>text</mark></mark>.
	 */
	function unwrapExistingFormat(container: Node, tagName: string): void {
		// Handle both Element and DocumentFragment (from extractContents)
		if (container.nodeType === Node.ELEMENT_NODE || container.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			// Use a temporary div to enable querySelectorAll on DocumentFragment
			const wrapper = document.createElement("div");
			while (container.firstChild) {
				wrapper.appendChild(container.firstChild);
			}

			// Find all matching elements
			const matchingElements = Array.from(wrapper.querySelectorAll(tagName));

			// Unwrap each matching element (replace with its children)
			for (const el of matchingElements) {
				const parent = el.parentNode;
				if (parent) {
					while (el.firstChild) {
						parent.insertBefore(el.firstChild, el);
					}
					parent.removeChild(el);
				}
			}

			// Move content back to original container
			while (wrapper.firstChild) {
				container.appendChild(wrapper.firstChild);
			}
		}
	}

	/**
	 * Remove empty formatting elements from a parent node
	 */
	function removeEmptyElements(parent: Node, tagName: string): void {
		if (parent.nodeType === Node.ELEMENT_NODE) {
			const element = parent as Element;
			// Find all matching elements that have no meaningful content
			const emptyElements = Array.from(element.querySelectorAll(tagName)).filter(
				el => !el.textContent?.trim()
			);
			for (const el of emptyElements) {
				el.parentNode?.removeChild(el);
			}
		}
	}

	/**
	 * Wrap the current selection with a formatting tag
	 */
	function wrapSelection(range: Range, tagName: string): void {
		// Create the formatting element
		const formatElement = document.createElement(tagName);

		// Extract the selected content and wrap it
		const contents = range.extractContents();

		// Unwrap any existing formatting of the same type to prevent nesting
		unwrapExistingFormat(contents, tagName);

		formatElement.appendChild(contents);

		// Insert the wrapped content
		range.insertNode(formatElement);

		// Clean up empty elements left behind by extractContents
		const parentBlock = formatElement.parentElement;
		if (parentBlock) {
			removeEmptyElements(parentBlock, tagName);
		}

		// Normalize to merge adjacent text nodes
		formatElement.normalize();

		// Select the newly formatted content
		const newRange = document.createRange();
		newRange.selectNodeContents(formatElement);

		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(newRange);
		}
	}

	/**
	 * Insert a formatted placeholder when there's no selection
	 */
	function insertFormattedPlaceholder(range: Range, tagName: string, formatType: FormatType): void {
		// Create the formatting element with placeholder text
		const formatElement = document.createElement(tagName);
		const placeholderText = getPlaceholderText(formatType);
		formatElement.textContent = placeholderText;

		// Insert at cursor position
		range.insertNode(formatElement);

		// Select the placeholder text so user can type over it
		const newRange = document.createRange();
		newRange.selectNodeContents(formatElement);

		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
			selection.addRange(newRange);
		}
	}

	/**
	 * Get placeholder text for a format type
	 */
	function getPlaceholderText(formatType: FormatType): string {
		switch (formatType) {
			case "bold":
				return "bold text";
			case "italic":
				return "italic text";
			case "strikethrough":
				return "strikethrough text";
			case "code":
				return "code";
			case "highlight":
				return "highlighted text";
			case "underline":
				return "underlined text";
			default:
				return "text";
		}
	}

	/**
	 * Toggle bold formatting (Ctrl+B)
	 */
	function toggleBold(): void {
		toggleFormat("bold");
	}

	/**
	 * Toggle italic formatting (Ctrl+I)
	 */
	function toggleItalic(): void {
		toggleFormat("italic");
	}

	/**
	 * Toggle strikethrough formatting (Ctrl+Shift+S)
	 */
	function toggleStrikethrough(): void {
		toggleFormat("strikethrough");
	}

	/**
	 * Toggle inline code formatting (Ctrl+E)
	 */
	function toggleInlineCode(): void {
		toggleFormat("code");
	}

	/**
	 * Toggle highlight formatting (Ctrl+Shift+H)
	 */
	function toggleHighlight(): void {
		toggleFormat("highlight");
	}

	/**
	 * Toggle underline formatting (Ctrl+U)
	 */
	function toggleUnderline(): void {
		toggleFormat("underline");
	}

	return {
		toggleBold,
		toggleItalic,
		toggleStrikethrough,
		toggleInlineCode,
		toggleHighlight,
		toggleUnderline
	};
}
