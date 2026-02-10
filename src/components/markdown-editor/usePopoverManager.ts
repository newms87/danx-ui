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
 * Base interface for popover show options. All popovers require a position and callbacks.
 */
interface PopoverShowOptionsBase<TSubmitArgs extends unknown[]> {
  position: PopoverPosition;
  onSubmit: (...args: TSubmitArgs) => void;
  onCancel: () => void;
}

/**
 * Return type for the core popover manager (shared state and methods)
 */
interface PopoverManagerCore<TShowOptions, TSubmitArgs extends unknown[]> {
  isVisible: Ref<boolean>;
  position: Ref<PopoverPosition>;
  show: (options: TShowOptions) => void;
  submit: (...args: TSubmitArgs) => void;
  cancel: () => void;
}

/**
 * Generic popover manager factory.
 *
 * Handles the shared pattern of visibility, position, callback storage, submit/cancel
 * lifecycle. An optional onShow hook lets specific popovers set extra state from options.
 */
function createPopoverManager<
  TShowOptions extends PopoverShowOptionsBase<TSubmitArgs>,
  TSubmitArgs extends unknown[],
>(onShow?: (options: TShowOptions) => void): PopoverManagerCore<TShowOptions, TSubmitArgs> {
  const isVisible = ref(false);
  const position = ref<PopoverPosition>({ x: 0, y: 0 });

  let onSubmitCallback: ((...args: TSubmitArgs) => void) | null = null;
  let onCancelCallback: (() => void) | null = null;

  function show(options: TShowOptions): void {
    position.value = options.position;
    onSubmitCallback = options.onSubmit;
    onCancelCallback = options.onCancel;
    onShow?.(options);
    isVisible.value = true;
  }

  function submit(...args: TSubmitArgs): void {
    isVisible.value = false;
    onSubmitCallback?.(...args);
    onSubmitCallback = null;
    onCancelCallback = null;
  }

  function cancel(): void {
    isVisible.value = false;
    onCancelCallback?.();
    onSubmitCallback = null;
    onCancelCallback = null;
  }

  return { isVisible, position, show, submit, cancel };
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
 * Composable for managing link popover state.
 *
 * Adds existingUrl and selectedText refs on top of the shared popover pattern.
 */
export function useLinkPopover(): UseLinkPopoverReturn {
  const existingUrl = ref<string | undefined>(undefined);
  const selectedText = ref<string | undefined>(undefined);

  const core = createPopoverManager<ShowLinkPopoverOptions, [url: string, label?: string]>(
    (options) => {
      existingUrl.value = options.existingUrl;
      selectedText.value = options.selectedText;
    }
  );

  return { ...core, existingUrl, selectedText };
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
 * Composable for managing table popover state.
 */
export function useTablePopover(): UseTablePopoverReturn {
  return createPopoverManager<ShowTablePopoverOptions, [rows: number, cols: number]>();
}
