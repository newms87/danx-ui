/**
 * Dialog Component Module
 *
 * Exports:
 * - DanxDialog: The dialog component
 * - useDialog: Composable for managing dialog state
 * - Types: TypeScript interfaces
 */

export { default as DanxDialog } from "./DanxDialog.vue";
export { useDialog } from "./useDialog";
export type { UseDialogReturn } from "./useDialog";
export type { DanxDialogEmits, DanxDialogProps, DanxDialogSlots } from "./types";
