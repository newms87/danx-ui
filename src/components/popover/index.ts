/**
 * Popover Component Module
 *
 * Exports:
 * - DanxPopover: Trigger-anchored floating panel using native Popover API
 * - Composables: usePopoverTrigger, usePopoverPositioning, useClickOutside, useEscapeKey
 * - Types: TypeScript interfaces
 */

export { default as DanxPopover } from "./DanxPopover.vue";
export { useClickOutside } from "../../shared/composables/useClickOutside";
export { useEscapeKey } from "./useEscapeKey";
export { usePopoverPositioning } from "../../shared/composables/usePopoverPositioning";
export type { UsePopoverPositioningReturn } from "../../shared/composables/usePopoverPositioning";
export { usePopoverTrigger } from "./usePopoverTrigger";
export type {
  DanxPopoverEmits,
  DanxPopoverProps,
  DanxPopoverSlots,
  PopoverPlacement,
  PopoverPosition,
  PopoverTrigger,
} from "./types";
