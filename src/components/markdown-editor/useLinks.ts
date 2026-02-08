import { Ref } from "vue";

/**
 * Position for link popover
 */
export interface LinkPopoverPosition {
	x: number;
	y: number;
}

/**
 * Options passed to the onShowLinkPopover callback
 */
export interface ShowLinkPopoverOptions {
	/** Position in viewport where popover should appear */
	position: LinkPopoverPosition;
	/** If editing an existing link, the current URL */
	existingUrl?: string;
	/** If text is selected, the selected text (for label preview) */
	selectedText?: string;
	/** Callback to complete the link insertion/update */
	onSubmit: (url: string, label?: string) => void;
	/** Callback to cancel the operation */
	onCancel: () => void;
}

/**
 * Options for useLinks composable
 */
export interface UseLinksOptions {
	contentRef: Ref<HTMLElement | null>;
	onContentChange: () => void;
	/** Callback to show the link popover UI */
	onShowLinkPopover?: (options: ShowLinkPopoverOptions) => void;
}

/**
 * Return type for useLinks composable
 */
export interface UseLinksReturn {
	/** Insert or edit a link at the current selection/cursor */
	insertLink: () => void;
	/** Check if cursor is inside a link */
	isInLink: () => boolean;
}

/**
 * Find the anchor element ancestor if one exists
 */
function findLinkAncestor(node: Node | null, contentRef: HTMLElement): HTMLAnchorElement | null {
	if (!node) return null;

	let current: Node | null = node;
	while (current && current !== contentRef) {
		if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === "A") {
			return current as HTMLAnchorElement;
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Dispatch an input event to trigger content sync
 */
function dispatchInputEvent(element: HTMLElement): void {
	element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/**
 * Get the cursor position in viewport coordinates
 */
function getCursorPosition(): LinkPopoverPosition {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) {
		return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	}

	const range = selection.getRangeAt(0);
	const rect = range.getBoundingClientRect();

	// If rect has no dimensions (collapsed cursor), use the start position
	if (rect.width === 0 && rect.height === 0) {
		return {
			x: rect.left || window.innerWidth / 2,
			y: rect.bottom || window.innerHeight / 2
		};
	}

	// Center horizontally on the selection, position below
	return {
		x: rect.left + (rect.width / 2),
		y: rect.bottom
	};
}

/**
 * Composable for link operations in markdown editor
 */
export function useLinks(options: UseLinksOptions): UseLinksReturn {
	const { contentRef, onContentChange, onShowLinkPopover } = options;

	// Store the selection range so we can restore it after popover interaction
	let savedRange: Range | null = null;

	/**
	 * Save the current selection for later restoration
	 */
	function saveSelection(): void {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			savedRange = selection.getRangeAt(0).cloneRange();
		}
	}

	/**
	 * Restore the previously saved selection
	 */
	function restoreSelection(): void {
		if (savedRange) {
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(savedRange);
		}
	}

	/**
	 * Check if the cursor is currently inside a link
	 */
	function isInLink(): boolean {
		if (!contentRef.value) return false;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return false;

		const range = selection.getRangeAt(0);
		return findLinkAncestor(range.startContainer, contentRef.value) !== null;
	}

	/**
	 * Insert a new link or edit an existing one
	 *
	 * Behavior:
	 * - If cursor is inside an existing link: show popover to edit URL (prefilled with current href)
	 * - If text is selected: show popover for URL, wrap selection in <a href="url">selection</a>
	 * - If no selection: show popover for URL and label, insert <a href="url">label</a>
	 * - If user cancels, do nothing
	 */
	function insertLink(): void {
		if (!contentRef.value) return;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		const range = selection.getRangeAt(0);

		// Check if selection is within our content area
		if (!contentRef.value.contains(range.startContainer)) return;

		// Save the selection before showing popover
		saveSelection();

		// Check if cursor is inside an existing link
		const existingLink = findLinkAncestor(range.startContainer, contentRef.value);

		if (existingLink) {
			showEditLinkPopover(existingLink);
		} else if (!range.collapsed) {
			showWrapSelectionPopover(range);
		} else {
			showNewLinkPopover(range);
		}
	}

	/**
	 * Show popover to edit an existing link
	 */
	function showEditLinkPopover(link: HTMLAnchorElement): void {
		const currentHref = link.getAttribute("href") || "";
		const position = getCursorPosition();

		if (onShowLinkPopover) {
			onShowLinkPopover({
				position,
				existingUrl: currentHref,
				selectedText: link.textContent || undefined,
				onSubmit: (url: string) => {
					restoreSelection();
					completeEditLink(link, url);
				},
				onCancel: () => {
					restoreSelection();
					contentRef.value?.focus();
				}
			});
		} else {
			// Fallback to window.prompt if no popover callback provided
			const newUrl = window.prompt("Edit link URL:", currentHref);
			if (newUrl === null) return;
			completeEditLink(link, newUrl);
		}
	}

	/**
	 * Complete editing an existing link
	 */
	function completeEditLink(link: HTMLAnchorElement, url: string): void {
		if (url.trim() === "") {
			unwrapLink(link);
		} else {
			link.setAttribute("href", url.trim());
		}

		dispatchInputEvent(contentRef.value!);
		onContentChange();
		contentRef.value?.focus();
	}

	/**
	 * Unwrap a link, keeping its text content
	 */
	function unwrapLink(link: HTMLAnchorElement): void {
		const parent = link.parentNode;
		if (!parent) return;

		// Move all children out of the link
		while (link.firstChild) {
			parent.insertBefore(link.firstChild, link);
		}

		// Remove the empty link element
		parent.removeChild(link);
	}

	/**
	 * Show popover to wrap selected text in a link
	 */
	function showWrapSelectionPopover(range: Range): void {
		const selectedText = range.toString();
		const position = getCursorPosition();

		if (onShowLinkPopover) {
			onShowLinkPopover({
				position,
				selectedText,
				onSubmit: (url: string) => {
					restoreSelection();
					completeWrapSelection(url);
				},
				onCancel: () => {
					restoreSelection();
					contentRef.value?.focus();
				}
			});
		} else {
			// Fallback to window.prompt if no popover callback provided
			const url = window.prompt("Enter link URL:");
			if (!url || url.trim() === "") return;
			completeWrapSelection(url);
		}
	}

	/**
	 * Complete wrapping selection in a link
	 */
	function completeWrapSelection(url: string): void {
		if (!url || url.trim() === "") {
			contentRef.value?.focus();
			return;
		}

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) {
			contentRef.value?.focus();
			return;
		}

		const range = selection.getRangeAt(0);

		// Create the link element
		const link = document.createElement("a");
		link.setAttribute("href", url.trim());
		link.setAttribute("target", "_blank");
		link.setAttribute("rel", "noopener noreferrer");

		// Extract and wrap the selection
		const contents = range.extractContents();
		link.appendChild(contents);
		range.insertNode(link);

		// Select the link contents
		const newRange = document.createRange();
		newRange.selectNodeContents(link);
		selection.removeAllRanges();
		selection.addRange(newRange);

		dispatchInputEvent(contentRef.value!);
		onContentChange();
		contentRef.value?.focus();
	}

	/**
	 * Show popover to insert a new link (URL and label)
	 */
	function showNewLinkPopover(_range: Range): void {
		const position = getCursorPosition();

		if (onShowLinkPopover) {
			onShowLinkPopover({
				position,
				onSubmit: (url: string, label?: string) => {
					restoreSelection();
					completeNewLink(url, label);
				},
				onCancel: () => {
					restoreSelection();
					contentRef.value?.focus();
				}
			});
		} else {
			// Fallback to window.prompt if no popover callback provided
			const url = window.prompt("Enter link URL:");
			if (!url || url.trim() === "") return;
			completeNewLink(url);
		}
	}

	/**
	 * Complete inserting a new link
	 */
	function completeNewLink(url: string, label?: string): void {
		if (!url || url.trim() === "") {
			contentRef.value?.focus();
			return;
		}

		const trimmedUrl = url.trim();
		const linkText = label?.trim() || trimmedUrl;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) {
			contentRef.value?.focus();
			return;
		}

		const range = selection.getRangeAt(0);

		// Create the link element
		const link = document.createElement("a");
		link.setAttribute("href", trimmedUrl);
		link.setAttribute("target", "_blank");
		link.setAttribute("rel", "noopener noreferrer");
		link.textContent = linkText;

		// Insert at cursor position
		range.insertNode(link);

		// Select the link contents
		const newRange = document.createRange();
		newRange.selectNodeContents(link);
		selection.removeAllRanges();
		selection.addRange(newRange);

		dispatchInputEvent(contentRef.value!);
		onContentChange();
		contentRef.value?.focus();
	}

	return {
		insertLink,
		isInLink
	};
}
