/**
 * Popover Component Module
 *
 * Exports:
 * - DanxPopover: Trigger-anchored floating panel component
 * - Composables: usePopoverPositioning, useClickOutside
 * - Types: TypeScript interfaces
 */

export { default as DanxPopover } from "./DanxPopover.vue";
export { useClickOutside } from "./useClickOutside";
export { usePopoverPositioning } from "./usePopoverPositioning";
export { usePopoverTrigger } from "./usePopoverTrigger";
export type { UsePopoverPositioningReturn } from "./usePopoverPositioning";
export type {
  DanxPopoverEmits,
  DanxPopoverProps,
  DanxPopoverSlots,
  PopoverPlacement,
  PopoverPosition,
  PopoverTrigger,
} from "./types";
