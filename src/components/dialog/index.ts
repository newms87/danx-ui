/**
 * Dialog Component Module
 *
 * Exports:
 * - DanxDialog: The dialog component
 * - useDialog: Composable for managing dialog state
 * - Types: TypeScript interfaces
 */

export { default as DanxDialog } from "./DanxDialog.vue";
export { default as DialogBreadcrumbs } from "./DialogBreadcrumbs.vue";
export { useDialog } from "./useDialog";
export { useDialogStack } from "./useDialogStack";
export type { UseDialogReturn } from "./useDialog";
export type { DialogStackEntry, UseDialogStackReturn } from "./useDialogStack";
export type { DanxDialogEmits, DanxDialogProps, DanxDialogSlots } from "./types";
