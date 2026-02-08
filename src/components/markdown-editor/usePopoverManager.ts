import { ref, Ref } from "vue";
import { ShowLinkPopoverOptions } from "./useLinks";
import { ShowTablePopoverOptions } from "./useTables";

/**
 * Position for popovers (x, y coordinates in viewport)
 */
export interface PopoverPosition {
	x: number;
	y: number;
}

/**
 * Return type for useLinkPopover composable
 */
export interface UseLinkPopoverReturn {
	/** Whether the link popover is currently visible */
	isVisible: Ref<boolean>;
	/** Position of the popover in viewport coordinates */
	position: Ref<PopoverPosition>;
	/** Existing URL when editing an existing link */
	existingUrl: Ref<string | undefined>;
	/** Selected text for label preview */
	selectedText: Ref<string | undefined>;
	/** Show the link popover with given options */
	show: (options: ShowLinkPopoverOptions) => void;
	/** Handle submit from the popover */
	submit: (url: string, label?: string) => void;
	/** Handle cancel from the popover */
	cancel: () => void;
}

/**
 * Return type for useTablePopover composable
 */
export interface UseTablePopoverReturn {
	/** Whether the table popover is currently visible */
	isVisible: Ref<boolean>;
	/** Position of the popover in viewport coordinates */
	position: Ref<PopoverPosition>;
	/** Show the table popover with given options */
	show: (options: ShowTablePopoverOptions) => void;
	/** Handle submit from the popover */
	submit: (rows: number, cols: number) => void;
	/** Handle cancel from the popover */
	cancel: () => void;
}

/**
 * Composable for managing link popover state
 *
 * This extracts popover state management from the component level,
 * allowing the component to simply bind to refs and call methods.
 */
export function useLinkPopover(): UseLinkPopoverReturn {
	// Popover visibility state
	const isVisible = ref(false);

	// Popover position in viewport coordinates
	const position = ref<PopoverPosition>({ x: 0, y: 0 });

	// Existing URL when editing an existing link
	const existingUrl = ref<string | undefined>(undefined);

	// Selected text for label preview
	const selectedText = ref<string | undefined>(undefined);

	// Callbacks stored for submit/cancel - these are set when show() is called
	let onSubmitCallback: ((url: string, label?: string) => void) | null = null;
	let onCancelCallback: (() => void) | null = null;

	/**
	 * Show the link popover with the given options
	 */
	function show(options: ShowLinkPopoverOptions): void {
		position.value = options.position;
		existingUrl.value = options.existingUrl;
		selectedText.value = options.selectedText;
		onSubmitCallback = options.onSubmit;
		onCancelCallback = options.onCancel;
		isVisible.value = true;
	}

	/**
	 * Handle submit from the popover
	 */
	function submit(url: string, label?: string): void {
		isVisible.value = false;
		if (onSubmitCallback) {
			onSubmitCallback(url, label);
		}
		// Clear callbacks after use
		onSubmitCallback = null;
		onCancelCallback = null;
	}

	/**
	 * Handle cancel from the popover
	 */
	function cancel(): void {
		isVisible.value = false;
		if (onCancelCallback) {
			onCancelCallback();
		}
		// Clear callbacks after use
		onSubmitCallback = null;
		onCancelCallback = null;
	}

	return {
		isVisible,
		position,
		existingUrl,
		selectedText,
		show,
		submit,
		cancel
	};
}

/**
 * Composable for managing table popover state
 *
 * This extracts popover state management from the component level,
 * allowing the component to simply bind to refs and call methods.
 */
export function useTablePopover(): UseTablePopoverReturn {
	// Popover visibility state
	const isVisible = ref(false);

	// Popover position in viewport coordinates
	const position = ref<PopoverPosition>({ x: 0, y: 0 });

	// Callbacks stored for submit/cancel - these are set when show() is called
	let onSubmitCallback: ((rows: number, cols: number) => void) | null = null;
	let onCancelCallback: (() => void) | null = null;

	/**
	 * Show the table popover with the given options
	 */
	function show(options: ShowTablePopoverOptions): void {
		position.value = options.position;
		onSubmitCallback = options.onSubmit;
		onCancelCallback = options.onCancel;
		isVisible.value = true;
	}

	/**
	 * Handle submit from the popover
	 */
	function submit(rows: number, cols: number): void {
		isVisible.value = false;
		if (onSubmitCallback) {
			onSubmitCallback(rows, cols);
		}
		// Clear callbacks after use
		onSubmitCallback = null;
		onCancelCallback = null;
	}

	/**
	 * Handle cancel from the popover
	 */
	function cancel(): void {
		isVisible.value = false;
		if (onCancelCallback) {
			onCancelCallback();
		}
		// Clear callbacks after use
		onSubmitCallback = null;
		onCancelCallback = null;
	}

	return {
		isVisible,
		position,
		show,
		submit,
		cancel
	};
}
